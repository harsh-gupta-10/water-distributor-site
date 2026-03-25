# A3 Distributors

A3 Distributors is a water and beverage distribution site i made for my freind and its has built-in admin dashboard. The same app powers the public website, quotation flow, and internal business tools, so the storefront and back office stay in sync.

## Run It Locally

```bash
npm install
npm run dev
```

Build for production with:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## What This App Does

- Shows the public site with products, services, blog posts, FAQs, and contact options
- Lets customers request quotations for bulk orders
- Gives the team an admin area for orders, invoices, customers, products, and analytics
- Uses Supabase for authentication and database storage

## Tech Stack

- React 19
- React Router 7
- Vite
- Supabase
- Lucide icons
- Custom CSS

## Project Layout

- `src/components/` for public-facing UI pieces
- `src/admin/` for the dashboard and admin pages
- `src/data/` for site content, product data, and config
- `src/lib/` for shared helpers and the Supabase client
- `src/styles/` for global and page-specific CSS

If you need to understand the site quickly, start with the feature docs. If you need to change the UI, check the design notes first.
