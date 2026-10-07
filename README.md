# ShopSphere – Full Stack E-commerce Platform (REST API Backend)

A complete, production-grade, dynamic E-commerce RESTful API backend built with **Node.js, Express.js, MongoDB, Mongoose, and JWT Authentication**.

---

## 🚀 Features

- **JWT Authentication & Authorization**:
  - Secure registration, login, logout, and token-based route protection (`Bearer <token>`).
  - Passwords securely hashed with `bcryptjs` (salt rounds: 10).
  - Role-based Access Control (RBAC): `customer` and `admin` roles.
- **Dynamic Category Management**:
  - Full CRUD operations on product categories.
  - Slug/name uniqueness check and active state filtering.
- **Dynamic Product Management**:
- **Dynamic Product Specifications & Variants**:
  - Technical specifications support (e.g., Processor, Battery, Display, Material).
  - Multi-attribute product variants (e.g. Color, Size, Storage, SKU, variant-specific pricing, and variant-specific inventory).
  - Variant-aware shopping cart & checkout: individual variant stock deduction upon order placement, and automatic stock restoration upon cancellation.
  - Multi-parameter search & filtering:
    - Text search by name, brand, description, or variant titles (`?search=phone`).
    - Filter by category name or ObjectId (`?category=Electronics`).
    - Filter by brand (`?brand=Apple`).
    - Filter by variant attributes (`?color=Silver`, `?size=XL`, `?storage=256GB`).
    - Price range filters (`?minPrice=500&maxPrice=50000`).
    - Stock filter (`?inStock=true`).
    - Sorting (`?sort=price`, `?sort=-price`, `?sort=rating`, `?sort=newest`).
    - Dynamic pagination (`?page=1&limit=10`).
- **Persistent Shopping Cart**:
  - MongoDB-backed shopping cart per authenticated customer.
  - Automatic subtotal and item quantity calculation.
  - Real-time stock validation (prevents adding more items than available).
  - Add, update quantity, remove single item, or clear entire cart.
- **Order Management & Stock Synchronization**:
  - Place orders directly from the current cart or via direct items.
  - Validates delivery address and checks stock availability before placing order.
  - Automatically deducts stock upon order placement and flags unavailable if stock reaches 0.
  - Restores stock automatically when an order is cancelled.
  - Multi-status order lifecycle: `Placed` → `Confirmed` → `Processing` → `Shipped` → `Out for Delivery` → `Delivered` → `Cancelled`.
- **Payment Modes**:
  - Supports `Cash on Delivery`, `UPI`, and `Card`.
  - Realistic simulated payment processing without storing sensitive financial card data.
- **Admin System & Dashboard Analytics**:
  - High-level analytics: total users, customers vs admins count, total products, out-of-stock count, low-stock alerts, total orders by status, and total revenue calculation.
  - Order status updates and product stock management.
- **Centralized Error Handling**:
  - Unified JSON response formats for both success and error responses.
  - Catches invalid ObjectIds (`CastError`), duplicate keys (MongoDB error 11000), validation errors, and expired/invalid tokens.

---

## 📁 Project Directory Structure

```text
ShopSphere/
├── config/
│   └── db.js                 # MongoDB connection logic
├── controllers/
│   ├── authController.js     # User registration, login, logout, getMe
│   ├── userController.js     # Profile management & admin user management
│   ├── adminController.js    # Dashboard analytics, order status, stock updates
│   ├── productController.js  # CRUD, filtering, search, pagination, sorting
│   ├── categoryController.js # CRUD for product categories
│   ├── cartController.js     # Shopping cart management & subtotal calculations
│   └── orderController.js    # Order placement, status tracking, stock sync
├── middleware/
│   ├── authMiddleware.js     # JWT Bearer token authentication
│   ├── adminMiddleware.js    # Role-based admin authorization check
│   └── errorMiddleware.js    # Centralized 404 & error handlers
├── models/
│   ├── userModel.js          # User schema, bcrypt hooks, password compare
│   ├── productModel.js       # Product schema with indexes & availability sync
│   ├── categoryModel.js      # Category schema with unique constraints
│   ├── cartModel.js          # Cart schema with virtual subtotal calculation
│   └── orderModel.js         # Order schema with items, status & addresses
├── routes/
│   ├── authRoutes.js         # /api/auth
│   ├── userRoutes.js         # /api/users
│   ├── adminRoutes.js        # /api/admin
│   ├── productRoutes.js      # /api/products
│   ├── categoryRoutes.js     # /api/categories
│   ├── cartRoutes.js         # /api/cart
│   └── orderRoutes.js        # /api/orders
├── utils/
│   ├── generateToken.js      # JWT signing helper
│   └── seedData.js           # Sample database seeder
├── .env                      # Local environment configuration
├── .env.example              # Environment variables template
├── .gitignore                # Git exclusions
├── package.json              # Project scripts and dependencies
└── server.js                 # Express application entrypoint
```

