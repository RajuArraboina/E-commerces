// Ensure global crypto is defined across all Node.js runtime environments (for MongoDB/Mongoose drivers)
if (typeof globalThis.crypto === 'undefined' || typeof global.crypto === 'undefined') {
  const nodeCrypto = require('crypto');
  global.crypto = nodeCrypto;
  globalThis.crypto = nodeCrypto;
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables (supports backend/.env, root .env, and cloud environment variables)
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

// Centralized API Routes
const apiRoutes = require('./routes');

// Swagger documentation
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger');

// Connect to MongoDB
connectDB();

const app = express();

// Enable CORS
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

/**
 * Total HTTP Links Catalog in EShop API
 */
const TOTAL_HTTP_LINKS = {
  auth: [
    { method: 'POST', endpoint: '/api/auth/register', access: 'Public', description: 'Register a new Customer or Admin' },
    { method: 'POST', endpoint: '/api/auth/login', access: 'Public', description: 'Authenticate user & get JWT token' },
    { method: 'POST', endpoint: '/api/auth/logout', access: 'Public', description: 'Log out and clear session' },
    { method: 'GET', endpoint: '/api/auth/me', access: 'Private (Bearer Token)', description: 'Get logged-in user profile' },
  ],
  users: [
    { method: 'GET', endpoint: '/api/users/profile', access: 'Private', description: 'Get current user profile' },
    { method: 'PUT', endpoint: '/api/users/profile', access: 'Private', description: 'Update current user profile / password' },
    { method: 'GET', endpoint: '/api/users', access: 'Private/Admin', description: 'Get all users with search & pagination' },
    { method: 'POST', endpoint: '/api/users', access: 'Private/Admin', description: 'Admin directly creates a user' },
    { method: 'GET', endpoint: '/api/users/:id', access: 'Private/Admin', description: 'Get single user by ID' },
    { method: 'PUT', endpoint: '/api/users/:id', access: 'Private/Admin', description: 'Update user details or role' },
    { method: 'DELETE', endpoint: '/api/users/:id', access: 'Private/Admin', description: 'Delete user account' },
  ],
  categories: [
    { method: 'GET', endpoint: '/api/categories', access: 'Public', description: 'Get all categories' },
    { method: 'GET', endpoint: '/api/categories/:id', access: 'Public', description: 'Get category details & product count' },
    { method: 'POST', endpoint: '/api/categories', access: 'Private/Admin', description: 'Create a new category' },
    { method: 'PUT', endpoint: '/api/categories/:id', access: 'Private/Admin', description: 'Update category by ID' },
    { method: 'DELETE', endpoint: '/api/categories/:id', access: 'Private/Admin', description: 'Delete category by ID' },
  ],
  products: [
    { method: 'GET', endpoint: '/api/products', access: 'Public', description: 'Get products with search, filter, sort & pagination' },
    { method: 'GET', endpoint: '/api/products/:id', access: 'Public', description: 'Get product details with variants' },
    { method: 'POST', endpoint: '/api/products', access: 'Private/Admin', description: 'Create product with specifications & variants' },
    { method: 'PUT', endpoint: '/api/products/:id', access: 'Private/Admin', description: 'Update product by ID' },
    { method: 'DELETE', endpoint: '/api/products/:id', access: 'Private/Admin', description: 'Delete product by ID' },
  ],
  cart: [
    { method: 'GET', endpoint: '/api/cart', access: 'Private', description: 'View shopping cart & calculated subtotal' },
    { method: 'POST', endpoint: '/api/cart', access: 'Private', description: 'Add product or variant to cart' },
    { method: 'PUT', endpoint: '/api/cart/:productId', access: 'Private', description: 'Update item quantity in cart' },
    { method: 'DELETE', endpoint: '/api/cart/:productId', access: 'Private', description: 'Remove item from cart' },
    { method: 'DELETE', endpoint: '/api/cart/clear', access: 'Private', description: 'Clear all items from cart' },
  ],
  orders: [
    { method: 'POST', endpoint: '/api/orders', access: 'Private', description: 'Place order, deduct stock & clear cart' },
    { method: 'GET', endpoint: '/api/orders', access: 'Private', description: 'Get logged-in user order history' },
    { method: 'GET', endpoint: '/api/orders/:id', access: 'Private', description: 'Get single order details' },
    { method: 'PUT', endpoint: '/api/orders/:id/cancel', access: 'Private', description: 'Cancel order & restore stock' },
    { method: 'PUT', endpoint: '/api/orders/:id/pay', access: 'Private', description: 'Simulate payment completion' },
  ],
  admin: [
    { method: 'GET', endpoint: '/api/admin/dashboard', access: 'Private/Admin', description: 'Dashboard analytics, revenue & statistics' },
    { method: 'GET', endpoint: '/api/admin/users', access: 'Private/Admin', description: 'List all registered users' },
    { method: 'GET', endpoint: '/api/admin/orders', access: 'Private/Admin', description: 'List all system orders' },
    { method: 'PUT', endpoint: '/api/admin/orders/:id/status', access: 'Private/Admin', description: 'Update order status' },
    { method: 'PUT', endpoint: '/api/admin/products/:id/stock', access: 'Private/Admin', description: 'Update product stock directly' },
  ],
};

// API Root / Health Check displaying total HTTP links
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to EShop REST API',
    baseUrl: `http://localhost:${process.env.PORT || 5000}`,
    documentation: `http://localhost:${process.env.PORT || 5000}/api-docs`,
    totalEndpoints: Object.values(TOTAL_HTTP_LINKS).reduce((acc, curr) => acc + curr.length, 0),
    endpoints: TOTAL_HTTP_LINKS,
  });
});

// Swagger UI Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'EShop API Documentation',
    customCss: '.swagger-ui .topbar { display: block; }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
    },
  })
);

// Raw OpenAPI JSON Specification Endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// Mount Centralized API Routes
app.use('/api', apiRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `[EShop Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;
