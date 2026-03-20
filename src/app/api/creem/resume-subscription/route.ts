import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const db = getDb();
        const userRes = await db.query("SELECT subscription_id FROM user_available WHERE user_id = $1", [userId]);
        
        if (userRes.rowCount === 0 || !userRes.rows[0].subscription_id) {
            return NextResponse.json({ error: "No active or scheduled cancellation subscription found" }, { status: 404 });
        }

        const subscriptionId = userRes.rows[0].subscription_id;

        // Call Creem API to resume subscription
        const apiKey = process.env.CREEM_API_KEY;
        const isTestMode = process.env.NODE_ENV !== 'production';
        const apiBase = isTestMode ? "https://test-api.creem.io" : "https://api.creem.io";

        const response = await fetch(`${apiBase}/v1/subscriptions/${subscriptionId}/resume`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey!,
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Creem Resume Error:", data);
            return NextResponse.json({ error: data.message?.[0] || "Failed to resume subscription" }, { status: response.status });
        }

        // Update local database status back to active
        await db.query(
            "UPDATE user_available SET subscription_status = 'active' WHERE user_id = $1",
            [userId]
        );

        return NextResponse.json({ success: true, message: "Subscription resumed successfully" });
    } catch (error: any) {
        console.error("Resume Subscription Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
