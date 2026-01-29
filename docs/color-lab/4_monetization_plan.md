# Product Monetization & Admin Plan (Draft)

## Goal
Transform the Color Analysis reports into a monetization engine by recommending specific, shoppable makeup products (Affiliate Marketing).

## Phase 1: Database Schema
Create a `recommended_products` table to store curated items.

```sql
create table recommended_products (
  id uuid primary key default uuid_generate_v4(),
  season varchar not null, -- e.g. "Light Spring"
  category varchar not null, -- "Lipstick", "Blush", "Eye"
  brand varchar,
  name varchar,
  shade varchar,
  affiliate_link varchar not null,
  image_url varchar, -- Product thumbnail
  price_range varchar, -- "$", "$$", "$$$"
  created_at timestamp with time zone default now()
);
```

## Phase 2: Admin Dashboard (`/admin/products`)
A simple internal tool for easy product entry.

**Features:**
1.  **Input Form**:
    *   Amazon URL (Required)
    *   Season (Dropdown: 12 Seasons)
    *   Category (Dropdown)
2.  **Auto-Fetch Mechanism**:
    *   Use `open-graph-scraper` or Amazon PA-API to fetch:
        *   Product Title
        *   Product Image (High Res)
    *   Fallback: Manual entry if fetch fails.
3.  **Preview & Edit**: Allow editing the fetched title/image before saving.
4.  **List View**: Manage existing recommendations.

## Phase 3: Frontend Integration
Update the Report Page (`src/app/[locale]/report/[id]/PageComponent.tsx`) to display these products dynamically.

**Logic:**
*   **Query**: When report loads, fetch products `WHERE season = report.season`.
*   **UI**: Replace the generic "Brand Matches" list with a "Shop Your Perfect Shade" carousel.
*   **Click**: Opens the `affiliate_link` in a new tab.

## Phase 4: Traffic & Content Strategy (Immediate Priority)
Before building the admin tool, focus on driving traffic to the existing product.

1.  **Social Content**:
    *   "Virtual Draping" comparison videos (TikTok/Reels).
    *   "Expectation vs Reality" using the Color Fan feature.
2.  **SEO**:
    *   Create landing pages for each season (e.g., `/season/deep-winter`) showing the curated products (even if hardcoded initially).
3.  **Community**:
    *   Share reports on Reddit r/coloranalysis.

---
*Status: Paused. Focusing on Traffic Generation first.*
