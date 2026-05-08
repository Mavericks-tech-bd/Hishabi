# Hishabi MVP

Hishabi is an MVP dashboard for small online sellers to manage products, customers, orders, seller plans, product images, and basic business summaries.

This project currently has two main parts:

- `hishabi-backend` — FastAPI + Supabase backend
- `hishabi-mvp` — Next.js + React + TypeScript + Tailwind frontend

---

## Current MVP Status

The MVP currently supports:

- Seller-wise filtering
- Product CRUD
- Product image upload through Supabase Storage
- Product image limit by seller plan
- Product limit by seller plan
- Customer CRUD
- Order CRUD
- Order detail view
- Order status update
- Seller plan management
- Dashboard summary
- Seller setup/helper section
- Product search/filter
- Customer search/filter
- Better order UX with status badges and filters
- Backend validation polish
- Final QA fixes for invalid seller filtering and frontend error handling

---

## Tech Stack

### Backend

- Python
- FastAPI
- Supabase
- Supabase Storage
- Pydantic
- Uvicorn
- Python dotenv

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

---

## Project Structure

```text
Hishabi/
  hishabi-backend/
    main.py
    requirements.txt
    .env

  hishabi-mvp/
    app/
      page.tsx
    components/
      HishabiDashboard.tsx
    package.json
    .env.local