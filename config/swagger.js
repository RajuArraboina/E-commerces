/**
 * ShopSphere OpenAPI 3.0 / Swagger Specification
 * Dynamically mapped to the actual ShopSphere REST API codebase.
 */

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'ShopSphere – Dynamic E-commerce Platform API',
    version: '1.0.0',
    description: `Complete, production-grade RESTful API documentation for **ShopSphere**.
All data is stored dynamically in MongoDB using Mongoose.

### Authentication
Protected endpoints require a JWT Bearer token.
Click the **Authorize** button above and paste your token in the format:
\`<token>\` (or \`Bearer <token>\`).

### Missing Endpoints from User Prompt Specification
- \`PUT /api/users/change-password\`: **Missing API**. Password updating is implemented directly inside \`PUT /api/users/profile\`.
- \`GET /api/admin/orders/:id\`: **Missing API** under \`/api/admin\`. Single order retrieval for both customers and admins is implemented at \`GET /api/orders/:id\`.`,
    contact: {
      name: 'ShopSphere Backend Team',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  tags: [
    { name: 'Authentication', description: 'User registration, login, logout, and token authentication' },
    { name: 'Users', description: 'Customer profile management and admin user administration' },
    { name: 'Products', description: 'Product catalog, dynamic variants, specifications, and search' },
    { name: 'Categories', description: 'Category management and taxonomy' },
    { name: 'Cart', description: 'Shopping cart operations with variant support' },
    { name: 'Orders', description: 'Order placement, tracking, stock deduction, and cancellation' },
    { name: 'Admin', description: 'Administrative analytics, dashboard, orders, and stock control' },
  ],
  paths: {
    // ----------------------------------------------------
    // AUTHENTICATION
    // ----------------------------------------------------
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new customer or admin account',
        description: 'Creates a new user record in MongoDB, securely hashes the password with bcryptjs, and returns a JWT token.',
        operationId: 'registerUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
              example: {
                name: 'Raju',
                email: 'raju@gmail.com',
                password: 'raju123456',
                phone: '9876543210',
                address: {
                  street: 'MG Road',
                  city: 'Hyderabad',
                  state: 'Telangana',
                  postalCode: '500001',
                  country: 'India',
                },
                role: 'customer',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully with JWT token',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'User registered successfully',
                  data: {
                    _id: '66f123456789abcdef123450',
                    name: 'Raju',
                    email: 'raju@gmail.com',
                    phone: '9876543210',
                    role: 'customer',
                    address: {
                      street: 'MG Road',
                      city: 'Hyderabad',
                      state: 'Telangana',
                      postalCode: '500001',
                      country: 'India',
                    },
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error or email already in use',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'A user with this email address already exists' },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Server error' },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate user & obtain JWT token',
        description: 'Validates user credentials against MongoDB and returns a signed JWT Bearer token.',
        operationId: 'loginUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              example: {
                email: 'raju@gmail.com',
                password: 'raju123456',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful, returns user data and JWT token',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Logged in successfully',
                  data: {
                    _id: '66f123456789abcdef123450',
                    name: 'Raju',
                    email: 'raju@gmail.com',
                    phone: '9876543210',
                    role: 'customer',
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                },
              },
            },
          },
          400: {
            description: 'Missing email or password',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Please provide email and password' },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Invalid email or password' },
              },
            },
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Log out current user',
        description: 'Logs out the user and clears any session cookie if present.',
        operationId: 'logoutUser',
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                example: { success: true, message: 'Logged out successfully' },
              },
            },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get currently authenticated user',
        description: 'Returns profile details for the user identified by the Bearer token.',
        operationId: 'getMe',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user profile retrieved',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    _id: '66f123456789abcdef123450',
                    name: 'Raju',
                    email: 'raju@gmail.com',
                    phone: '9876543210',
                    role: 'customer',
                    address: {
                      street: 'MG Road',
                      city: 'Hyderabad',
                      state: 'Telangana',
                      postalCode: '500001',
                      country: 'India',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - Invalid or missing token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Not authorized, token failed or not provided' },
              },
            },
          },
        },
      },
    },

    // ----------------------------------------------------
    // USERS
    // ----------------------------------------------------
    '/api/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Get customer profile',
        description: 'Retrieves the profile of the currently logged-in user.',
        operationId: 'getUserProfile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'User profile retrieved successfully',
                  data: {
                    _id: '66f123456789abcdef123450',
                    name: 'Raju',
                    email: 'raju@gmail.com',
                    phone: '9876543210',
                    role: 'customer',
                    address: {
                      street: 'MG Road',
                      city: 'Hyderabad',
                      state: 'Telangana',
                      postalCode: '500001',
                      country: 'India',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update profile and/or change password',
        description: 'Updates personal details (name, phone, address) and allows changing the password when provided.',
        operationId: 'updateUserProfile',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserRequest' },
              example: {
                name: 'Raju A.',
                phone: '9876543210',
                password: 'newpassword123',
                address: {
                  street: 'Banjara Hills Rd 12',
                  city: 'Hyderabad',
                  state: 'Telangana',
                  postalCode: '500034',
                  country: 'India',
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Profile updated successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Profile updated successfully',
                  data: {
                    _id: '66f123456789abcdef123450',
                    name: 'Raju A.',
                    email: 'raju@gmail.com',
                    phone: '9876543210',
                    role: 'customer',
                  },
                },
              },
            },
          },
          400: {
            description: 'Password too short or invalid field',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Password must be at least 6 characters long' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users with pagination & search (Admin only)',
        description: 'Admin retrieves registered users filtered by role or search keyword.',
        operationId: 'getAllUsers',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name or email' },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['customer', 'admin'] }, description: 'Filter by role' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Items per page' },
        ],
        responses: {
          200: {
            description: 'List of users with pagination metadata',
            content: {
              'application/json': {
                example: {
                  success: true,
                  count: 1,
                  total: 25,
                  totalPages: 3,
                  currentPage: 1,
                  data: [
                    {
                      _id: '66f123456789abcdef123450',
                      name: 'Raju',
                      email: 'raju@gmail.com',
                      role: 'customer',
                      createdAt: '2026-09-30T04:45:00.000Z',
                    },
                  ],
                },
              },
            },
          },
          403: {
            description: 'Forbidden - Admin access required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Access denied: Admins only' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Admin creates a user directly (Admin only)',
        description: 'Allows an administrator to create another admin or customer directly.',
        operationId: 'createUserByAdmin',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
              example: {
                name: 'Support Admin',
                email: 'support@shopsphere.com',
                password: 'adminPassword123',
                role: 'admin',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'User created successfully',
                  data: {
                    _id: '66f123456789abcdef123451',
                    name: 'Support Admin',
                    email: 'support@shopsphere.com',
                    role: 'admin',
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get single user by ID (Admin only)',
        operationId: 'getUserById',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'User details',
            content: { 'application/json': { example: { success: true, data: { _id: '66f123456789abcdef123450', name: 'Raju' } } } },
          },
          404: { description: 'User not found' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update user details or role (Admin only)',
        operationId: 'updateUserByAdmin',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string', enum: ['customer', 'admin'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User updated successfully' },
          404: { description: 'User not found' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user account (Admin only)',
        operationId: 'deleteUserByAdmin',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'User deleted successfully' },
          400: { description: 'Admins cannot delete their own account' },
          404: { description: 'User not found' },
        },
      },
    },

    // ----------------------------------------------------
    // PRODUCTS
    // ----------------------------------------------------
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Get products with dynamic search, filter, sort & pagination',
        description: `Searches and filters products in MongoDB.
Supports filtering by category name or ObjectId, brand, price range, stock availability, dynamic variant attributes (color, size, storage), and sorting.`,
        operationId: 'getProducts',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Keyword search across name, description, brand, variants' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Category ObjectId or Category Name (e.g. Electronics)' },
          { name: 'brand', in: 'query', schema: { type: 'string' }, description: 'Brand name (case-insensitive)' },
          { name: 'minPrice', in: 'query', schema: { type: 'number' }, description: 'Minimum price filter' },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' }, description: 'Maximum price filter' },
          { name: 'inStock', in: 'query', schema: { type: 'boolean' }, description: 'Filter only items with stock > 0' },
          { name: 'color', in: 'query', schema: { type: 'string' }, description: 'Variant color filter' },
          { name: 'size', in: 'query', schema: { type: 'string' }, description: 'Variant size filter' },
          { name: 'storage', in: 'query', schema: { type: 'string' }, description: 'Variant storage filter' },
          { name: 'minRating', in: 'query', schema: { type: 'number' }, description: 'Minimum rating (0 - 5)' },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['price', '-price', 'rating', 'newest', 'name'] }, description: 'Sort criteria' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Items per page' },
        ],
        responses: {
          200: {
            description: 'Paginated list of products',
            content: {
              'application/json': {
                example: {
                  success: true,
                  count: 1,
                  total: 15,
                  totalPages: 2,
                  currentPage: 1,
                  data: [
                    {
                      _id: '66f123456789abcdef123499',
                      name: 'Apple iPhone 17',
                      description: 'Latest Apple smartphone with advanced camera and high-performance processor.',
                      price: 79999,
                      brand: 'Apple',
                      category: {
                        _id: '66f123456789abcdef123456',
                        name: 'Electronics',
                        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
                      },
                      stock: 25,
                      image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500',
                      rating: 4.5,
                      isAvailable: true,
                      specifications: [
                        { name: 'Processor', value: 'A18 Bionic' },
                        { name: 'Display', value: '6.3-inch Super Retina XDR OLED' },
                      ],
                      variants: [
                        {
                          _id: '66f123456789abcdef123498',
                          sku: 'IPH17-BLK-128',
                          title: 'Black / 128GB',
                          color: 'Black',
                          storage: '128GB',
                          price: 79999,
                          stock: 15,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create a new product with dynamic specifications & variants (Admin only)',
        description: `Creates a new product in MongoDB.
**Validation Rules:**
- \`name\`: String, required, max 150 chars
- \`description\`: String, required
- \`price\`: Number, required, min 0
- \`category\`: MongoDB ObjectId OR Category Name (e.g. "Electronics"), required
- \`brand\`: String, required
- \`stock\`: Number, min 0 (auto-calculated from variants if variants provided)
- \`rating\`: Number, 0 - 5
- \`isAvailable\`: Boolean (auto-synced with stock > 0)`,
        operationId: 'createProduct',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductRequest' },
              example: {
                name: 'Apple iPhone 17',
                description: 'Latest Apple smartphone with advanced camera and powerful processor.',
                price: 79999,
                category: 'Electronics',
                brand: 'Apple',
                stock: 25,
                image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500',
                rating: 4.5,
                isAvailable: true,
                specifications: [
                  { name: 'Processor', value: 'A18 Bionic' },
                  { name: 'Display', value: '6.3-inch Super Retina XDR' },
                ],
                variants: [
                  {
                    sku: 'IPH17-BLK-128',
                    title: 'Black / 128GB',
                    color: 'Black',
                    storage: '128GB',
                    price: 79999,
                    stock: 15,
                  },
                  {
                    sku: 'IPH17-BLU-256',
                    title: 'Blue / 256GB',
                    color: 'Blue',
                    storage: '256GB',
                    price: 89999,
                    stock: 10,
                  },
                ],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Product created successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Product created successfully',
                  data: {
                    _id: '66f123456789abcdef123499',
                    name: 'Apple iPhone 17',
                    price: 79999,
                    stock: 25,
                    isAvailable: true,
                  },
                },
              },
            },
          },
          400: {
            description: 'Missing required fields or invalid category',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Please provide name, description, price, category, and brand' },
              },
            },
          },
          401: {
            description: 'Unauthorized - Admin token required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Not authorized, no token provided in Authorization header' },
              },
            },
          },
          403: {
            description: 'Forbidden - Only admins can create products',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Access denied: Admins only' },
              },
            },
          },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get single product details with populated category & variants',
        operationId: 'getProductById',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Product retrieved successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Product details retrieved successfully',
                  data: {
                    _id: '66f123456789abcdef123499',
                    name: 'Apple iPhone 17',
                    price: 79999,
                    brand: 'Apple',
                    category: { name: 'Electronics' },
                    stock: 25,
                    variants: [],
                  },
                },
              },
            },
          },
          404: {
            description: 'Product not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Product not found' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Products'],
        summary: 'Update product by ID (Admin only)',
        operationId: 'updateProduct',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductRequest' },
              example: {
                price: 74999,
                stock: 30,
              },
            },
          },
        },
        responses: {
          200: { description: 'Product updated successfully' },
          404: { description: 'Product not found' },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product by ID (Admin only)',
        operationId: 'deleteProduct',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Product deleted successfully',
            content: {
              'application/json': {
                example: { success: true, message: 'Product deleted successfully' },
              },
            },
          },
          404: { description: 'Product not found' },
        },
      },
    },

    // ----------------------------------------------------
    // CATEGORIES
    // ----------------------------------------------------
    '/api/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Get all categories',
        description: 'Returns active categories sorted alphabetically. Pass `?all=true` to view inactive categories.',
        operationId: 'getCategories',
        parameters: [
          { name: 'all', in: 'query', schema: { type: 'boolean', default: false }, description: 'Include inactive categories' },
        ],
        responses: {
          200: {
            description: 'List of categories',
            content: {
              'application/json': {
                example: {
                  success: true,
                  count: 2,
                  data: [
                    {
                      _id: '66f123456789abcdef123456',
                      name: 'Electronics',
                      description: 'Electronic devices and accessories',
                      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
                      isActive: true,
                    },
                    {
                      _id: '66f123456789abcdef123457',
                      name: 'Fashion',
                      description: 'Clothing and apparel',
                      isActive: true,
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create a new category (Admin only)',
        operationId: 'createCategory',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CategoryRequest' },
              example: {
                name: 'Electronics',
                description: 'Electronic devices and accessories',
                image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
                isActive: true,
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Category created successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Category created successfully',
                  data: {
                    _id: '66f123456789abcdef123456',
                    name: 'Electronics',
                    description: 'Electronic devices and accessories',
                    isActive: true,
                  },
                },
              },
            },
          },
          400: {
            description: 'Duplicate name or missing name',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'A category with this name already exists' },
              },
            },
          },
        },
      },
    },
    '/api/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Get category details and product count by ID',
        operationId: 'getCategoryById',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Category details with assigned product count',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    _id: '66f123456789abcdef123456',
                    name: 'Electronics',
                    description: 'Electronic devices and accessories',
                    productCount: 12,
                  },
                },
              },
            },
          },
          404: { description: 'Category not found' },
        },
      },
      put: {
        tags: ['Categories'],
        summary: 'Update category by ID (Admin only)',
        operationId: 'updateCategory',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CategoryRequest' },
              example: {
                name: 'Consumer Electronics & Gadgets',
                description: 'Updated description',
              },
            },
          },
        },
        responses: {
          200: { description: 'Category updated successfully' },
          400: { description: 'Duplicate category name' },
          404: { description: 'Category not found' },
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete category by ID (Admin only)',
        description: 'Deletes category. Fails with 400 if any products are still assigned to this category.',
        operationId: 'deleteCategory',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Category deleted successfully' },
          400: {
            description: 'Cannot delete: products are still assigned to category',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Cannot delete category: 4 product(s) are assigned to it' },
              },
            },
          },
          404: { description: 'Category not found' },
        },
      },
    },

    // ----------------------------------------------------
    // CART
    // ----------------------------------------------------
    '/api/cart': {
      get: {
        tags: ['Cart'],
        summary: 'View customer shopping cart & calculated subtotal',
        description: 'Retrieves current user shopping cart with populated product details, variant information, total item count, and subtotal.',
        operationId: 'getCart',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Cart retrieved successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    _id: '66f123456789abcdef123480',
                    user: '66f123456789abcdef123450',
                    items: [
                      {
                        _id: '66f123456789abcdef123481',
                        product: {
                          _id: '66f123456789abcdef123499',
                          name: 'Apple iPhone 17',
                          image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500',
                          stock: 25,
                        },
                        variant: {
                          variantId: '66f123456789abcdef123498',
                          sku: 'IPH17-BLK-128',
                          title: 'Black / 128GB',
                          color: 'Black',
                          storage: '128GB',
                        },
                        quantity: 2,
                        price: 79999,
                      },
                    ],
                    subtotal: 159998,
                    totalItems: 2,
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Cart'],
        summary: 'Add product or variant to shopping cart',
        description: 'Validates available inventory stock before adding item to cart.',
        operationId: 'addToCart',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CartRequest' },
              example: {
                productId: '66f123456789abcdef123499',
                variantId: '66f123456789abcdef123498',
                quantity: 2,
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Item added to cart',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Item added to cart',
                  data: { subtotal: 159998, totalItems: 2 },
                },
              },
            },
          },
          400: {
            description: 'Requested quantity exceeds stock',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Cannot add 30 item(s). Only 25 available in stock.' },
              },
            },
          },
          404: {
            description: 'Product or variant not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Product not found' },
              },
            },
          },
        },
      },
    },
    '/api/cart/{productId}': {
      put: {
        tags: ['Cart'],
        summary: 'Update item quantity in cart',
        operationId: 'updateCartItemQuantity',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['quantity'],
                properties: {
                  quantity: { type: 'integer', minimum: 1, example: 3 },
                  variantId: { type: 'string', example: '66f123456789abcdef123498' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cart updated successfully' },
          400: { description: 'Quantity exceeds available stock' },
          404: { description: 'Item not in cart' },
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Remove specific item or variant from cart',
        operationId: 'removeFromCart',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'variantId', in: 'query', schema: { type: 'string' }, description: 'Variant ID if specific variant is targeted' },
        ],
        responses: {
          200: { description: 'Item removed from cart' },
          404: { description: 'Item not in cart' },
        },
      },
    },
    '/api/cart/clear': {
      delete: {
        tags: ['Cart'],
        summary: 'Clear all items from shopping cart',
        operationId: 'clearCart',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Cart cleared successfully',
            content: {
              'application/json': {
                example: { success: true, message: 'Cart cleared successfully' },
              },
            },
          },
        },
      },
    },

    // ----------------------------------------------------
    // ORDERS
    // ----------------------------------------------------
    '/api/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Place order, deduct stock & auto-clear cart',
        description: `Places an order. Items are pulled from the customer's shopping cart (or directly passed in \`items\`).
- Validates delivery address and checks stock for each product/variant.
- Deducts stock and auto-sets \`isAvailable: false\` if stock hits 0.
- Handles payment mode (\`Cash on Delivery\`, \`UPI\`, \`Card\`).
- Automatically empties the customer's cart.`,
        operationId: 'createOrder',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OrderRequest' },
              example: {
                shippingAddress: {
                  street: 'MG Road',
                  city: 'Hyderabad',
                  state: 'Telangana',
                  postalCode: '500001',
                  country: 'India',
                  phone: '9876543210',
                },
                paymentMethod: 'Cash on Delivery',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Order placed successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Order placed successfully',
                  data: {
                    _id: '66f123456789abcdef123470',
                    totalAmount: 159998,
                    orderStatus: 'Placed',
                    paymentMethod: 'Cash on Delivery',
                    paymentStatus: 'Pending',
                  },
                },
              },
            },
          },
          400: {
            description: 'Cart is empty or insufficient stock',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Your cart is empty. Add products before checkout.' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Orders'],
        summary: 'Get customer order history',
        operationId: 'getMyOrders',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Customer orders list',
            content: {
              'application/json': {
                example: {
                  success: true,
                  count: 1,
                  data: [
                    {
                      _id: '66f123456789abcdef123470',
                      totalAmount: 159998,
                      orderStatus: 'Placed',
                      paymentMethod: 'Cash on Delivery',
                      paymentStatus: 'Pending',
                      createdAt: '2026-09-30T04:45:00.000Z',
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get single order details by ID',
        description: 'Customer can view their own order; Admins can view any order in the system.',
        operationId: 'getOrderById',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Order details',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: {
                    _id: '66f123456789abcdef123470',
                    items: [
                      {
                        name: 'Apple iPhone 17',
                        price: 79999,
                        quantity: 2,
                      },
                    ],
                    totalAmount: 159998,
                    orderStatus: 'Placed',
                  },
                },
              },
            },
          },
          403: { description: 'Not authorized to view this order' },
          404: { description: 'Order not found' },
        },
      },
    },
    '/api/orders/{id}/cancel': {
      put: {
        tags: ['Orders'],
        summary: 'Cancel order & restore stock',
        description: 'Cancels order (allowed only if order is in Placed or Confirmed state). Restores stock for all items.',
        operationId: 'cancelOrder',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Order cancelled and stock restored successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Order cancelled successfully. Product stock has been restored.',
                  data: { orderStatus: 'Cancelled' },
                },
              },
            },
          },
          400: {
            description: 'Order cannot be cancelled in current status',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { success: false, message: 'Cannot cancel order in status: Shipped' },
              },
            },
          },
        },
      },
    },
    '/api/orders/{id}/pay': {
      put: {
        tags: ['Orders'],
        summary: 'Simulate payment completion',
        description: 'Simulates payment for a pending order without storing card details.',
        operationId: 'simulatePayment',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  paymentMethod: { type: 'string', enum: ['UPI', 'Card', 'Cash on Delivery'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Payment marked as Completed' },
          400: { description: 'Order already paid or cancelled' },
        },
      },
    },

    // ----------------------------------------------------
    // ADMIN
    // ----------------------------------------------------
    '/api/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Admin dashboard analytics & revenue metrics',
        description: 'Provides live MongoDB statistics including user counts, product inventory counts, order status counts, and total sales revenue.',
        operationId: 'getAdminDashboard',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard statistics retrieved successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Dashboard analytics retrieved successfully',
                  data: {
                    users: { total: 120, customers: 115, admins: 5 },
                    products: { total: 85, outOfStock: 3, lowStockCount: 5 },
                    categories: { total: 10 },
                    orders: {
                      total: 250,
                      placed: 30,
                      confirmed: 20,
                      processing: 15,
                      shipped: 40,
                      delivered: 140,
                      cancelled: 5,
                    },
                    financials: { totalRevenue: 1250000, currency: 'INR' },
                  },
                },
              },
            },
          },
          403: { description: 'Access denied: Admins only' },
        },
      },
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List all registered users (Admin only)',
        operationId: 'getAdminUsers',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'User list retrieved' },
          403: { description: 'Admins only' },
        },
      },
    },
    '/api/admin/orders': {
      get: {
        tags: ['Admin'],
        summary: 'List all system orders with status filter & pagination (Admin only)',
        operationId: 'getAdminOrders',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'orderStatus',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
            },
          },
          { name: 'paymentStatus', in: 'query', schema: { type: 'string', enum: ['Pending', 'Completed', 'Failed'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'System orders retrieved' },
          403: { description: 'Admins only' },
        },
      },
    },
    '/api/admin/orders/{id}/status': {
      put: {
        tags: ['Admin'],
        summary: 'Update order lifecycle status (Admin only)',
        description: `Lifecycle statuses:
\`Placed\` → \`Confirmed\` → \`Processing\` → \`Shipped\` → \`Out for Delivery\` → \`Delivered\` → \`Cancelled\`.
Cancelling an order automatically restores product stock.`,
        operationId: 'updateOrderStatus',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: [
                      'Placed',
                      'Confirmed',
                      'Processing',
                      'Shipped',
                      'Out for Delivery',
                      'Delivered',
                      'Cancelled',
                    ],
                    example: 'Shipped',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Order status updated successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: "Order status updated to 'Shipped' successfully",
                  data: { _id: '66f123456789abcdef123470', orderStatus: 'Shipped' },
                },
              },
            },
          },
          400: { description: 'Invalid status' },
          404: { description: 'Order not found' },
        },
      },
    },
    '/api/admin/products/{id}/stock': {
      put: {
        tags: ['Admin'],
        summary: 'Update product stock directly (Admin only)',
        operationId: 'updateProductStock',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['stock'],
                properties: {
                  stock: { type: 'number', minimum: 0, example: 50 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Stock updated successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: "Stock updated for 'Apple iPhone 17' to 50",
                },
              },
            },
          },
          404: { description: 'Product not found' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Input your JWT Bearer token obtained from `POST /api/auth/login` or `POST /api/auth/register`.',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message description' },
        },
      },
      Address: {
        type: 'object',
        properties: {
          street: { type: 'string', example: 'MG Road' },
          city: { type: 'string', example: 'Hyderabad' },
          state: { type: 'string', example: 'Telangana' },
          postalCode: { type: 'string', example: '500001' },
          country: { type: 'string', example: 'India' },
          phone: { type: 'string', example: '9876543210' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', maxLength: 60, example: 'Raju' },
          email: { type: 'string', format: 'email', example: 'raju@gmail.com' },
          password: { type: 'string', minLength: 6, example: 'raju123456' },
          phone: { type: 'string', example: '9876543210' },
          address: { $ref: '#/components/schemas/Address' },
          role: { type: 'string', enum: ['customer', 'admin'], default: 'customer' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'raju@gmail.com' },
          password: { type: 'string', example: 'raju123456' },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Raju A.' },
          phone: { type: 'string', example: '9876543210' },
          password: { type: 'string', minLength: 6, example: 'newsecret123' },
          address: { $ref: '#/components/schemas/Address' },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66f123456789abcdef123450' },
          name: { type: 'string', example: 'Raju' },
          email: { type: 'string', example: 'raju@gmail.com' },
          phone: { type: 'string', example: '9876543210' },
          role: { type: 'string', enum: ['customer', 'admin'], example: 'customer' },
          address: { $ref: '#/components/schemas/Address' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Specification: {
        type: 'object',
        required: ['name', 'value'],
        properties: {
          name: { type: 'string', example: 'Processor' },
          value: { type: 'string', example: 'A18 Bionic' },
        },
      },
      ProductVariant: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          sku: { type: 'string', example: 'IPH17-BLK-128' },
          title: { type: 'string', example: 'Black / 128GB' },
          color: { type: 'string', example: 'Black' },
          size: { type: 'string', example: '6.3 inch' },
          storage: { type: 'string', example: '128GB' },
          price: { type: 'number', example: 79999 },
          stock: { type: 'number', example: 15 },
          image: { type: 'string' },
          isAvailable: { type: 'boolean', default: true },
        },
      },
      ProductRequest: {
        type: 'object',
        required: ['name', 'description', 'price', 'category', 'brand'],
        properties: {
          name: { type: 'string', maxLength: 150, example: 'Apple iPhone 17' },
          description: { type: 'string', example: 'Latest Apple smartphone with advanced camera and powerful processor.' },
          price: { type: 'number', minimum: 0, example: 79999 },
          category: { type: 'string', description: 'Category ObjectId OR Category Name', example: 'Electronics' },
          brand: { type: 'string', example: 'Apple' },
          stock: { type: 'number', minimum: 0, default: 0, example: 25 },
          image: { type: 'string', example: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500' },
          rating: { type: 'number', minimum: 0, maximum: 5, example: 4.5 },
          isAvailable: { type: 'boolean', default: true },
          specifications: {
            type: 'array',
            items: { $ref: '#/components/schemas/Specification' },
          },
          variants: {
            type: 'array',
            items: { $ref: '#/components/schemas/ProductVariant' },
          },
        },
      },
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66f123456789abcdef123499' },
          name: { type: 'string', example: 'Apple iPhone 17' },
          description: { type: 'string', example: 'Latest Apple smartphone' },
          price: { type: 'number', example: 79999 },
          category: { type: 'string', example: '66f123456789abcdef123456' },
          brand: { type: 'string', example: 'Apple' },
          stock: { type: 'number', example: 25 },
          image: { type: 'string', example: 'https://example.com/iphone.jpg' },
          rating: { type: 'number', example: 4.5 },
          isAvailable: { type: 'boolean', example: true },
          specifications: {
            type: 'array',
            items: { $ref: '#/components/schemas/Specification' },
          },
          variants: {
            type: 'array',
            items: { $ref: '#/components/schemas/ProductVariant' },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CategoryRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', maxLength: 50, example: 'Electronics' },
          description: { type: 'string', example: 'Electronic devices and accessories' },
          image: { type: 'string', example: 'https://example.com/electronics.jpg' },
          isActive: { type: 'boolean', default: true },
        },
      },
      Category: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66f123456789abcdef123456' },
          name: { type: 'string', example: 'Electronics' },
          description: { type: 'string', example: 'Electronic devices and accessories' },
          image: { type: 'string', example: 'https://example.com/electronics.jpg' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CartRequest: {
        type: 'object',
        required: ['productId'],
        properties: {
          productId: { type: 'string', example: '66f123456789abcdef123499' },
          variantId: { type: 'string', example: '66f123456789abcdef123498' },
          quantity: { type: 'integer', minimum: 1, default: 1, example: 2 },
        },
      },
      CartItem: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          product: { $ref: '#/components/schemas/Product' },
          variant: { $ref: '#/components/schemas/ProductVariant' },
          quantity: { type: 'number', example: 2 },
          price: { type: 'number', example: 79999 },
        },
      },
      Cart: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/CartItem' },
          },
          subtotal: { type: 'number', example: 159998 },
          totalItems: { type: 'number', example: 2 },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          product: { type: 'string' },
          name: { type: 'string', example: 'Apple iPhone 17' },
          price: { type: 'number', example: 79999 },
          quantity: { type: 'number', example: 2 },
          image: { type: 'string' },
        },
      },
      OrderRequest: {
        type: 'object',
        required: ['shippingAddress', 'paymentMethod'],
        properties: {
          shippingAddress: { $ref: '#/components/schemas/Address' },
          paymentMethod: {
            type: 'string',
            enum: ['Cash on Delivery', 'UPI', 'Card'],
            example: 'Cash on Delivery',
          },
          items: {
            type: 'array',
            description: 'Optional: leave blank to order all items currently in cart',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                variantId: { type: 'string' },
                quantity: { type: 'number' },
              },
            },
          },
        },
      },
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66f123456789abcdef123470' },
          user: { type: 'string', example: '66f123456789abcdef123450' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderItem' },
          },
          shippingAddress: { $ref: '#/components/schemas/Address' },
          paymentMethod: { type: 'string', enum: ['Cash on Delivery', 'UPI', 'Card'] },
          paymentStatus: { type: 'string', enum: ['Pending', 'Completed', 'Failed'] },
          orderStatus: {
            type: 'string',
            enum: [
              'Placed',
              'Confirmed',
              'Processing',
              'Shipped',
              'Out for Delivery',
              'Delivered',
              'Cancelled',
            ],
          },
          totalAmount: { type: 'number', example: 159998 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
