import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, tier, billingCycle } = body;

        if (!userId || !tier || !billingCycle) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        const db = getDb();
        const userRes = await db.query("SELECT subscription_id FROM user_available WHERE user_id = $1", [userId]);
        
        if (userRes.rowCount === 0 || !userRes.rows[0].subscription_id) {
            return NextResponse.json({ error: "No active subscription found to update" }, { status: 404 });
        }

        const subscriptionId = userRes.rows[0].subscription_id;

        // Resolve Product ID based on requested tier and cycle
        let targetProductId = "";
        if (tier === 'standard') {
            targetProductId = billingCycle === 'monthly' 
                ? (process.env.CREEM_PRODUCT_STANDARD_MONTHLY || process.env.NEXT_PUBLIC_CREEM_STD_MONTHLY || "")
                : (process.env.CREEM_PRODUCT_STANDARD_YEARLY || process.env.NEXT_PUBLIC_CREEM_STD_YEARLY || "");
        } else if (tier === 'pro') {
            targetProductId = billingCycle === 'monthly' 
                ? (process.env.CREEM_PRODUCT_PRO_MONTHLY || process.env.NEXT_PUBLIC_CREEM_PRO_MONTHLY || "")
                : (process.env.CREEM_PRODUCT_PRO_YEARLY || process.env.NEXT_PUBLIC_CREEM_PRO_YEARLY || "");
        }

        if (!targetProductId) {
            return NextResponse.json({ error: "Could not resolve target product ID" }, { status: 400 });
        }

        // Call Creem API to upgrade/update subscription
        const apiKey = process.env.CREEM_API_KEY;
        const isTestMode = process.env.NODE_ENV !== 'production';
        const apiBase = isTestMode ? "https://test-api.creem.io" : "https://api.creem.io";

        const payload = {
            product_id: targetProductId,
            update_behavior: "proration-charge-immediately" // For upgrades, charge difference immediately
        };

        const response = await fetch(`${apiBase}/v1/subscriptions/${subscriptionId}/upgrade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey!,
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Creem Update Error:", response.status, data);
            return NextResponse.json({ 
                error: data.message?.[0] || "Failed to update subscription",
                details: data
            }, { status: response.status });
        }

        // Update local database immediately for instant UI feedback
        // The webhook will handle the actual credit top-up
        await db.query(
            `UPDATE user_available SET 
                subscription_plan = $2, 
                subscription_billing_cycle = $3 
             WHERE user_id = $1`,
            [userId, tier, billingCycle]
        );

        return NextResponse.json({ success: true, message: "Subscription updated successfully" });

    } catch (error: any) {
        console.error("Update Subscription Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
