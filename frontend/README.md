# ShopSphere – React E-Commerce Frontend

A modern, production-grade, dynamic React frontend for the **ShopSphere E-Commerce Platform**.
Built with React, React Router DOM, Axios, Context API, and modern Vanilla CSS.

---

## 🚀 Features

- **Dynamic Catalog**: Full product listing with live keyword search, dynamic category filtering, brand filters, variant color/size/storage attributes, price range filters, and pagination.
- **Product Details & Variants**: View high-resolution images, technical specifications tables, and dynamic product variant matrices (size/storage combinations with live price & stock updates).
- **Persistent Shopping Cart**: Integrated with MongoDB backend with real-time stock validation, quantity adjustment, and item removal.
- **Checkout & Multi-Mode Payments**: Delivery address form pre-filled from user profile with Cash on Delivery (COD), UPI, and Card options.
- **Visual Order Lifecycle Tracking**: Stepper progress bar displaying `Placed` → `Confirmed` → `Processing` → `Shipped` → `Out for Delivery` → `Delivered` / `Cancelled`.
- **User Authentication & RBAC**:
  - Secure registration matching backend address fields.
  - Login with JWT token management and automatic refresh/restore.
  - Profile management and password updates.
- **Admin Management Portal**:
  - Dashboard analytics (live revenue, customer counts, low-stock warnings, orders breakdown).
  - Product catalog management (full CRUD with specifications & variants builder).
  - Category manager with deletion protection.
  - Inventory stock control with direct real-time updates.
  - Customer directory with search.
  - Order fulfillment management with lifecycle status updates.

---

## 🛠️ Getting Started

### 1. Environment Variables (`.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
VITE_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm start
```

Runs the application at [http://localhost:3000](http://localhost:3000).

---

## 🔑 Test Accounts (Seed Data)

* **Admin Account**:
  * Email: `admin@shopsphere.com`
  * Password: `adminPassword123`
* **Customer Account**:
  * Email: `john@example.com`
  * Password: `customerPassword123`
