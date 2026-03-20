import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("Checkout Request Body:", body);
        const { productId, tier, pack, email, successUrl, billingCycle } = body;

        if (!email) {
            return NextResponse.json({ error: "Missing email" }, { status: 400 });
        }

        let finalProductId = productId;

        // If productId is not provided, resolve it based on tier/pack and billingCycle
        if (!finalProductId) {
            if (tier) {
                if (tier === 'standard') {
                    finalProductId = billingCycle === 'monthly' 
                        ? (process.env.CREEM_PRODUCT_STANDARD_MONTHLY || process.env.NEXT_PUBLIC_CREEM_STD_MONTHLY)
                        : (process.env.CREEM_PRODUCT_STANDARD_YEARLY || process.env.NEXT_PUBLIC_CREEM_STD_YEARLY);
                } else if (tier === 'pro') {
                    finalProductId = billingCycle === 'monthly' 
                        ? (process.env.CREEM_PRODUCT_PRO_MONTHLY || process.env.NEXT_PUBLIC_CREEM_PRO_MONTHLY)
                        : (process.env.CREEM_PRODUCT_PRO_YEARLY || process.env.NEXT_PUBLIC_CREEM_PRO_YEARLY);
                }
            } else if (pack) {
                if (pack === 'starter') {
                    finalProductId = process.env.CREEM_PRODUCT_STARTER || process.env.NEXT_PUBLIC_CREEM_PACK_STARTER;
                } else if (pack === 'plus') {
                    finalProductId = process.env.CREEM_PRODUCT_PLUS || process.env.NEXT_PUBLIC_CREEM_PACK_PLUS;
                }
            }
        }

        if (!finalProductId) {
            console.error("Could not resolve productId:", { tier, pack, billingCycle });
            return NextResponse.json({ error: "Missing or invalid product parameters" }, { status: 400 });
        }

        // 1. 获取内部 User ID
        const db = getDb();
        const userRes = await db.query("SELECT user_id FROM user_info WHERE email = $1", [email]);
        if (userRes.rowCount === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });
        const userId = userRes.rows[0].user_id;

        // 2. 调用 Creem API 创建 Checkout Session
        const apiKey = process.env.CREEM_API_KEY;
        if (!apiKey) {
            console.error("CREEM_API_KEY is not configured");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const isTestMode = process.env.NODE_ENV !== 'production';
        const apiBase = isTestMode ? "https://test-api.creem.io" : "https://api.creem.io";

        const payload = {
            product_id: finalProductId, // Use snake_case as expected by Creem
            success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment_success=true`,
            customer: { email },
            metadata: { 
                referenceId: userId,
                billingCycle: billingCycle,
                plan: tier || pack 
            }
        };

        console.log("Creem API Payload:", JSON.stringify(payload));

        const response = await fetch(`${apiBase}/v1/checkouts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Creem API Error:", response.status, data);
            return NextResponse.json({ 
                error: data.message?.[0] || "Failed to create checkout",
                details: data
            }, { status: response.status });
        }

        return NextResponse.json({ url: data.checkout_url || data.url }); // Adjust based on actual response field
    } catch (error: any) {
        console.error("Checkout Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
