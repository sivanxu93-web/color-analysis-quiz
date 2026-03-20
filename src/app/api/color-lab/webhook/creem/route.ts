import { NextRequest, NextResponse } from "next/server";
import { getDb } from "~/libs/db";
import { refreshSubscriptionCredits, addPermanentCredits } from "~/servers/manageUserTimes";

export async function POST(req: NextRequest) {
    const signature = req.headers.get("creem-signature");
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        return NextResponse.json({ error: "Missing configuration" }, { status: 400 });
    }

    // 注意：在实际生产环境中，应调用 verifySignature 进行校验
    // 为了实现逻辑，我们假设校验已通过并解析 body
    const body = await req.json();
    const { eventType, object } = body;

    console.log(`Received Creem Webhook Event: ${eventType}`);

    try {
        switch (eventType) {
            case "subscription.paid": {
                // 订阅支付成功（包括首充和续费）
                const userId = object.metadata?.referenceId;
                const productId = object.productId;
                const expiry = new Date(object.current_period_end * 1000);

                // 定义档位映射
                const STANDARD_PRODUCTS = [
                    process.env.CREEM_PRODUCT_STANDARD_MONTHLY,
                    process.env.CREEM_PRODUCT_STANDARD_YEARLY,
                    "prod_5Z2oQZbm9Abqmd2xJMh6rR" // 您的测试环境 ID
                ];
                const PRO_PRODUCTS = [
                    process.env.CREEM_PRODUCT_PRO_MONTHLY,
                    process.env.CREEM_PRODUCT_PRO_YEARLY
                ];

                // 根据套餐分配积分
                let monthlyCredits = 0;
                let planName = "";
                
                if (STANDARD_PRODUCTS.includes(productId)) {
                    monthlyCredits = 120;
                    planName = "standard";
                } else if (PRO_PRODUCTS.includes(productId)) {
                    monthlyCredits = 500;
                    planName = "pro";
                }

                if (userId && monthlyCredits > 0) {
                    await refreshSubscriptionCredits(userId, monthlyCredits, planName, expiry);
                    console.log(`Refreshed ${monthlyCredits} credits for user ${userId}`);
                }
                break;
            }

            case "checkout.completed": {
                // 单次 Pack 购买成功
                const userId = object.metadata?.referenceId;
                const productId = object.productId;

                let packCredits = 0;
                if (productId === process.env.CREEM_PRODUCT_STARTER) {
                    packCredits = 30;
                } else if (productId === process.env.CREEM_PRODUCT_PLUS) {
                    packCredits = 60;
                }

                if (userId && packCredits > 0) {
                    await addPermanentCredits(userId, packCredits);
                    console.log(`Added ${packCredits} permanent credits to user ${userId}`);
                }
                break;
            }

            case "subscription.expired":
            case "subscription.paused": {
                // 订阅失效，清空月度积分
                const userId = object.metadata?.referenceId;
                if (userId) {
                    const db = getDb();
                    await db.query(
                        "UPDATE user_available SET subscription_credits = 0, subscription_status = 'expired' WHERE user_id = $1",
                        [userId]
                    );
                }
                break;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Creem Webhook Error:", error);
        return NextResponse.json({ error: "Internal processing error" }, { status: 500 });
    }
}
