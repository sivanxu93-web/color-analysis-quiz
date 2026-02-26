import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { productId, metadata, successUrl, discountCode } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const apiKey = process.env.CREEM_API_KEY;
    if (!apiKey) {
      console.error("CREEM_API_KEY is not configured");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Determine API URL based on environment or key prefix
    // Document says: If test mode, use test-api.creem.io
    // We can infer test mode if NODE_ENV is not production OR if key starts with certain prefix?
    // Let's rely on explicit env var or NODE_ENV.
    const isTestMode = process.env.NODE_ENV !== 'production';
    const apiUrl = isTestMode ? "https://test-api.creem.io/v1/checkouts" : "https://api.creem.io/v1/checkouts";

    const payload: any = {
      product_id: productId,
      success_url: successUrl,
      metadata: metadata || {},
      customer: {
          email: metadata?.email
      }
    };

    if (discountCode) {
        payload.discount_code = discountCode;
    }

    console.log("Creating Creem Checkout:", apiUrl, JSON.stringify(payload));

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Creem API Error:", response.status, errorData);
      
      const message = errorData.message?.[0] || "Failed to create checkout session";
      
      if (message === "Discount not found") {
          return NextResponse.json({ 
              error: "Invalid discount code", 
              details: "The coupon code '"+ discountCode +"' does not exist in your Creem dashboard." 
          }, { status: 400 });
      }

      return NextResponse.json({ error: "Checkout failed", details: message }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ checkout_url: data.checkout_url });

  } catch (error: any) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
