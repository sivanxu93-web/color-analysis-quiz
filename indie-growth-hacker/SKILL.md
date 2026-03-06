---
name: indie-growth-hacker
description: Workflows for maximizing traffic and conversion for indie SaaS projects. Use when the user wants to optimize SEO, set up programmatic content (pSEO), build automated discount/recovery loops, or generate marketing copy for Reddit and Google Ads.
---

# Indie Growth Hacker Skill

This skill provides a standardized workflow for independent developers to turn codebases into traffic-generating and high-converting products.

## Core Workflows

### 1. Programmatic SEO (pSEO) Management
When adding example reports or data-driven landing pages:
- **Centralize Data**: Store all metadata (slugs, UUIDs, headlines, image URLs) in `src/libs/examples.ts`.
- **Sync Sitemap**: Ensure `src/app/sitemap.ts` dynamically reads from the centralized data to include all new URLs automatically.
- **Intent Segmentation**: Categorize examples (e.g., by "Season" or "Category") to create group-specific landing pages at `/examples`.

### 2. High-Conversion Checkout Loops
To maximize the value of every visitor:
- **Coupon Persistence**: Always capture `?coupon=...` from the URL in `CommonContext` and save it to `localStorage`.
- **Seamless Discounting**: In the checkout API (e.g., Creem/Stripe), check for the saved coupon and apply it automatically so the user sees the discounted price immediately.
- **Price Transparency**: Update pricing UI (`PricingContent.tsx`) to show the strike-through original price and the active discounted price when a coupon is detected.

### 3. Precision Email Recovery (Cron)
When setting up abandoned cart/session recovery:
- **Personalized Hooks**: Use the user's specific result (e.g., their "Season") in the email subject and H1.
- **Frictionless Links**: Send links that already include the coupon parameter (e.g., `/report/[id]?coupon=RECALL50`).
- **Batch Processing**: Implement batching logic (`?batch=1&limit=82`) to stay within free email tier limits (Resend/SendGrid) and avoid spam filters.

### 4. Traffic Capture Strategy
- **Reddit Infiltration**: Write replies that provide objective value first (using "Data-driven results" or "Second opinions"), offer a private report link, and explicitly mention a privacy/deletion clause to build community trust.
- **Google Ads "Bottom-Feeding"**: Focus on long-tail comparison keywords (`[X] vs [Y]`) and high-intent quiz terms with low CPC. Use landing page URLs that auto-apply coupons.

## Technical Standards
- Always use `export const dynamic = 'force-dynamic'` for API routes that rely on secret environment variables or database connections to prevent build failures.
- Implement database null checks in `getDb()` to allow the build process to complete even when CI environment variables are missing.