---

## 🛠️ Setup & Installation

### 1. Prerequisites
- **Node.js**: v16+ installed
- **MongoDB**: MongoDB Community Server locally (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud cluster.

### 2. Configure Environment Variables
Verify your `.env` file (or duplicate `.env.example` into `.env`):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/shopsphere
JWT_SECRET=shopsphere_super_secret_jwt_key_2026_production_grade
JWT_EXPIRE=30d
NODE_ENV=development
```

### 3. Install Dependencies
```bash
npm install
```

### 4. (Optional) Seed Sample Database
Populate categories, sample products, an admin account, and a test customer:
```bash
npm run seed
```

**Pre-seeded Credentials:**
- **Admin**: `admin@shopsphere.com` / `adminPassword123`
- **Customer**: `john@example.com` / `customerPassword123`

### 5. Start the Server
- **Development (with hot reload via nodemon)**:
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```

The server will start listening at: `http://localhost:5000`

---

## 🧪 Automated Testing & Postman Collection

### 1. Run Automated End-to-End API Test Suite
With the server running and connected to MongoDB, execute:
```bash
npm run test:api
```
This script tests:
1. System health check
2. Customer & Admin registration and login
3. Category creation and retrieval
4. Product creation, keyword search, price range filter, and pagination
5. Adding to cart, updating quantities, subtotal calculation
6. Placing an order & verifying stock deduction in MongoDB
7. Admin dashboard statistics & order status updates
8. Order cancellation & automatic stock restoration

### 2. Import into Postman / Thunder Client
The file `shopsphere_api_collection.json` contains a pre-configured Postman v2.1.0 collection.
- **Thunder Client (VS Code)**: Click **Collections** → **Import** → select `shopsphere_api_collection.json`.
- **Postman**: Click **Import** → select `shopsphere_api_collection.json`.
- **Auto-Tokens**: Login requests automatically extract and set the `customerToken` and `adminToken` variables so subsequent protected endpoints work without manual copying.

---

## 📡 API Reference

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register customer or admin |
| `POST` | `/api/auth/login` | Public | Login with email & password |
| `POST` | `/api/auth/logout` | Public | Logout |
| `GET`  | `/api/auth/me` | Private | Get authenticated user info |

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "mypassword123",
  "phone": "+91 9988776655",
  "address": {
    "street": "12 Residency Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "postalCode": "560025",
    "country": "India"
  },
  "role": "customer"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "mypassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "673f1234a56b7c89d0e12345",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 👤 User Management (`/api/users`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users/profile` | Private | Get logged-in user's profile |
| `PUT` | `/api/users/profile` | Private | Update logged-in user profile / password |
| `GET` | `/api/users` | Private/Admin | List all users (with search & pagination) |
| `GET` | `/api/users/:id` | Private/Admin | Get user by ID |
| `PUT` | `/api/users/:id` | Private/Admin | Update user role or profile |
| `DELETE` | `/api/users/:id` | Private/Admin | Delete a user account |

---

### 📦 Product Management (`/api/products`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | Search, filter, sort & paginate products |
| `GET` | `/api/products/:id` | Public | Get single product details |
| `POST` | `/api/products` | Private/Admin | Create a new product |
| `PUT` | `/api/products/:id` | Private/Admin | Update product details |
| `DELETE` | `/api/products/:id` | Private/Admin | Delete product |

#### Filtering, Search, and Pagination Examples:
- **Search by keyword**: `GET /api/products?search=phone`
- **Filter by category**: `GET /api/products?category=Electronics`
- **Filter by brand**: `GET /api/products?brand=Apple`
- **Filter by price range**: `GET /api/products?minPrice=1000&maxPrice=50000`
- **Filter in-stock items**: `GET /api/products?inStock=true`
- **Sorting**: `GET /api/products?sort=price` (ascending) or `GET /api/products?sort=-price` (descending)
- **Pagination**: `GET /api/products?page=1&limit=10`
- **Combine all**: `GET /api/products?search=pro&category=Electronics&minPrice=20000&sort=-price&page=1&limit=5`

#### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "name": "Wireless Noise Canceling Earbuds",
  "description": "Ergonomic earbuds with deep bass and 30-hour battery life",
  "price": 4999,
  "category": "Electronics",
  "brand": "SoundWave",
  "stock": 50,
  "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",
  "rating": 4.5
}
```

---

### 🏷️ Category Management (`/api/categories`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Public | List categories |
| `GET` | `/api/categories/:id` | Public | Get category details with product count |
| `POST` | `/api/categories` | Private/Admin | Create category |
| `PUT` | `/api/categories/:id` | Private/Admin | Update category |
| `DELETE` | `/api/categories/:id` | Private/Admin | Delete category (checks for assigned products) |

---

### 🛒 Shopping Cart (`/api/cart`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cart` | Private | Retrieve cart with calculated subtotal |
| `POST` | `/api/cart` | Private | Add product to cart (validates stock) |
| `PUT` | `/api/cart/:productId` | Private | Update item quantity in cart |
| `DELETE` | `/api/cart/:productId` | Private | Remove item from cart |
| `DELETE` | `/api/cart/clear` | Private | Clear entire cart |

