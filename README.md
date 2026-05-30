# Hishabi MVP

Hishabi is a mobile-first AI-powered F-commerce seller assistant for online sellers.

The current MVP is the seller dashboard and control center. It helps sellers manage products, customers, orders, seller plans, product images, and sales summary. This dashboard is the foundation for the future AI moderator/sales assistant that will read customer messages, understand order intent, match products, create order drafts, help reply to customers, and support payment/courier workflows later.

## Current MVP Features

### Dashboard and Seller
- Global Seller ID sync across Dashboard, Products, Customers, Orders, and Plan sections.
- Seller helper section.
- Dashboard summary for products, customers, orders, sales, average order value, and order status counts.
- Seller-wise filtering.

### Products
- Product create, read, update, delete.
- Product search/filter.
- Product image upload during product creation.
- Product image gallery.
- Delete individual product images.
- Main product image refreshes after image delete.
- Plan product limits:
  - Free: 10 products
  - Starter: 50 products
  - Max: unlimited products
- Plan image limits:
  - Free: 3 images per product
  - Starter: 10 images per product
  - Max: 10 images per product

### Customers
- Customer create, read, update, delete.
- Customer phone, address, Facebook ID, and WhatsApp number.
- Customer search/filter.

### Orders
- Order create, read, update, delete.
- Seller-specific customer/product dropdowns.
- Order detail view.
- Quick status update.
- Statuses: pending, confirmed, shipped, delivered, cancelled.

### Plan
- Seller plan load.
- Plan change for MVP/admin testing.
- Product and image limits shown by plan.

### UX
- Mobile-first layout.
- Tappable buttons.
- Improved loading and empty states.
- Copy helper buttons.
- Responsive forms for mobile, tablet, laptop, and desktop.

## Tech Stack

Backend:
- FastAPI
- Supabase
- Supabase Storage
- Uvicorn

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS

## Project Structure

hishabi-backend/  FastAPI backend
hishabi-mvp/      Next.js frontend
README.md         Main project documentation

## Run Backend

cd "hishabi-backend"
source venv/bin/activate
python -m uvicorn main:app --reload --port 8003

Backend:
http://127.0.0.1:8003

Swagger:
http://127.0.0.1:8003/docs

## Run Frontend

cd "hishabi-mvp"
npm run dev

Frontend:
http://localhost:3000

## Useful Checks

Backend health:

curl -i "http://127.0.0.1:8003/products"
curl -i "http://127.0.0.1:8003/customers"
curl -i "http://127.0.0.1:8003/orders"
curl -i "http://127.0.0.1:8003/dashboard/summary"

Backend syntax:

cd "hishabi-backend"
source venv/bin/activate
python -m py_compile main.py

Frontend build:

cd "hishabi-mvp"
npm run build

## Environment and Security

Do not commit .env or .env.local files.

Backend secrets stay in:
hishabi-backend/.env

Frontend local environment values stay in:
hishabi-mvp/.env.local

Important:
Supabase service role key must only be used in the backend. Never expose service role keys in frontend code.

## Manual QA Flow

1. Apply Global Seller ID.
2. Add product with image.
3. Check product image gallery.
4. Delete product image.
5. Confirm main image refreshes.
6. Add customer.
7. Create order using dropdowns.
8. View order detail.
9. Update order status.
10. Change seller plan.
11. Refresh dashboard summary.
12. Check mobile layout and tappable buttons.

## Final Product Vision

The final Hishabi product will become an AI-powered F-commerce moderator and sales assistant.

Future target flow:
1. Connect Facebook/Meta and WhatsApp messages.
2. AI reads customer conversations.
3. AI extracts name, phone, address, product interest, quantity, and delivery intent.
4. AI matches products.
5. AI creates order drafts.
6. Seller reviews/confirms.
7. AI replies to customers using seller-approved rules.
8. Payment and courier integrations can be added later.
9. Admin panel, monitoring, security, and deployment will be added later.

## Roadmap

Near term:
- Final MVP QA
- Documentation
- Seller setup polish
- Better filtering/search
- Deployment preparation

Later:
- Authentication
- AI parser
- Meta/Facebook webhook
- WhatsApp integration
- Payment integration
- Courier integration
- Admin dashboard
- Monitoring/logging
- Security hardening

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
