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
        const hmac = crypto.createHmac('sha256', secret);
        const digest = hmac.update(rawBody).digest('hex');
        // Use timingSafeEqual to prevent timing attacks
        const signatureBuffer = Buffer.from(signature);
        const digestBuffer = Buffer.from(digest);
        
        if (signatureBuffer.length !== digestBuffer.length || !crypto.timingSafeEqual(signatureBuffer, digestBuffer)) {
            console.error("Invalid Creem signature");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
    } else if (process.env.NODE_ENV === 'production' && !secret) {
        console.warn("CREEM_WEBHOOK_SECRET is not set. Skipping signature verification (UNSAFE).");
    }

    const body = JSON.parse(rawBody);
    console.log("Creem Webhook received:", JSON.stringify(body));

    // Extract user info. Adjust these paths based on actual Creem payload structure.
    // Common structures: body.email, body.payload.email, body.data.object.email
    // Based on test event: body.object.customer.email, body.object.metadata.user_id
    const email = body.email || body.payload?.email || body.object?.customer?.email || body.data?.email || body.customer_email;
    const userId = body.metadata?.user_id || body.payload?.metadata?.user_id || body.object?.metadata?.user_id || body.custom_fields?.user_id;
    
    // Determine credits based on amount
    const amount = body.amount || body.payload?.amount || body.object?.order?.amount || body.data?.amount;
    let creditsToAdd = 1;
    if (amount) {
        const val = parseFloat(amount);
        // If amount > 2500 (cents) or 25 (dollars), assume it's the $29.90 pack
        // Creem usually sends cents, so 2990.
        if (val > 2500 || (val > 25 && val < 100)) {
            creditsToAdd = 3;
        }
    }

    if (!email && !userId) {
        console.error("Webhook: No email or userId found in payload");
        return NextResponse.json({ error: "No identifier found" }, { status: 400 });
    }

    const db = getDb();
    let targetUserId = userId;

    // If we only have email, lookup user_id
    if (!targetUserId && email) {
        const userRes = await db.query("SELECT user_id FROM user_info WHERE email = $1", [email]);
        if (userRes.rows.length > 0) {
            targetUserId = userRes.rows[0].user_id;
        }
    }

    if (targetUserId) {
        // Upsert credit record
        const creditRes = await db.query("SELECT * FROM user_available WHERE user_id = $1", [targetUserId]);
        
        if (creditRes.rows.length === 0) {
             await db.query("INSERT INTO user_available(user_id, available_times) VALUES($1, $2)", [targetUserId, creditsToAdd]);
        } else {
             await db.query("UPDATE user_available SET available_times = available_times + $2 WHERE user_id = $1", [targetUserId, creditsToAdd]);
        }

        // Log transaction
        await db.query(
            "INSERT INTO credit_logs(user_id, amount, type, description) VALUES($1, $2, 'purchase', 'Creem Payment')"
            , [targetUserId, creditsToAdd]
        );
        
        console.log(`Successfully credited ${creditsToAdd} points to user ${targetUserId}`);
    } else {
        console.warn(`User not found for email ${email}. Payment received but not credited.`);
        // Optional: Insert into a 'pending_credits' table to claim later?
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
