# Hishabi MVP Checkpoint

Version: v0.1.0-mvp

Hishabi is a mobile-first AI-powered F-commerce seller assistant. The current MVP is the seller dashboard/control center that manages products, customers, orders, seller plans, product images, and dashboard summaries.

This checkpoint freezes the current stable local MVP before larger future phases such as authentication, AI message parser, Meta/Facebook webhook, WhatsApp integration, payment, courier, deployment, admin panel, monitoring, and security hardening.

## Current Stable MVP Scope

### Dashboard
- Dashboard summary loads from backend.
- Summary includes total products, customers, orders, sales, average order value, and order status counts.
- Dashboard can filter by seller ID.

### Seller
- Global Seller ID sync across Dashboard, Products, Customers, Orders, and Plan.
- Seller helper section loads seller data and plan info.
- Seller ID copy helper available.

### Products
- Product create, read, update, delete.
- Seller-wise product filtering.
- Product search.
- No product limit on any plan (locked 5-tier pricing).
- Product image upload during product creation.
- Plan-based image limits:
  - Free: 3 images per product
  - Starter: 10 images per product
  - Growth / Pro / Business: unlimited images per product
- Product image gallery in product cards.
- Individual product image delete.
- Main/hero product image refreshes after image delete.
- Product ID and Seller ID copy helpers.

### Customers
- Customer create, read, update, delete.
- Seller-wise customer filtering.
- Customer search.
- Customer fields:
  - name
  - phone
  - address
  - Facebook ID
  - WhatsApp number
- Customer ID and Seller ID copy helpers.

### Orders
- Order create, read, update, delete.
- Seller-specific customer/product dropdowns.
- Order detail view.
- Quick order status update.
- Order statuses:
  - pending
  - confirmed
  - shipped
  - delivered
  - cancelled
- Seller-wise order filtering.
- Status filtering.
- Customer/product name helpers in order cards.
- Order ID, Customer ID, Product ID, Seller ID copy helpers.

### Plan
- Seller plan load.
- Plan change for MVP/admin testing.
- Product and image limits visible by plan.
- Plan options (LOCKED 5-tier):
  - Free
  - Starter
  - Growth
  - Pro
  - Business

### Frontend UX
- Mobile-first layout.
- Mobile-friendly full-width buttons where needed.
- Tappable edit/delete/copy/upload actions.
- Improved loading states.
- Improved empty states.
- Global dashboard message box.
- Dashboard header mobile polish.
- Product/customer/order mobile button polish.
- Works across phone, tablet, laptop, and desktop layouts.

### Backend
- FastAPI backend.
- Supabase database integration.
- Supabase Storage for product images.
- UUID validation before backend queries.
- Plan-based product and image limit logic.
- CORS configured for local frontend development.

## Local Development Commands

Backend:

cd "hishabi-backend"
source venv/bin/activate
python -m uvicorn main:app --reload --port 8003

Frontend:

cd "hishabi-mvp"
npm run dev

Frontend URL:

http://localhost:3000

Backend URL:

http://127.0.0.1:8003

Swagger:

http://127.0.0.1:8003/docs

## Final QA Checklist

Passed at checkpoint:

- Backend /products health check
- Backend /customers health check
- Backend /orders health check
- Backend /dashboard/summary health check
- Backend Python compile check
- Frontend production build check
- Product image upload/delete browser QA
- Main product image refresh after image delete
- Git clean before checkpoint

## Security Notes

- Do not commit .env or .env.local.
- Supabase service role key must stay backend-only.
- Never expose service role key in frontend code.
- Frontend should only use public-safe environment values.

## Future Roadmap

Near-term:
- Seller setup/onboarding polish
- Better search/filter polish
- Better validation and error messages
- Deployment preparation

Later:
- Authentication
- AI customer message parser
- Meta/Facebook webhook
- WhatsApp integration
- Payment integration
- Courier integrations such as Pathao/RedX
- Admin dashboard
- Monitoring/logging
- Security hardening
- Production deployment
