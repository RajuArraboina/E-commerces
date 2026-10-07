const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

let BASE_URL = process.env.TEST_URL || `http://localhost:${process.env.PORT || 5000}`;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const results = [];

async function apiRequest(method, endpoint, body = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  const start = Date.now();
  try {
    const res = await fetch(url, options);
    const duration = Date.now() - start;
    const json = await res.json().catch(() => ({}));
    return {
      status: res.status,
      ok: res.ok,
      data: json,
      duration,
    };
  } catch (err) {
    const duration = Date.now() - start;
    return {
      status: 0,
      ok: false,
      error: err.message,
      duration,
    };
  }
}

function recordTest(name, passed, details = '') {
  results.push({ name, passed, details });
  const statusStr = passed
    ? `${colors.green}[PASS]${colors.reset}`
    : `${colors.red}[FAIL]${colors.reset}`;
  console.log(`  ${statusStr} ${name} ${details ? `(${details})` : ''}`);
}

async function runTests() {
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}    ShopSphere REST API Automated End-to-End Tests  ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  console.log(`Target Base URL: ${BASE_URL}\n`);

  // Verify server reachability
  const health = await apiRequest('GET', '/');
  if (!health.ok) {
    console.error(
      `${colors.red}[!] Unable to connect to ${BASE_URL}. Please ensure the server is running (\`npm start\` or \`npm run dev\`) and MongoDB is connected.${colors.reset}\n`
    );
    console.error(`Error details: ${health.error || JSON.stringify(health.data)}`);
    process.exit(1);
  }
  recordTest('API Health Check (GET /)', true, `${health.duration}ms`);

  const uniqueId = Date.now();
  let customerToken = '';
  let adminToken = '';
  let testCategoryId = '';
  let testProductId = '';
  let testVariantId = '';
  let testOrderId = '';

  // 1. Authentication Tests
  console.log(`\n${colors.yellow}--- [1] Authentication & Users ---${colors.reset}`);

  // Register Customer
  const customerEmail = `customer_${uniqueId}@test.com`;
  const regCustomer = await apiRequest('POST', '/api/auth/register', {
    name: 'Test Customer',
    email: customerEmail,
    password: 'password123',
    phone: '+91 9999900001',
    address: {
      street: '12 Test Lane',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
    },
    role: 'customer',
  });
  recordTest(
    'Register Customer (POST /api/auth/register)',
    regCustomer.status === 201 && regCustomer.data.data?.token,
    `${regCustomer.duration}ms`
  );

  // Login Customer
  const loginCustomer = await apiRequest('POST', '/api/auth/login', {
    email: customerEmail,
    password: 'password123',
  });
  customerToken = loginCustomer.data.data?.token;
  recordTest(
    'Login Customer (POST /api/auth/login)',
    loginCustomer.status === 200 && !!customerToken,
    `${loginCustomer.duration}ms`
  );

  // Get Me
  const getMe = await apiRequest('GET', '/api/auth/me', null, customerToken);
  recordTest(
    'Get Profile (GET /api/auth/me)',
    getMe.status === 200 && getMe.data.data?.email === customerEmail,
    `${getMe.duration}ms`
  );

  // Register Admin
  const adminEmail = `admin_${uniqueId}@test.com`;
  const regAdmin = await apiRequest('POST', '/api/auth/register', {
    name: 'Test Admin',
    email: adminEmail,
    password: 'adminPassword123',
    role: 'admin',
  });
  adminToken = regAdmin.data.data?.token;
  recordTest(
    'Register Admin (POST /api/auth/register)',
    regAdmin.status === 201 && !!adminToken,
    `${regAdmin.duration}ms`
  );

  // 2. Category Management
  console.log(`\n${colors.yellow}--- [2] Category Management ---${colors.reset}`);

  const createCat = await apiRequest(
    'POST',
    '/api/categories',
    {
      name: `Gadgets_${uniqueId}`,
      description: 'Cutting-edge consumer electronic gadgets',
      isActive: true,
    },
    adminToken
  );
  testCategoryId = createCat.data.data?._id;
  recordTest(
    'Create Category (POST /api/categories - Admin)',
    createCat.status === 201 && !!testCategoryId,
    `${createCat.duration}ms`
  );

  const getCats = await apiRequest('GET', '/api/categories');
  recordTest(
    'Get Categories (GET /api/categories - Public)',
    getCats.status === 200 && Array.isArray(getCats.data.data),
    `${getCats.duration}ms`
  );

  // 3. Product Management & Dynamic Specifications / Variants
  console.log(`\n${colors.yellow}--- [3] Dynamic Products, Specifications & Variants ---${colors.reset}`);

  const createProd = await apiRequest(
    'POST',
    '/api/products',
    {
      name: `Pro Noise Cancelling Headphones ${uniqueId}`,
      description: 'Dynamic wireless headphones with active noise cancellation and 40mm drivers',
      price: 14999,
      category: testCategoryId,
      brand: 'AcousticPro',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      rating: 4.8,
      specifications: [
        { name: 'Driver', value: '40mm Neodymium' },
        { name: 'Battery', value: '35 hours' },
      ],
      variants: [
        {
          sku: `AP-BLK-${uniqueId}`,
          title: 'Matte Black',
          color: 'Black',
          price: 14999,
          stock: 12,
        },
        {
          sku: `AP-SLV-${uniqueId}`,
          title: 'Silver White',
          color: 'Silver',
          price: 15499,
          stock: 8,
        },
      ],
    },
    adminToken
  );
  testProductId = createProd.data.data?._id;
  const createdVariants = createProd.data.data?.variants || [];
  testVariantId = createdVariants[1]?._id; // Select Silver White variant (stock: 8, price: 15499)

  recordTest(
    'Create Product with Dynamic Variants & Specs (POST /api/products)',
    createProd.status === 201 && createdVariants.length === 2 && createProd.data.data?.stock === 20,
    `Total Variant Stock: ${createProd.data.data?.stock}`
  );

  // Search by keyword
  const searchProd = await apiRequest('GET', `/api/products?search=Noise`);
  recordTest(
    'Search Products (GET /api/products?search=Noise)',
    searchProd.status === 200 && searchProd.data.count > 0,
    `${searchProd.duration}ms`
  );

  // Dynamic filter by variant color
  const filterVariantColor = await apiRequest('GET', `/api/products?color=Silver`);
  recordTest(
    'Filter by Dynamic Variant Color (GET /api/products?color=Silver)',
    filterVariantColor.status === 200 && filterVariantColor.data.count > 0,
    `Matched ${filterVariantColor.data.count} product(s)`
  );

  // Filter by price range
  const filterPrice = await apiRequest(
    'GET',
    `/api/products?minPrice=10000&maxPrice=20000`
  );
  recordTest(
    'Filter Price Range (GET /api/products?minPrice=10000&maxPrice=20000)',
    filterPrice.status === 200,
    `${filterPrice.duration}ms`
  );

  // 4. Shopping Cart with Dynamic Variant
  console.log(`\n${colors.yellow}--- [4] Shopping Cart with Selected Variant ---${colors.reset}`);

  const addToCart = await apiRequest(
    'POST',
    '/api/cart',
    {
      productId: testProductId,
      variantId: testVariantId,
      quantity: 2,
    },
    customerToken
  );
  recordTest(
    'Add Specific Variant to Cart (POST /api/cart)',
    addToCart.status === 200 && addToCart.data.data?.totalItems >= 2,
    `Added Silver White variant (Qty: 2)`
  );

  const getCart = await apiRequest('GET', '/api/cart', null, customerToken);
  const cartVariantTitle = getCart.data.data?.items?.[0]?.variant?.title;
  recordTest(
    'View Cart & Verify Variant Subtotal (GET /api/cart)',
    getCart.status === 200 && getCart.data.data?.subtotal === 15499 * 2,
    `Variant: '${cartVariantTitle}', Subtotal: ₹${getCart.data.data?.subtotal}`
  );

  const updateCart = await apiRequest(
    'PUT',
    `/api/cart/${testProductId}`,
    { quantity: 3, variantId: testVariantId },
    customerToken
  );
  recordTest(
    'Update Variant Cart Quantity (PUT /api/cart/:id)',
    updateCart.status === 200 && updateCart.data.data?.totalItems === 3,
    `Updated qty to 3, Subtotal: ₹${updateCart.data.data?.subtotal}`
  );

  // 5. Orders & Variant Stock Synchronization
  console.log(`\n${colors.yellow}--- [5] Orders & Variant Stock Synchronization ---${colors.reset}`);

  const placeOrder = await apiRequest(
    'POST',
    '/api/orders',
    {
      shippingAddress: {
        street: '12 Test Lane',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
      },
      paymentMethod: 'UPI',
    },
    customerToken
  );
  testOrderId = placeOrder.data.data?._id;
  recordTest(
    'Place Order with Variant (POST /api/orders)',
    placeOrder.status === 201 && placeOrder.data.data?.orderStatus === 'Placed',
    `Total: ₹${placeOrder.data.data?.totalAmount}`
  );

  // Verify variant stock specifically reduced (8 - 3 = 5), and parent stock reduced (20 - 3 = 17)
  const verifyStockProd = await apiRequest('GET', `/api/products/${testProductId}`);
  const parentStockAfterOrder = verifyStockProd.data.data?.stock;
  const variantStockAfterOrder = verifyStockProd.data.data?.variants?.find(
    (v) => v._id === testVariantId
  )?.stock;

  recordTest(
    'Verify Variant Stock Decrement in DB',
    variantStockAfterOrder === 5 && parentStockAfterOrder === 17,
    `Variant stock: 8 -> ${variantStockAfterOrder}, Total stock: 20 -> ${parentStockAfterOrder}`
  );

  // Verify Cart was cleared
  const verifyCartCleared = await apiRequest('GET', '/api/cart', null, customerToken);
  recordTest(
    'Verify Cart Auto-Cleared After Order',
    verifyCartCleared.data.data?.items?.length === 0,
    'Cart items: 0'
  );

  // 6. Admin Management & Dashboard
  console.log(`\n${colors.yellow}--- [6] Admin System & Dashboard ---${colors.reset}`);

  const adminDashboard = await apiRequest('GET', '/api/admin/dashboard', null, adminToken);
  recordTest(
    'Admin Dashboard Analytics (GET /api/admin/dashboard)',
    adminDashboard.status === 200 && adminDashboard.data.data?.orders?.total > 0,
    `Total Orders: ${adminDashboard.data.data?.orders?.total}`
  );

  const updateOrderStatus = await apiRequest(
    'PUT',
    `/api/admin/orders/${testOrderId}/status`,
    { status: 'Confirmed' },
    adminToken
  );
  recordTest(
    'Admin Update Order Status (PUT /api/admin/orders/:id/status)',
    updateOrderStatus.status === 200 && updateOrderStatus.data.data?.orderStatus === 'Confirmed',
    `${updateOrderStatus.duration}ms`
  );

  // 7. Order Cancellation & Variant Stock Restoration
  console.log(`\n${colors.yellow}--- [7] Order Cancellation & Variant Stock Restoration ---${colors.reset}`);

  const cancelOrder = await apiRequest(
    'PUT',
    `/api/orders/${testOrderId}/cancel`,
    null,
    customerToken
  );
  recordTest(
    'Cancel Order (PUT /api/orders/:id/cancel)',
    cancelOrder.status === 200 && cancelOrder.data.data?.orderStatus === 'Cancelled',
    `${cancelOrder.duration}ms`
  );

  // Verify variant stock restored back to 8, parent stock restored back to 20
  const verifyRestoredStock = await apiRequest('GET', `/api/products/${testProductId}`);
  const parentStockAfterCancel = verifyRestoredStock.data.data?.stock;
  const variantStockAfterCancel = verifyRestoredStock.data.data?.variants?.find(
    (v) => v._id === testVariantId
  )?.stock;

  recordTest(
    'Verify Variant Stock Restored After Cancellation',
    variantStockAfterCancel === 8 && parentStockAfterCancel === 20,
    `Restored Variant stock: ${variantStockAfterCancel}, Parent stock: ${parentStockAfterCancel}`
  );

  // Cleanup test product and category so tests do not pollute customer catalog
  if (testProductId && adminToken) {
    try {
      await apiRequest('DELETE', `/api/products/${testProductId}`, null, adminToken);
    } catch (_) {}
  }
  if (testCategoryId && adminToken) {
    try {
      await apiRequest('DELETE', `/api/categories/${testCategoryId}`, null, adminToken);
    } catch (_) {}
  }

  // Summary
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(
    `${colors.bold}Test Summary: ${colors.green}${passedCount} Passed${colors.reset}, ${
      failedCount > 0 ? `${colors.red}${failedCount} Failed` : `${colors.green}0 Failed`
    } (Total: ${results.length})${colors.reset}`
  );
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
