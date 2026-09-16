# CodeAlpha Internship — Task 1: Full Stack E-Commerce Store

![CodeAlpha Internship](https://img.shields.io/badge/CodeAlpha-Full_Stack_Internship-blueviolet?style=for-the-badge)
![Task](https://img.shields.io/badge/Task-1:_E--Commerce_Store-indigo?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-Node.js_|_Express_|_HTML5_|_CSS3_|_JavaScript-cyan?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

A modern, production-grade **Full Stack E-Commerce Application** built from scratch for the **CodeAlpha Full Stack Development Internship Program** by **Veernarayan**.

---

## 🌟 Features Overview

### 🛍️ 1. Storefront & Dynamic Product Catalog
- **Curated Catalog:** 12 premium tech and lifestyle products with high-resolution imagery, specifications, ratings, and stock tracking.
- **Dynamic Category Filtering:** Instant category switching (`Audio & Sound`, `Wearables`, `Photography`, `Desk Essentials`, `Smart Gadgets`).
- **Live Search Autocomplete:** Instant debounced search filtering by product title, description, and category.
- **Price Range Slider & In-Stock Toggle:** Filter by maximum budget and availability.
- **Sorting Options:** Sort by Featured, Price (Low to High), Price (High to Low), Highest Rating, or New Arrivals.

### 🔍 2. Product Details & Customer Reviews
- **Quick-View Modal & Dedicated Product Page:** Dual-view system with multi-image gallery switching.
- **Full Specifications Table:** Technical hardware specifications.
- **Interactive Review System:** Star rating selection and verified feedback submission stored in persistent backend.

### 🛒 3. Interactive Cart Drawer & Multi-Step Checkout
- **Slide-Out Cart Drawer:** Real-time cart drawer with quantity stepper `[- 1 +]`, subtotal calculation, and instant removal.
- **Promo Coupon System:**
  - `CODEALPHA10`: 10% discount on cart.
  - `ALPHA20`: 20% discount on orders over $100.
  - `FREESHIP`: Unlocks free express shipping.
- **Multi-Step Checkout Flow:**
  - **Step 1:** Review shopping bag items.
  - **Step 2:** Shipping information with one-click **"⚡ Fill Demo Details"** button.
  - **Step 3:** Payment gateway simulation (Credit/Debit Card, UPI / NetBanking, Cash on Delivery).
- **Instant Order Receipt:** Order confirmation modal with unique Order ID (`ORD-XXXXX`), date, breakdown, and **"Print Invoice"** functionality.

### 🔐 4. Authentication & User Profile
- **User Authentication:** Sign In and Sign Up with bcrypt password hashing and JSON Web Tokens (JWT).
- **One-Click Evaluator Login:** Built-in **"Auto-Fill Demo Credentials"** button (`demo@codealpha.com` / `password123`).
- **User Dashboard (`profile.html`):** Displays user profile, lifetime spending, total order count, and a comprehensive **Order History** table with receipt modal view.

### ⚡ 5. Backend REST API & Zero-Config Database
- Built with **Node.js** and **Express.js**.
- File-backed atomic JSON database ensuring zero configuration, cross-platform persistence, and instant setup without external database servers.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, Modern Vanilla CSS (Glassmorphism, CSS Grid, Flexbox, Custom Variables), ES6+ JavaScript |
| **Styling & Fonts** | Plus Jakarta Sans, Outfit, Lucide SVGs, Cyber Luxury Dark Theme |
| **Backend** | Node.js, Express.js, CORS, Body-Parser |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`) |
| **Database** | Persistent JSON / File Engine with atomic file transactions |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) installed (v16 or higher)

### 1. Clone or Open the Project
```bash
cd Task-1_Ecommerce_Store/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch the Server
```bash
npm start
```
The server will boot up at:
👉 **`http://localhost:5000`**

Open `http://localhost:5000` in your web browser to experience the complete application!

---

## 🔑 Demo Credentials for Testing

| Role | Email | Password |
| :--- | :--- | :--- |
| **Demo Intern / User** | `demo@codealpha.com` | `password123` |

*(You can also use the one-click "Auto-Fill Demo Credentials" button on the Sign In page, or register a brand new account).*

---

## 📡 REST API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Server health check & info | No |
| `GET` | `/api/categories` | Get all product categories | No |
| `GET` | `/api/products` | Get products list (supports query filters) | No |
| `GET` | `/api/products/:id` | Get single product details | No |
| `POST` | `/api/products/:id/reviews`| Post product review and star rating | Optional |
| `POST` | `/api/coupons/validate` | Validate promo coupons | No |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/auth/profile` | Get authenticated user profile & stats | **Yes** |
| `POST` | `/api/orders` | Create a new order (Checkout) | Optional |
| `GET` | `/api/orders/my-orders` | Fetch user's order history | **Yes** |
| `GET` | `/api/orders/:id` | Fetch specific order details | No |

---

## 📁 Project Structure

```
Task-1_Ecommerce_Store/
├── backend/
│   ├── database/
│   │   ├── db.js                # Database logic & schema initialization
│   │   └── data.json            # Persistent storage (products, users, orders)
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── package.json             # Backend manifest & dependencies
│   └── server.js                # Main Express server & API endpoints
├── frontend/
│   ├── css/
│   │   ├── style.css            # Cyber luxury design system & variables
│   │   ├── components.css       # Cards, modals, drawers, buttons
│   │   └── responsive.css       # Mobile & tablet media queries
│   ├── js/
│   │   ├── api.js               # Centralized REST API client
│   │   ├── app.js               # Storefront logic, filters, and modals
│   │   ├── auth.js              # Token and user session state
│   │   ├── cart.js              # Shopping cart drawer & calculations
│   │   └── checkout.js          # Multi-step checkout & payment
│   ├── auth.html                # Sign in / registration page
│   ├── cart.html                # Cart review & checkout wizard
│   ├── index.html               # Main store landing page & catalog
│   ├── product.html             # Dedicated product details view
│   └── profile.html             # User account dashboard & order history
└── README.md                    # Project documentation
```

---

## 🎥 LinkedIn Video Presentation Guide

When recording your project walkthrough video for LinkedIn:
1. **Introduction:** State your name, role (**Full Stack Development Intern at CodeAlpha**), and the task (**Task 1: Simple E-Commerce Store**).
2. **Storefront Demo:** Show the category filters, live search bar, price slider, and sorting options.
3. **Cart & Coupons:** Add products to the cart, open the slide-out drawer, and apply promo code `CODEALPHA10`.
4. **Checkout & Order Flow:** Proceed to checkout, use the demo shipping fill, choose a payment method, and display the confirmed order receipt.
5. **Auth & Profile:** Log in with demo credentials and show the order history in the User Profile dashboard.
6. **Code Overview:** Briefly showcase the clean Express.js backend and modular vanilla frontend architecture.
7. **Conclusion:** Tag **@CodeAlpha** and share your GitHub repository link.

---

### Developed with ❤️ by Veernarayan for CodeAlpha Internship
