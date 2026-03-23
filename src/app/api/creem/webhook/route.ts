import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("creem-signature");
    const secret = process.env.CREEM_WEBHOOK_SECRET;

    // Verify Signature
    if (secret && signature) {
      const hmac = crypto.createHmac("sha256", secret);
      const digest = hmac.update(rawBody).digest("hex");
      // Use timingSafeEqual to prevent timing attacks
      const signatureBuffer = Buffer.from(signature);
      const digestBuffer = Buffer.from(digest);

      if (
        signatureBuffer.length !== digestBuffer.length ||
        !crypto.timingSafeEqual(signatureBuffer, digestBuffer)
      ) {
        console.error("Invalid Creem signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
    } else if (process.env.NODE_ENV === "production" && !secret) {
      console.warn(
        "CREEM_WEBHOOK_SECRET is not set. Skipping signature verification (UNSAFE).",
      );
    }

    const body = JSON.parse(rawBody);
    console.log("Creem Webhook received:", JSON.stringify(body));

    const eventType = body.eventType;
    const object = body.object;

    // Extract user info
    const email =
      body.email ||
      body.payload?.email ||
      object?.customer?.email ||
      body.data?.email ||
      body.customer_email;
    const userId =
      body.metadata?.user_id ||
      body.payload?.metadata?.user_id ||
      object?.metadata?.user_id ||
      object?.metadata?.referenceId ||
      body.custom_fields?.user_id;
    const plan =
      body.metadata?.plan ||
      body.payload?.metadata?.plan ||
      object?.metadata?.plan ||
      body.custom_fields?.plan;
    const billingCycle =
      body.metadata?.billingCycle ||
      body.payload?.metadata?.billingCycle ||
      object?.metadata?.billingCycle ||
      body.custom_fields?.billingCycle;

    if (!email && !userId) {
      console.error("Webhook: No email or userId found in payload");
      return NextResponse.json(
        { error: "No identifier found" },
        { status: 400 },
      );
    }

    const db = getDb();
    let targetUserId = userId;

    // If we only have email, lookup user_id
    if (!targetUserId && email) {
      const userRes = await db.query(
        "SELECT user_id FROM user_info WHERE email = $1",
        [email],
      );
      if (userRes.rows.length > 0) {
        targetUserId = userRes.rows[0].user_id;
      }
    }

    if (!targetUserId) {
      console.warn(
        `User not found for email ${email}. Payment received but not credited.`,
      );
      return NextResponse.json({ success: true, message: "User not found" });
    }

    // Determine credits based on amount or metadata
    const amount =
      body.amount ||
      body.payload?.amount ||
      object?.order?.amount ||
      body.data?.amount ||
      object?.amount;
    const amountVal = amount ? parseFloat(amount) : 0;
    const isRecurring =
      object?.order?.type === "recurring" ||
      !!object?.subscription ||
      eventType.startsWith("subscription.");

    let creditsToAdd = 0;
    let isSubscriptionPayment = false;

    // Credit Mapping based on plan or amount (cents)
    // Standard: 120 (1290 monthly, 8280 yearly)
    // Pro: 500 (2990 monthly, 19080 yearly)
    // Starter: 30 (890)
    // Plus: 60 (1490)

    if (eventType === "checkout.completed" && !isRecurring) {
      // One-time purchase (Packs)
      if (plan === "starter" || amountVal === 890) {
        creditsToAdd = 50;
      } else if (plan === "plus" || amountVal === 1490) {
        creditsToAdd = 100;
      } else if (plan === "standard") {
        creditsToAdd = 120; // Some one-time plans might exist
      } else if (plan === "pro") {
        creditsToAdd = 500;
      } else if (amountVal >= 2500) {
        creditsToAdd = 500;
      } else if (amountVal >= 800) {
        creditsToAdd = 120;
      }
    } else if (eventType === "subscription.paid") {
      // Subscription payment (initial or renewal)
      isSubscriptionPayment = true;

      if (plan === "pro" || amountVal >= 2500 || amountVal > 15000) {
        creditsToAdd = 500;
      } else {
        // Default to Standard for subscription
        creditsToAdd = 120;
      }
    }

    // Update subscription info if available
    const subscriptionId =
      object?.subscription?.id ||
      (eventType.startsWith("subscription.") ? object?.id : null);
    const subscriptionStatus = object?.subscription?.status || object?.status;
    const creemCustomerId = object?.customer?.id;
    const currentPeriodEnd =
      object?.subscription?.current_period_end_date ||
      object?.current_period_end_date;

    // Perform database updates
    if (creditsToAdd > 0) {
      const creditRes = await db.query(
        "SELECT * FROM user_available WHERE user_id = $1",
        [targetUserId],
      );

      if (creditRes.rows.length === 0) {
        await db.query(
          "INSERT INTO user_available(user_id, available_times, subscription_credits, permanent_credits, subscription_id, subscription_status, subscription_plan, subscription_billing_cycle, creem_customer_id, current_period_end) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
          [
            targetUserId,
            creditsToAdd,
            isSubscriptionPayment ? creditsToAdd : 0,
            isSubscriptionPayment ? 0 : creditsToAdd,
            subscriptionId,
            subscriptionStatus,
            plan || (creditsToAdd >= 500 ? "pro" : "standard"),
            isSubscriptionPayment ? billingCycle || "monthly" : null,
            creemCustomerId,
            currentPeriodEnd,
          ],
        );
      } else {
        // Update both the total (for legacy) and the split credits
        const creditColumn = isSubscriptionPayment
          ? "subscription_credits"
          : "permanent_credits";
        await db.query(
          `UPDATE user_available SET 
                    available_times = available_times + $2, 
                    ${creditColumn} = COALESCE(${creditColumn}, 0) + $2, 
                    subscription_id = COALESCE($3, subscription_id),
                    subscription_status = COALESCE($4, subscription_status),
                    subscription_plan = COALESCE($5, subscription_plan),
                    subscription_billing_cycle = COALESCE($6, subscription_billing_cycle),
                    creem_customer_id = COALESCE($7, creem_customer_id),
                    current_period_end = COALESCE($8, current_period_end)
                  WHERE user_id = $1`,
          [
            targetUserId,
            creditsToAdd,
            subscriptionId,
            subscriptionStatus,
            isSubscriptionPayment
              ? plan || (creditsToAdd >= 500 ? "pro" : "standard")
              : null,
            isSubscriptionPayment ? billingCycle || "monthly" : null,
            creemCustomerId,
            currentPeriodEnd,
          ],
        );
      }

      // Log transaction
      await db.query(
        "INSERT INTO credit_logs(user_id, amount, type, description) VALUES($1, $2, 'purchase', $3)",
        [
          targetUserId,
          creditsToAdd,
          `Creem ${isSubscriptionPayment ? "Subscription" : "Purchase"}: ${eventType}`,
        ],
      );

      console.log(
        `Successfully credited ${creditsToAdd} ${isSubscriptionPayment ? "subscription" : "permanent"} points to user ${targetUserId}`,
      );
    } else if (subscriptionId) {
      // Just update subscription status for non-payment events (e.g., subscription.active, subscription.update)
      await db.query(
        `UPDATE user_available SET 
                subscription_status = $2,
                current_period_end = COALESCE($3, current_period_end),
                subscription_id = COALESCE($4, subscription_id),
                subscription_plan = COALESCE($5, subscription_plan),
                subscription_billing_cycle = COALESCE($6, subscription_billing_cycle)
             WHERE user_id = $1`,
        [
          targetUserId,
          subscriptionStatus,
          currentPeriodEnd,
          subscriptionId,
          plan,
          billingCycle,
        ],
      );
      console.log(
        `Updated subscription status for user ${targetUserId} to ${subscriptionStatus}`,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