#### Add to Cart
```http
POST /api/cart
Authorization: Bearer <CUSTOMER_TOKEN>
Content-Type: application/json

{
  "productId": "673f1234a56b7c89d0e12345",
  "quantity": 2
}
```

---

### 📋 Order Management (`/api/orders`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Private | Place order from cart / items |
| `GET` | `/api/orders` | Private | View customer's order history |
| `GET` | `/api/orders/:id` | Private | View order details |
| `PUT` | `/api/orders/:id/cancel` | Private | Cancel order (restores product stock) |
| `PUT` | `/api/orders/:id/pay` | Private | Simulate payment completion for pending order |

#### Place Order
```http
POST /api/orders
Authorization: Bearer <CUSTOMER_TOKEN>
Content-Type: application/json

{
  "shippingAddress": {
    "street": "123 Commercial Street",
    "city": "Bangalore",
    "state": "Karnataka",
    "postalCode": "560001",
    "country": "India",
    "phone": "+91 9876543210"
  },
  "paymentMethod": "UPI"
}
```
*Note: Placing an order automatically deducts product inventory and empties the shopping cart.*

---

### 📊 Admin Operations (`/api/admin`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Private/Admin | Comprehensive analytics & revenue summary |
| `GET` | `/api/admin/users` | Private/Admin | Search and filter all registered users |
| `GET` | `/api/admin/orders` | Private/Admin | View all orders across all customers |
| `PUT` | `/api/admin/orders/:id/status` | Private/Admin | Update order status (`Confirmed`, `Shipped`, `Delivered`, etc.) |
| `PUT` | `/api/admin/products/:id/stock` | Private/Admin | Update product stock directly |

#### Update Order Status
```http
PUT /api/admin/orders/<ORDER_ID>/status
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "status": "Delivered"
}
```

---

## 🔒 Security Best Practices Implemented

- **Password Hashing**: Bcrypt with 10 salt rounds before database persistence.
- **Strict Data Projections**: Password field excluded by default (`select: false`).
- **Input Sanitization**: Trimmed text inputs, regex validations for email addresses, and non-negative constraints on prices and stock.
- **Stock Synchronization Guards**: Prevents negative inventory; restores stock on cancellations.
- **Protected Roles**: Middleware pipeline verifies JWT signature, user existence, and admin role authorization before executing administrative endpoints.
- **Safe Error Responses**: Stack traces hidden in production environment.
