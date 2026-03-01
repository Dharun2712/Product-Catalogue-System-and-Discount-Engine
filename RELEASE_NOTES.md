# 🏷️ Release Notes

## v0.1.0 — Initial Release

**Release Date:** March 2026  
**Tag:** `v0.1.0`

---

### 🎯 Overview

First public release of the **Dynamic Product Catalogue System with Discount Engine** — a full-stack e-commerce platform built with React, Node.js, Express, and MongoDB.

---

### ✅ Features Included

#### Product Catalogue
- Product listing with images, categories, pricing, and specifications
- Product detail pages with reviews and ratings
- Search and category-based browsing
- Admin CRUD for product management (create, edit, delete, toggle active)

#### Discount Engine
- **Coupon types:** Percentage-based and fixed-amount discounts
- **Validation rules:**
  - Expiry date enforcement
  - Minimum order value check
  - Usage limit tracking
  - Maximum discount cap for percentage coupons
- **Safety:** Discount is capped at subtotal to prevent negative totals
- **Single-use policy:** Only one coupon per checkout

#### Cart & Checkout
- Add/remove items with quantity tracking
- Real-time cart total calculation
- Coupon application at checkout
- **Server-side price verification** — all pricing computed on the backend
- Stock validation — blocks checkout for out-of-stock items
- Automatic stock decrement upon successful order

#### Authentication & Authorization
- JWT-based stateless authentication
- Role-based access control (`user` / `admin`)
- Protected routes on both frontend and backend
- Password hashing with bcrypt (12 salt rounds)

#### Admin Dashboard
- Revenue and order analytics
- Product management with image upload
- Coupon management with status toggling
- Customer list view
- Order history across all users
- Review moderation

#### UI / UX
- Responsive design with Tailwind CSS
- Modern admin layout with sidebar navigation
- Loading skeletons for async content
- Toast notifications for user feedback
- Mobile-friendly card layouts

---

### 🏗️ Architecture

```
Routes → Controllers → Pricing Engine → Database
```

- Frontend: React 18 + Tailwind CSS + Vite
- Backend: Node.js + Express.js
- Database: MongoDB with Mongoose ODM
- Auth: JWT with role-based middleware

---

### 📊 Data Models

| Model | Key Fields |
|---|---|
| **Product** | name, description, category, price, discountPrice, stock, images, specifications |
| **Coupon** | code, type, value, minOrderValue, maxDiscountCap, usageLimit, expiry |
| **Order** | user, items, subtotal, couponApplied, discount, total |
| **User** | name, email, password (hashed), role |
| **Review** | user, product, rating (1-5), comment |

---

### 📌 Assumptions

- Currency: INR (₹)
- Coupons apply on cart total, not individual items
- One discount per checkout
- No payment gateway — orders placed directly
- Images stored locally via Multer

---

### ⚠️ Known Limitations

- No multi-currency support
- No live inventory sync
- No payment integration (Razorpay/Stripe)
- No email notifications
- No real-time dashboard updates
- Local file storage for images

---

### 🔧 Commit History

```
feat: initialize project with React and Node setup
feat: implement JWT based authentication
feat: create product model with Decimal128 pricing
feat: add admin APIs for product management
feat: implement coupon model with expiry validation
feat: build cart system with quantity tracking
feat: create pricing engine for discount calculation
fix: block checkout for out-of-stock products
feat: implement coupon validation at checkout
feat: add admin analytics for purchase trends
style: enhance UI with modern responsive design
docs: add README with architecture explanation
chore: prepare project for release v0.1.0
```

---

### 🚀 Getting Started

```bash
# Clone
git clone https://github.com/Dharun2712/Product-Catalogue-System-and-Discount-Engine.git

# Backend
cd backend && npm install
# Create .env with MONGO_URI and JWT_SECRET
npm run dev

# Frontend (new terminal)
cd frontend && npm install
npm run dev
```

---

<p align="center">
  <strong>Dynamic Product Catalogue System with Discount Engine</strong><br>
  v0.1.0 · March 2026
</p>
