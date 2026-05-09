# Hishabi MVP Frontend

This is the Next.js frontend for the Hishabi MVP.

It provides a mobile-first seller dashboard for products, customers, orders, seller plans, product image management, and dashboard summary.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS

## Run Frontend

From this folder:

npm run dev

Open:

http://localhost:3000

If port 3000 is already running, Next.js may show another available port or the active process.

## Build

npm run build

## Main Structure

app/page.tsx
components/HishabiDashboard.tsx
components/dashboard/
components/seller/
components/products/
components/customers/
components/orders/
components/plan/
lib/api.ts
types.ts

## Current Frontend Features

- Global Seller ID sync
- Dashboard summary
- Seller helper
- Products CRUD
- Product image upload during product create
- Product image gallery
- Product image delete
- Customers CRUD
- Orders CRUD, detail, and status update
- Plan management
- Mobile-first buttons and forms
- Loading and empty states

## Mobile-first UX Rules

Most target sellers will use phones, so every feature should remain easy to use on mobile.

Important rules:
- Buttons should be tappable.
- Forms should be readable on small screens.
- Copy buttons should be easy to tap.
- Edit/delete actions should be clear.
- Image upload should work smoothly on mobile.
- Product, customer, order, and plan workflows should work on phone, tablet, laptop, and desktop.

## API Base URL

Frontend API helpers are in:

lib/api.ts

During local development, the backend runs on:

http://127.0.0.1:8003

## Security

Do not expose backend secrets in frontend code.

Never put Supabase service role keys in frontend code or .env.local.
