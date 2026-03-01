# 🛍️ Dynamic Product Catalogue System with Discount Engine

A full-stack e-commerce platform that enables **product catalogue management**, **dynamic discount application**, **coupon validation**, **cart-based checkout**, and **admin analytics** — built as an internship project.

[![Release](https://img.shields.io/badge/release-v0.1.0-orange.svg)](#release-notes)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](LICENSE)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Core Features](#-core-features)
- [Pricing & Discount Logic](#-pricing--discount-logic)
- [Folder Structure](#-folder-structure)
- [Local Setup & Run](#-local-setup--run)
- [API Endpoints](#-api-endpoints)
- [Data Models](#-data-models)
- [Assumptions](#-assumptions)
- [Limitations](#-limitations)
- [Commit History](#-commit-history)
- [Release Notes](#-release-notes)

---

## 🔍 Project Overview

The **Dynamic Product Catalogue System with Discount Engine** is a complete e-commerce solution designed to demonstrate real-world full-stack development practices. The system provides:

| Capability | Description |
|---|---|
| **Product Catalogue** | Browse, search, and filter products with images, specifications, and pricing |
| **Discount Engine** | Apply percentage or fixed-amount coupons with validation rules (min order, usage limits, expiry) |
| **Cart & Checkout** | Add items to cart, apply coupons, and complete purchases with server-side price verification |
| **Admin Dashboard** | Manage products, coupons, customers, orders, and reviews with analytics |
| **Authentication** | JWT-based role authentication (User / Admin) with protected routes |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                   │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  React 18     │  │ Tailwind CSS │  │  React Router│  │
│  │  Components   │  │  Styling     │  │  Navigation  │  │
│  └───────┬───────┘  └──────────────┘  └──────────────┘  │
│          │  Axios HTTP                                   │
└──────────┼───────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│                   SERVER (Node.js + Express)             │
│                                                          │
│  ┌──────────┐   ┌──────────────┐   ┌─────────────────┐  │
│  │  Routes   │──▶│ Controllers  │──▶│ Pricing Engine  │  │
│  │  (API)    │   │ (Logic)      │   │ (Discount Calc) │  │
│  └──────────┘   └──────┬───────┘   └─────────────────┘  │
│                        │                                 │
│  ┌──────────┐   ┌──────▼───────┐                        │
│  │  Auth     │   │  Mongoose    │                        │
│  │Middleware │   │  Models      │                        │
│  │  (JWT)    │   │              │                        │
│  └──────────┘   └──────┬───────┘                        │
└────────────────────────┼─────────────────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   MongoDB Atlas     │
              │   (Cloud Database)  │
              └─────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Tailwind CSS, Vite | SPA with responsive UI, hot-reload dev server |
| **Backend** | Node.js, Express.js | RESTful API server with middleware pipeline |
| **Database** | MongoDB (Mongoose ODM) | Document-based storage for products, orders, coupons |
| **Authentication** | JWT (jsonwebtoken) | Stateless role-based access control |
| **File Upload** | Multer | Product image upload handling |
| **Validation** | express-validator | Request payload validation |

### Design Principles

- **Separation of Concerns** — Routes → Controllers → Pricing Engine → Database
- **Server-side Price Verification** — All pricing computed on the server to prevent client manipulation
- **Role-based Access** — Admin and User routes protected via JWT middleware
- **RESTful API Design** — Standard HTTP methods and status codes

---

## ✨ Core Features

### 👤 User Features

| Feature | Description |
|---|---|
| **Browse Catalogue** | View all products with images, pricing, ratings, and specifications |
| **Search & Filter** | Find products by name or browse by category |
| **Product Details** | View detailed product pages with reviews and specifications |
| **Shopping Cart** | Add/remove items, adjust quantities with real-time total |
| **Apply Coupon** | Enter coupon codes at checkout for discounts |
| **Multi-Currency** | View prices in INR, USD, or EUR with persistent selection |
| **Checkout** | Complete purchase with server-verified pricing |
| **Order History** | View past orders with details and status |
| **Reviews** | Rate and review purchased products |

### 🔧 Admin Features

| Feature | Description |
|---|---|
| **Dashboard Analytics** | Revenue overview, order trends, top products, recent activity |
| **Product Management** | Create, edit, delete products with images and specifications |
| **Coupon Management** | Create percentage/fixed coupons with usage limits, min order, expiry |
| **Order Management** | View all customer orders with details |
| **Customer Management** | View registered users |
| **Review Moderation** | Monitor and manage product reviews |

---

## 💰 Pricing & Discount Logic

The pricing engine is implemented server-side in the order controller to ensure integrity:

```
Checkout Flow:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Cart Items ──▶ Validate Stock ──▶ Calculate Subtotal
                                          │
                                          ▼
                                   Coupon Provided?
                                    │           │
                                   YES          NO
                                    │           │
                                    ▼           │
                             Validate Coupon    │
                             ┌─ Active?         │
                             ├─ Not Expired?    │
                             ├─ Usage < Limit?  │
                             └─ Min Order Met?  │
                                    │           │
                                    ▼           │
                             Calculate Discount │
                             ┌─ Percentage: (value/100) × subtotal
                             ├─ Fixed: flat amount
                             ├─ Cap: maxDiscountCap check
                             └─ Floor: discount ≤ subtotal
                                    │           │
                                    ▼           ▼
                              Total = Subtotal - Discount
                                          │
                                          ▼
                                   Create Order
                                   Reduce Stock
                                   Increment Coupon Usage
```

### Rules

| Rule | Implementation |
|---|---|
| **Single Discount** | Only one coupon can be applied per checkout |
| **Expired Coupons** | Rejected with error message at validation |
| **Invalid Coupons** | Returns `400` error with descriptive message |
| **Discount Cap** | `maxDiscountCap` limits percentage-based discounts |
| **Negative Prevention** | Discount is capped at the subtotal value |
| **Min Order Value** | Coupon rejected if cart subtotal is below threshold |
| **Usage Limit** | Coupon rejected once `usedCount >= usageLimit` |
| **Stock Validation** | Checkout blocked if product stock is insufficient |

---

## 📁 Folder Structure

```
Product-Catalogue-System/
│
├── backend/                        # Express.js API Server
│   ├── server.js                   # App entry point
│   ├── package.json                # Backend dependencies
│   ├── seed.js                     # Database seeder
│   ├── config/
│   │   └── db.js                   # MongoDB connection config
│   ├── controllers/
│   │   ├── authController.js       # Login / Register logic
│   │   ├── productController.js    # Product CRUD operations
│   │   ├── couponController.js     # Coupon CRUD + validation
│   │   ├── orderController.js      # Order creation + pricing engine
│   │   ├── adminController.js      # Admin analytics + management
│   │   └── reviewController.js     # Review CRUD
│   ├── middleware/
│   │   └── auth.js                 # JWT verification + role check
│   ├── models/
│   │   ├── Product.js              # Product schema
│   │   ├── Coupon.js               # Coupon schema with expiry
│   │   ├── Order.js                # Order schema with items
│   │   ├── User.js                 # User schema with bcrypt
│   │   └── Review.js               # Review schema with ratings
│   ├── routes/
│   │   ├── auth.js                 # Auth endpoints
│   │   ├── products.js             # Product endpoints
│   │   ├── coupons.js              # Coupon endpoints
│   │   ├── orders.js               # Order endpoints
│   │   ├── admin.js                # Admin endpoints
│   │   └── reviews.js              # Review endpoints
│   └── tests/                      # Test files
│
├── frontend/                       # React SPA
│   ├── index.html                  # HTML entry point
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite build configuration
│   ├── tailwind.config.js          # Tailwind CSS theme config
│   ├── postcss.config.js           # PostCSS plugins
│   └── src/
│       ├── App.jsx                 # Root component with routing
│       ├── main.jsx                # React DOM render
│       ├── index.css               # Global styles + Tailwind
│       ├── api/
│       │   └── axios.js            # Axios instance with interceptors
│       ├── components/
│       │   ├── AdminLayout.jsx     # Admin sidebar + header layout
│       │   ├── AdminNavbar.jsx     # Admin navigation bar
│       │   ├── Navbar.jsx          # User navigation bar
│       │   ├── ProductCard.jsx     # Product card component
│       │   ├── ProtectedRoute.jsx  # Auth guard component
│       │   └── LoadingSkeleton.jsx # Loading placeholder
│       ├── context/
│       │   ├── AuthContext.jsx     # Authentication state
│       │   └── CartContext.jsx     # Shopping cart state
│       └── pages/
│           ├── Home.jsx            # Product catalogue page
│           ├── ProductPage.jsx     # Product detail page
│           ├── Cart.jsx            # Shopping cart page
│           ├── Checkout.jsx        # Checkout with coupon
│           ├── Orders.jsx          # User order history
│           ├── Login.jsx           # User login
│           ├── Register.jsx        # User registration
│           ├── AdminLogin.jsx      # Admin login
│           └── admin/
│               ├── Dashboard.jsx   # Analytics dashboard
│               ├── Products.jsx    # Product management
│               ├── Coupons.jsx     # Coupon management
│               ├── Orders.jsx      # Order management
│               ├── Users.jsx       # Customer management
│               └── Reviews_.jsx    # Review moderation
│
└── images/                         # Static assets
```

---

## 🚀 Local Setup & Run

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas) cloud)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/Dharun2712/Product-Catalogue-System-and-Discount-Engine.git
cd Product-Catalogue-System-and-Discount-Engine
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Create Environment File

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### 4. Run Backend Server

```bash
npm run dev
```

The API server starts at `http://localhost:5000`.

### 5. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

### 6. Run Frontend Dev Server

```bash
npm run dev
```

The app opens at `http://localhost:5173`.

### 7. Seed Sample Data (Optional)

```bash
cd backend
npm run seed
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | — |
| `POST` | `/api/auth/login` | Login & get JWT token | — |
| `GET` | `/api/auth/me` | Get current user profile | User |

### Products

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/products` | List all products | — |
| `GET` | `/api/products/:id` | Get product details | — |
| `POST` | `/api/products` | Create product | Admin |
| `PUT` | `/api/products/:id` | Update product | Admin |
| `DELETE` | `/api/products/:id` | Delete product | Admin |

### Coupons

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/coupons` | List all coupons | Admin |
| `POST` | `/api/coupons` | Create coupon | Admin |
| `PUT` | `/api/coupons/:id` | Update coupon | Admin |
| `DELETE` | `/api/coupons/:id` | Delete coupon | Admin |
| `POST` | `/api/coupons/validate` | Validate coupon code | User |

### Orders

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/orders` | Create order (checkout) | User |
| `GET` | `/api/orders/user` | Get user's orders | User |
| `GET` | `/api/orders/admin` | Get all orders | Admin |

### Reviews

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/reviews/:productId` | Get product reviews | — |
| `POST` | `/api/reviews` | Create review | User |
| `DELETE` | `/api/reviews/:id` | Delete review | Admin |

### Admin

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Dashboard analytics | Admin |
| `GET` | `/api/admin/users` | List all users | Admin |

---

## 📊 Data Models

### Product

| Field | Type | Description |
|---|---|---|
| `name` | String | Product name (required) |
| `description` | String | Product description (required) |
| `category` | String | Product category (required) |
| `images` | [String] | Array of image URLs |
| `price` | Number | Original price in INR (required) |
| `discountPrice` | Number | Discounted price (optional) |
| `stock` | Number | Available inventory count |
| `active` | Boolean | Product visibility flag |
| `specifications` | [{key, value}] | Technical specifications |

### Coupon

| Field | Type | Description |
|---|---|---|
| `code` | String | Unique coupon code (uppercase) |
| `type` | Enum | `percentage` or `fixed` |
| `value` | Number | Discount value (% or ₹) |
| `minOrderValue` | Number | Minimum cart total to apply |
| `maxDiscountCap` | Number | Maximum discount for percentage type |
| `usageLimit` | Number | Max number of uses (null = unlimited) |
| `usedCount` | Number | Current usage count |
| `expiry` | Date | Coupon expiration date |
| `active` | Boolean | Active/inactive toggle |

### Order

| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | Reference to User |
| `items` | [OrderItem] | Products with quantity and price |
| `subtotal` | Number | Total before discount |
| `couponApplied` | String | Coupon code used (if any) |
| `discount` | Number | Discount amount applied |
| `total` | Number | Final amount after discount |

### User

| Field | Type | Description |
|---|---|---|
| `name` | String | User's full name |
| `email` | String | Unique email (lowercase) |
| `password` | String | Bcrypt hashed password |
| `role` | Enum | `user` or `admin` |

### Review

| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | Reference to User |
| `product` | ObjectId | Reference to Product |
| `rating` | Number | 1–5 star rating |
| `comment` | String | Review text (max 500 chars) |

---

## 📌 Assumptions

| # | Assumption |
|---|---|
| 1 | All product prices are **stored internally in INR (₹)** — currency conversion is display-only |
| 2 | Conversion rates are **static** (INR→1, USD→0.012, EUR→0.011) — not fetched from a live API |
| 3 | Coupons apply on the **cart total** (not individual items) |
| 4 | Only **one discount/coupon** can be applied per checkout |
| 5 | No **payment gateway** is integrated — orders are placed directly |
| 6 | Product images are stored as file paths via Multer (not cloud storage) |
| 7 | Admin accounts are seeded or manually created in the database |

---

## ⚠️ Limitations

| # | Limitation |
|---|---|
| 1 | Currency conversion uses **static rates** — no live exchange rate API integration |
| 2 | No **live inventory sync** — stock is decremented at checkout |
| 3 | No **payment integration** (Razorpay, Stripe, etc.) |
| 4 | No **email notifications** for order confirmation |
| 5 | No **real-time updates** (WebSockets) for admin dashboard |
| 6 | Product images stored locally, not on a CDN or cloud storage |

---

## 📝 Commit History

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
feat: implement multi-currency display system
style: enhance UI with modern responsive design
docs: add README with architecture explanation
chore: prepare project for release v0.1.0
```

---

## 🏷️ Release Notes

### v0.1.0 — Initial Release

> **Release Date:** March 2026

#### What's Included

- ✅ **Product Catalogue Management** — Full CRUD with images, specifications, and category support
- ✅ **Coupon-based Discount Engine** — Percentage & fixed discounts with expiry, usage limits, and min-order validation
- ✅ **Cart-based Checkout System** — Server-side price verification with stock validation
- ✅ **Admin Dashboard** — Product, coupon, order, customer, and review management with analytics
- ✅ **JWT Authentication** — Secure role-based access control for Users and Admins
- ✅ **Edge Case Handling** — Expired coupons, out-of-stock products, usage limits, discount caps
- ✅ **Multi-Currency Display** — View prices in INR, USD, or EUR with persistent selection and instant updates
- ✅ **Responsive UI** — Modern design with Tailwind CSS, works on desktop and mobile
- ✅ **Product Reviews** — Star ratings and comments with one-review-per-user constraint

---

## 🛠️ Tech Stack Summary

```
Frontend:   React 18  ·  Tailwind CSS  ·  Vite  ·  React Router  ·  Axios
Backend:    Node.js   ·  Express.js    ·  JWT   ·  Multer        ·  express-validator
Database:   MongoDB   ·  Mongoose ODM
```

---

## 👤 Author

**Dharun** — [GitHub](https://github.com/Dharun2712)

---

<p align="center">
  Built with ❤️ as an internship project
</p>
