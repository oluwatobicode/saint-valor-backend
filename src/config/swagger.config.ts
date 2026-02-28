import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Saint Valor Jewelry E-Commerce API",
      version: "1.0.0",
      description:
        "Complete REST API for Saint Valor — a luxury jewelry e-commerce platform. This API handles authentication, product browsing, order management with Paystack payments, favourites, and admin operations.\n\n**Base URL:** `http://localhost:5000/api/v1`\n\n**Production URL:** `https://saint-valor-backend.onrender.com/api/v1`\n\n## 🔐 Authentication Flow\n\n**Signup → Verify Email → Login**\n1. `POST /auth/signup` — creates account, sends 6-digit OTP to email\n2. `POST /auth/verify-email` — validates OTP, returns JWT token\n3. `POST /auth/login` — for returning users (blocked until email is verified)\n\nFor all protected requests, pass the JWT as:\n```\nAuthorization: Bearer <your_token_here>\n```\n\n## 💳 Payment Flow (Paystack)\n\n1. **Initialize** → `POST /orders/initialize` → order saved, returns Paystack `authorization_url`\n2. **Redirect** → Send the user to that URL (Paystack handles payment)\n3. **Verify** → After payment, Paystack redirects back with `?reference=xxx`. Call `POST /orders/verify/:reference` — no body needed, all data was saved at step 1.\n\n## 👤 Roles\n\n- **customer** — can browse products, manage favourites, place orders\n- **admin** — can manage products, categories, collections, orders, and view dashboard stats",
      contact: {
        name: "Saint Valor Dev Team",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local development server",
      },
      {
        url: "https://saint-valor-backend.onrender.com/api/v1",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter the JWT token you received from login or signup. Example: eyJhbGciOiJIUzI1NiIs...",
        },
      },
      schemas: {
        // ─── Auth Schemas ───
        SignupRequest: {
          type: "object",
          required: ["firstName", "lastName", "email", "password"],
          properties: {
            firstName: {
              type: "string",
              example: "Treasure",
              description: "User's first name",
            },
            lastName: {
              type: "string",
              example: "Odetokun",
              description: "User's last name",
            },
            email: {
              type: "string",
              format: "email",
              example: "treasure@gmail.com",
              description: "User's email address (must be unique)",
            },
            password: {
              type: "string",
              format: "password",
              example: "Password123!",
              description:
                "User's password (stored encrypted, never returned in responses)",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "treasure@gmail.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "Password123!",
            },
          },
        },
        // Response after a successful signup (OTP sent, no JWT)
        SignupResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            message: {
              type: "string",
              example:
                "Account created. A 6-digit verification code has been sent to your email.",
            },
            data: {
              type: "object",
              properties: {
                email: {
                  type: "string",
                  example: "treasure@gmail.com",
                  description: "The email address the OTP was sent to",
                },
              },
            },
          },
        },
        // Verify email request
        VerifyEmailRequest: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "treasure@gmail.com",
            },
            otp: {
              type: "string",
              example: "482910",
              description: "6-digit code sent to the user's email",
            },
          },
        },
        // Response with JWT token (login or verify-email)
        AuthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            message: { type: "string", example: "Login successful" },
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              description:
                "JWT token — save this and include it in the Authorization header for all protected requests",
            },
            data: {
              type: "object",
              properties: {
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "507f1f77bcf86cd799439011" },
                    firstName: { type: "string", example: "Treasure" },
                    lastName: { type: "string", example: "Odetokun" },
                    email: { type: "string", example: "treasure@example.com" },
                    role: {
                      type: "string",
                      enum: ["customer", "admin"],
                      example: "customer",
                    },
                  },
                },
              },
            },
          },
        },
        UpdateProfileRequest: {
          type: "object",
          description:
            "All fields are optional — only send what you want to update",
          properties: {
            firstName: { type: "string", example: "Treasure" },
            lastName: { type: "string", example: "Odetokun" },
            phone: { type: "string", example: "+2348012345678" },
            address: {
              type: "object",
              properties: {
                street: { type: "string", example: "123 Lagos St" },
                city: { type: "string", example: "Lekki" },
                state: { type: "string", example: "Lagos" },
                zipCode: { type: "string", example: "100001" },
                country: { type: "string", example: "Nigeria" },
              },
            },
          },
        },
        // ─── User Schema ───
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            firstName: { type: "string", example: "Treasure" },
            lastName: { type: "string", example: "Odetokun" },
            email: { type: "string", example: "treasure@gmail.com" },
            phone: { type: "string", example: "+2348012345678" },
            role: {
              type: "string",
              enum: ["customer", "admin"],
              example: "customer",
            },
            isVerified: {
              type: "boolean",
              example: true,
              description: "Whether the user has verified their email address",
            },
            address: {
              type: "object",
              properties: {
                street: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                zipCode: { type: "string" },
                country: { type: "string" },
              },
            },
            memberSince: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00.000Z",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        // ─── Product Schemas ───
        Product: {
          type: "object",
          properties: {
            _id: { type: "string" },
            productName: {
              type: "string",
              example: "Gold Elegance Ring",
            },
            productDescription: {
              type: "string",
              example: "A stunning 18k gold ring...",
            },
            productPrice: { type: "number", example: 150000 },
            mainImage: {
              type: "string",
              example: "https://res.cloudinary.com/.../main.jpg",
            },
            otherImages: {
              type: "array",
              items: { type: "string" },
            },
            productJewelryType: {
              type: "string",
              enum: [
                "Rings",
                "Necklaces",
                "Earrings",
                "Bracelets",
                "Pant Chains",
                "Anklets",
              ],
              example: "Rings",
              description:
                "Type of jewelry. Allowed values: Rings, Necklaces, Earrings, Bracelets, Pant Chains, Anklets.",
            },
            productMaterial: { type: "string", example: "Gold" },
            productKarat: { type: "string", example: "18k" },
            productSizes: {
              type: "array",
              description: "Array of available sizes with stock quantities",
              items: {
                type: "object",
                properties: {
                  size: {
                    type: "string",
                    enum: ["Small", "Medium", "Large"],
                  },
                  quantity: { type: "integer", example: 10 },
                },
              },
            },
            productCategory: {
              type: "object",
              properties: {
                _id: { type: "string" },
                name: { type: "string", example: "Rings" },
                slug: { type: "string", example: "rings" },
              },
            },
            productCollection: {
              type: "object",
              properties: {
                _id: { type: "string" },
                name: { type: "string", example: "Summer 2024" },
                slug: { type: "string", example: "summer-2024" },
              },
            },
            productSalesCount: { type: "number", example: 42 },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // ─── Category Schema ───
        Category: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Rings" },
            slug: { type: "string", example: "rings" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // ─── Collection Schema ───
        Collection: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Summer 2024" },
            slug: { type: "string", example: "summer-2024" },
            description: { type: "string" },
            image: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // ─── Order Schemas ───
        OrderItem: {
          type: "object",
          required: ["productId", "productName", "price", "quantity"],
          properties: {
            productId: {
              type: "string",
              description: "The MongoDB _id of the product",
              example: "507f1f77bcf86cd799439011",
            },
            productName: { type: "string", example: "Gold Elegance Ring" },
            price: {
              type: "number",
              description: "Price per unit in Naira",
              example: 150000,
            },
            quantity: { type: "integer", example: 1 },
            size: { type: "string", example: "Medium" },
          },
        },
        InitializeOrderRequest: {
          type: "object",
          required: [
            "items",
            "firstName",
            "lastName",
            "phoneNumber",
            "address",
            "country",
            "state",
            "city",
            "shippingMethod",
          ],
          properties: {
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" },
              description: "Array of items being purchased",
            },
            firstName: { type: "string", example: "Treasure" },
            lastName: { type: "string", example: "Odetokun" },
            countryCode: { type: "string", example: "+234" },
            phoneNumber: { type: "string", example: "08012345678" },
            address: { type: "string", example: "123 Lagos St" },
            country: { type: "string", example: "Nigeria" },
            state: { type: "string", example: "Lagos" },
            city: { type: "string", example: "Lekki" },
            shippingMethod: {
              type: "string",
              example: "standard",
              description: "Shipping method chosen by the customer",
            },
          },
        },
        InitializeOrderResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            message: { type: "string", example: "Payment initialized" },
            data: {
              type: "object",
              properties: {
                authorization_url: {
                  type: "string",
                  example: "https://checkout.paystack.com/abc123xyz",
                  description:
                    "IMPORTANT: Redirect the user to this URL. This is Paystack's checkout page where they enter their card details and complete payment.",
                },
                access_code: {
                  type: "string",
                  example: "abc123xyz",
                  description: "Paystack access code (rarely needed directly)",
                },
                reference: {
                  type: "string",
                  example: "SV-PAY-1771925129044-yo6ha",
                  description:
                    "Unique payment reference. After payment, Paystack will redirect back with this reference in the URL. You need it to verify the payment.",
                },
                orderDetails: {
                  type: "object",
                  description:
                    "IMPORTANT: Save these details (e.g. in localStorage). You will need to send them back when verifying the payment in Step 3.",
                  properties: {
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/OrderItem" },
                    },
                    totalPrice: { type: "number", example: 150000 },
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    countryCode: { type: "string" },
                    phoneNumber: { type: "string" },
                    address: { type: "string" },
                    country: { type: "string" },
                    state: { type: "string" },
                    city: { type: "string" },
                    shippingMethod: { type: "string" },
                  },
                },
              },
            },
          },
        },
        // VerifyOrderRequest removed — verify-order endpoint takes NO body.
        // All order data is already saved in the DB at initialize time.
        Order: {
          type: "object",
          properties: {
            _id: { type: "string" },
            orderId: {
              type: "string",
              example: "SV-1000-001",
              description: "Human-readable order ID",
            },
            firstName: { type: "string" },
            lastName: { type: "string" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" },
            },
            totalPrice: { type: "number", example: 150000 },
            orderStatus: {
              type: "string",
              enum: ["pending", "ongoing", "completed", "cancelled"],
              example: "ongoing",
            },
            paymentStatus: {
              type: "string",
              enum: ["pending", "paid", "failed"],
              example: "paid",
            },
            paystackReference: {
              type: "string",
              example: "SV-PAY-1771925129044-yo6ha",
            },
            address: { type: "string" },
            phoneNumber: { type: "string" },
            shippingMethod: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // ─── Favourite Schema ───
        Favourite: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            productId: { $ref: "#/components/schemas/Product" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // ─── Common Responses ───
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "fail" },
            message: { type: "string", example: "Error message here" },
          },
        },
        SuccessMessage: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            message: { type: "string" },
          },
        },
      },
    },
    tags: [
      {
        name: "Auth",
        description:
          "Authentication and user profile management. Signup and login return a JWT token that must be used for all protected routes.",
      },
      {
        name: "Products",
        description:
          "Public product browsing endpoints. No authentication required. Supports filtering, pagination, and search.",
      },
      {
        name: "Orders",
        description:
          "Order management with Paystack payment integration. All endpoints require authentication.",
      },
      {
        name: "Favourites",
        description:
          "Manage favourite products. All endpoints require authentication. The user ID is automatically extracted from the JWT token.",
      },
      {
        name: "Admin - Categories",
        description:
          "Category management (Admin only). Requires both authentication AND admin role.",
      },
      {
        name: "Admin - Collections",
        description:
          "Collection management with image uploads (Admin only). Requires both authentication AND admin role.",
      },
      {
        name: "Admin - Products",
        description:
          "Product management with multi-image uploads (Admin only). Requires both authentication AND admin role.",
      },
      {
        name: "Admin - Orders",
        description:
          "Order management and status updates (Admin only). Requires both authentication AND admin role.",
      },
      {
        name: "Admin - Dashboard",
        description:
          "Dashboard statistics (Admin only). Requires both authentication AND admin role.",
      },
      {
        name: "Admin - Users",
        description:
          "User management (Admin only). Requires both authentication AND admin role.",
      },
    ],
    // ═══════════════════════════════════════════
    //  PATHS — All API Endpoints
    // ═══════════════════════════════════════════
    paths: {
      // ─── AUTH ───────────────────────────────
      "/auth/signup": {
        post: {
          tags: ["Auth"],
          summary: "Step 1: Create account (sends OTP to email)",
          description:
            "Creates a new user account and sends a **6-digit verification code** to the provided email. No JWT is returned yet.\n\n**Frontend flow:**\n1. Call this endpoint with user details\n2. Redirect the user to an OTP input screen\n3. User types the code from their email → call `POST /auth/verify-email`\n4. On success, save the returned JWT token\n\n**Rate limited:** 10 requests per 15 minutes per IP.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SignupRequest" },
                example: {
                  firstName: "Treasure",
                  lastName: "Odetokun",
                  email: "treasure@gmail.com",
                  password: "Password123!",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Account created — OTP sent to email",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SignupResponse" },
                },
              },
            },
            "400": {
              description:
                "Validation error (missing fields, invalid email, short password)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "409": {
              description: "Email already registered",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "429": { description: "Too many requests — rate limit hit" },
          },
        },
      },
      "/auth/verify-email": {
        post: {
          tags: ["Auth"],
          summary: "Step 2: Verify email with OTP (returns JWT)",
          description:
            "Validates the 6-digit code sent to the user's email during signup. On success, returns the JWT token to use for all authenticated requests.\n\n**OTP expires after 10 minutes.** If it has expired, call `POST /auth/resend-otp` to get a new one.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VerifyEmailRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Email verified — JWT token issued",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" },
                },
              },
            },
            "400": {
              description: "Invalid or expired OTP",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "404": { description: "Email not found" },
            "429": { description: "Too many requests" },
          },
        },
      },
      "/auth/resend-otp": {
        post: {
          tags: ["Auth"],
          summary: "Resend verification OTP",
          description:
            "Generates a new 6-digit OTP and sends it to the user's email. Use this when the original OTP has expired or the email was not received.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email"],
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                      example: "treasure@gmail.com",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "New OTP sent" },
            "400": { description: "Email already verified" },
            "404": { description: "Email not found" },
            "429": { description: "Too many requests" },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login to existing account (email must be verified first)",
          description:
            "Authenticates the user and returns a JWT token.\n\n**Important:** Login is blocked for accounts that have not completed email verification. If you get a `403`, the user needs to verify their email via `POST /auth/verify-email`.\n\n**Rate limited:** 10 requests per 15 minutes per IP.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" },
                },
              },
            },
            "400": { description: "Missing email or password" },
            "401": { description: "Invalid email or password" },
            "403": {
              description:
                "Email not verified — user must complete OTP verification first",
            },
            "429": { description: "Too many login attempts" },
          },
        },
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current user profile",
          description:
            "Returns the profile of the currently logged-in user. The user is identified from the JWT token — no need to pass any user ID.\n\n**When to use:** After login, call this to get the full user profile for the frontend UI (e.g. showing the user's name in the navbar).",
          security: [{ BearerAuth: [] }],
          responses: {
            "200": {
              description: "User profile",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      data: {
                        type: "object",
                        properties: {
                          user: { $ref: "#/components/schemas/User" },
                        },
                      },
                    },
                  },
                },
              },
            },
            "401": { description: "Not logged in or token expired" },
          },
        },
      },
      "/auth/profile": {
        put: {
          tags: ["Auth"],
          summary: "Update user profile",
          description:
            "Updates the logged-in user's profile. Only send the fields you want to update — all fields are optional.\n\n**Note:** You cannot change email or password through this endpoint.",
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateProfileRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Profile updated successfully" },
            "401": { description: "Not logged in" },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout",
          description:
            "Returns a success message. Since JWT is stateless, the actual logout happens on the frontend by deleting the stored token.\n\n**Frontend implementation:**\n1. Call this endpoint\n2. Remove the token from localStorage\n3. Redirect to login page",
          security: [{ BearerAuth: [] }],
          responses: {
            "200": { description: "Logged out successfully" },
          },
        },
      },
      // ─── PRODUCTS (PUBLIC) ──────────────────
      "/products": {
        get: {
          tags: ["Products"],
          summary: "Get all products (with filters & pagination)",
          description:
            "Returns a paginated list of products. Supports multiple filters that can be combined.\n\n**No authentication required** — this is a public endpoint.\n\n**Pagination:** Use `page` and `limit` query params. Response includes `totalItems`, `totalPages`, and `currentPage` for building pagination UI.\n\n**Filtering examples:**\n- By category: `?category=rings`\n- By collection: `?collection=summer-2024`\n- By price range: `?minPrice=50000&maxPrice=200000`\n- In-stock only: `?inStock=true`\n- Search by name: `?search=gold`\n- Combined: `?category=rings&material=Gold&inStock=true`",
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
              description: "Page number (starts from 1)",
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 12 },
              description: "Number of products per page",
            },
            {
              name: "category",
              in: "query",
              schema: { type: "string" },
              description:
                "Filter by category slug (e.g. 'rings', 'necklaces')",
            },
            {
              name: "collection",
              in: "query",
              schema: { type: "string" },
              description: "Filter by collection slug (e.g. 'summer-2024')",
            },
            {
              name: "type",
              in: "query",
              schema: {
                type: "string",
                enum: [
                  "Rings",
                  "Necklaces",
                  "Earrings",
                  "Bracelets",
                  "Pant Chains",
                  "Anklets",
                ],
              },
              description:
                "Filter by jewelry type. Allowed values: Rings, Necklaces, Earrings, Bracelets, Pant Chains, Anklets.",
            },
            {
              name: "material",
              in: "query",
              schema: { type: "string" },
              description: "Filter by material (e.g. 'Gold', 'Silver')",
            },
            {
              name: "karat",
              in: "query",
              schema: { type: "string" },
              description: "Filter by karat (e.g. '18k', '24k')",
            },
            {
              name: "minPrice",
              in: "query",
              schema: { type: "number" },
              description: "Minimum price filter",
            },
            {
              name: "maxPrice",
              in: "query",
              schema: { type: "number" },
              description: "Maximum price filter",
            },
            {
              name: "search",
              in: "query",
              schema: { type: "string" },
              description:
                "Search by product name (case-insensitive, partial match)",
            },
            {
              name: "inStock",
              in: "query",
              schema: { type: "boolean" },
              description:
                "If true, only return products where at least one size has quantity > 0",
            },
          ],
          responses: {
            "200": {
              description: "Paginated product list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      results: {
                        type: "integer",
                        description: "Number of products in this page",
                      },
                      totalItems: {
                        type: "integer",
                        description: "Total matching products across all pages",
                      },
                      totalPages: { type: "integer" },
                      currentPage: { type: "integer" },
                      data: {
                        type: "object",
                        properties: {
                          products: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Product" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Get a single product by ID",
          description:
            "Returns full product details including populated category and collection.\n\n**No authentication required.**",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Product MongoDB _id",
            },
          ],
          responses: {
            "200": {
              description: "Product details",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      data: {
                        type: "object",
                        properties: {
                          product: { $ref: "#/components/schemas/Product" },
                        },
                      },
                    },
                  },
                },
              },
            },
            "404": { description: "Product not found" },
          },
        },
      },
      "/new-arrivals": {
        get: {
          tags: ["Products"],
          summary: "Get latest products (new arrivals)",
          description:
            "Returns the 10 most recently added products, sorted by creation date. Great for the homepage 'New Arrivals' section.\n\n**No authentication required.**",
          responses: {
            "200": { description: "List of new arrivals" },
          },
        },
      },
      "/best-sellers": {
        get: {
          tags: ["Products"],
          summary: "Get best-selling products",
          description:
            "Returns the top 10 products sorted by sales count. Great for the homepage 'Best Sellers' section.\n\n**No authentication required.**",
          responses: {
            "200": { description: "List of best sellers" },
          },
        },
      },
      "/collections": {
        get: {
          tags: ["Products"],
          summary: "Get all collections",
          description:
            "Returns all jewelry collections. Use the `slug` field to filter products by collection.\n\n**No authentication required.**",
          responses: {
            "200": { description: "List of collections" },
          },
        },
      },
      "/categories": {
        get: {
          tags: ["Products"],
          summary: "Get all categories",
          description:
            "Returns all product categories. Use the `slug` field to filter products by category.\n\n**No authentication required.**",
          responses: {
            "200": { description: "List of categories" },
          },
        },
      },
      // ─── ORDERS ─────────────────────────────
      "/orders/initialize": {
        post: {
          tags: ["Orders"],
          summary: "Step 1: Initialize payment (get Paystack checkout URL)",
          description:
            "**This is the first step of the payment flow.**\n\nSend the cart items and shipping details. The API calculates the total, creates a Paystack transaction, and returns:\n- `authorization_url` — redirect the user here to pay\n- `reference` — unique payment reference\n- `orderDetails` — save these, you'll need them in Step 3\n\n**Frontend implementation:**\n```javascript\n// 1. Call this endpoint\nconst res = await fetch('/api/v1/orders/initialize', { method: 'POST', ... });\nconst data = await res.json();\n\n// 2. Save order details for later\nlocalStorage.setItem('pendingOrder', JSON.stringify(data.data.orderDetails));\n\n// 3. Redirect to Paystack\nwindow.location.href = data.data.authorization_url;\n```\n\n**Note:** The email is automatically taken from your JWT token — no need to send it.",
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InitializeOrderRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Payment initialized — redirect user to authorization_url",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/InitializeOrderResponse",
                  },
                },
              },
            },
            "400": { description: "Missing items or email" },
            "401": { description: "Not logged in" },
          },
        },
      },
      "/orders/verify/{reference}": {
        post: {
          tags: ["Orders"],
          summary: "Step 2: Verify payment and confirm order",
          description:
            "**This is the final step of the payment flow. No request body is needed.**\n\nAfter the customer pays on Paystack, they are redirected back to your app at:\n`{callback_url}?reference=SV-PAY-xxxx`\n\nGrab the `reference` from the URL and call this endpoint (no body required — all order data was already saved in the DB during initialize).\n\n**Frontend implementation:**\n```javascript\n// On the /verify-payment page:\nconst reference = new URLSearchParams(window.location.search).get('reference');\n\nconst res = await fetch(`/api/v1/orders/verify/${reference}`, {\n  method: 'POST',\n  headers: { 'Authorization': 'Bearer ...' }\n  // No body needed!\n});\n\nconst data = await res.json();\nif (data.status === 'success') {\n  // Show order success page!\n}\n```\n\n**What this endpoint does:**\n1. Finds the pending order in the DB by Paystack reference\n2. Checks ownership (your order only)\n3. Calls Paystack API to verify payment was successful\n4. If payment failed, restores reserved stock\n5. If paid: marks order as 'ongoing', increments salesCount, sends confirmation email",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "reference",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "The Paystack reference from the redirect URL",
              example: "SV-PAY-1771925129044-yo6ha",
            },
          ],
          responses: {
            "200": {
              description: "Payment verified, order confirmed",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      message: {
                        type: "string",
                        example: "Payment verified and order confirmed",
                      },
                      data: {
                        type: "object",
                        properties: {
                          order: { $ref: "#/components/schemas/Order" },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": { description: "Payment verification failed" },
            "401": { description: "Not logged in" },
            "403": { description: "Order does not belong to you" },
            "404": { description: "Order not found for this reference" },
          },
        },
      },
      "/orders/me": {
        get: {
          tags: ["Orders"],
          summary: "Get my orders",
          description:
            "Returns all orders for the currently logged-in user. Supports filtering by status.\n\n**Filtering:**\n- `?status=ongoing` — returns pending and ongoing orders\n- `?status=completed` — returns completed and cancelled orders\n- No filter — returns all orders",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "status",
              in: "query",
              schema: {
                type: "string",
                enum: ["ongoing", "completed"],
              },
              description:
                "'ongoing' = pending + ongoing orders, 'completed' = completed + cancelled orders",
            },
          ],
          responses: {
            "200": {
              description: "List of user's orders",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      results: { type: "integer" },
                      data: {
                        type: "object",
                        properties: {
                          orders: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Order" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "401": { description: "Not logged in" },
          },
        },
      },
      "/orders/{id}": {
        get: {
          tags: ["Orders"],
          summary: "Get a single order by ID",
          description:
            "Returns full details of a specific order, including populated user information.",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Order MongoDB _id",
            },
          ],
          responses: {
            "200": {
              description: "Order details",
            },
            "404": { description: "Order not found" },
            "401": { description: "Not logged in" },
          },
        },
      },
      // ─── FAVOURITES ─────────────────────────
      "/favourites": {
        get: {
          tags: ["Favourites"],
          summary: "Get my favourite products",
          description:
            "Returns all products the logged-in user has favourited, with full product details (name, price, image, collection). Sorted by most recently added.\n\n**Note:** User ID is automatically extracted from the JWT token.",
          security: [{ BearerAuth: [] }],
          responses: {
            "200": {
              description: "List of favourited products",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      results: { type: "integer" },
                      data: {
                        type: "object",
                        properties: {
                          favourites: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Favourite" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "401": { description: "Not logged in" },
          },
        },
        post: {
          tags: ["Favourites"],
          summary: "Add a product to favourites",
          description:
            "Adds a product to the logged-in user's favourites. A product can only be favourited once — duplicate attempts return 409.\n\n**Note:** Only send `productId`. The user ID is automatically extracted from the JWT token.",
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["productId"],
                  properties: {
                    productId: {
                      type: "string",
                      description: "The MongoDB _id of the product",
                      example: "507f1f77bcf86cd799439011",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Product added to favourites" },
            "400": { description: "Missing productId" },
            "404": { description: "Product not found" },
            "409": { description: "Product is already in favourites" },
            "401": { description: "Not logged in" },
          },
        },
      },
      "/favourites/{productId}": {
        delete: {
          tags: ["Favourites"],
          summary: "Remove a product from favourites",
          description:
            "Removes a product from the logged-in user's favourites.\n\n**Note:** User ID is automatically extracted from the JWT token.",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "productId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "The MongoDB _id of the product to remove",
            },
          ],
          responses: {
            "200": { description: "Product removed from favourites" },
            "404": { description: "Favourite not found" },
            "401": { description: "Not logged in" },
          },
        },
      },
      // ─── ADMIN: CATEGORIES ──────────────────
      "/admin/categories": {
        get: {
          tags: ["Admin - Categories"],
          summary: "List all categories",
          security: [{ BearerAuth: [] }],
          responses: { "200": { description: "All categories" } },
        },
        post: {
          tags: ["Admin - Categories"],
          summary: "Create a new category",
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string", example: "Rings" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Category created" },
            "409": { description: "Category already exists" },
          },
        },
      },
      "/admin/categories/{id}": {
        put: {
          tags: ["Admin - Categories"],
          summary: "Update a category",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Updated Name" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Category updated" },
            "404": { description: "Category not found" },
          },
        },
        delete: {
          tags: ["Admin - Categories"],
          summary: "Delete a category",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Category deleted" },
            "404": { description: "Category not found" },
          },
        },
      },
      // ─── ADMIN: COLLECTIONS ─────────────────
      "/admin/collections": {
        get: {
          tags: ["Admin - Collections"],
          summary: "List all collections",
          security: [{ BearerAuth: [] }],
          responses: { "200": { description: "All collections" } },
        },
        post: {
          tags: ["Admin - Collections"],
          summary: "Create a new collection",
          description:
            "Creates a new collection with an optional image upload. Use `multipart/form-data` to send the image file.",
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string", example: "Summer 2024" },
                    description: {
                      type: "string",
                      example: "Summer collection",
                    },
                    image: {
                      type: "string",
                      format: "binary",
                      description: "Image file (JPEG, PNG, or WebP, max 5MB)",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Collection created" },
            "409": { description: "Collection already exists" },
          },
        },
      },
      "/admin/collections/{id}": {
        put: {
          tags: ["Admin - Collections"],
          summary: "Update a collection",
          description: "Updates a collection. Can include a new image upload.",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    image: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Collection updated" },
            "404": { description: "Collection not found" },
          },
        },
        delete: {
          tags: ["Admin - Collections"],
          summary: "Delete a collection",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Collection deleted" },
            "404": { description: "Collection not found" },
          },
        },
      },
      // ─── ADMIN: PRODUCTS ────────────────────
      "/admin/products": {
        get: {
          tags: ["Admin - Products"],
          summary: "List all products (admin view with pagination)",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 20 },
            },
          ],
          responses: { "200": { description: "Paginated product list" } },
        },
        post: {
          tags: ["Admin - Products"],
          summary: "Create a new product",
          description:
            'Creates a new product with image uploads.\n\n**Content-Type:** `multipart/form-data` (not JSON).\n\n**Image upload rules:**\n- Attach files in the `images` field\n- First file → main image (required)\n- Files 2–6 → sub-images (max 5 sub-images)\n- Accepted formats: JPEG, PNG, WebP — max **5 MB** per file\n\n**`productSizes` format:** must be a JSON string:\n```\n[{"size":"Small","quantity":10},{"size":"Medium","quantity":5}]\n```\nValid sizes: `Small`, `Medium`, `Large`\n\n**Required fields:** `productName`, `productDescription`, `productPrice`, `productCategory`, `productCollection`, `productJewelryType`, `productMaterial`, `productSizes`, `images` (at least 1 file)',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: [
                    "productName",
                    "productDescription",
                    "productPrice",
                    "productCategory",
                    "productCollection",
                    "productJewelryType",
                    "productMaterial",
                    "productSizes",
                    "images",
                  ],
                  properties: {
                    productName: {
                      type: "string",
                      example: "Gold Cuban Chain Bracelet",
                      description: "Display name of the product",
                    },
                    productDescription: {
                      type: "string",
                      example:
                        "A premium 18k gold Cuban link bracelet, handcrafted for durability and timeless elegance.",
                      description:
                        "Full product description shown on the product page",
                    },
                    productPrice: {
                      type: "number",
                      example: 85000,
                      description:
                        "Price in Naira (kobo conversion handled by backend)",
                    },
                    productCategory: {
                      type: "string",
                      example: "507f1f77bcf86cd799439011",
                      description:
                        "MongoDB _id of the category. Get valid IDs from GET /categories",
                    },
                    productCollection: {
                      type: "string",
                      example: "507f1f77bcf86cd799439022",
                      description:
                        "MongoDB _id of the collection. Get valid IDs from GET /collections",
                    },
                    productJewelryType: {
                      type: "string",
                      enum: [
                        "Rings",
                        "Necklaces",
                        "Earrings",
                        "Bracelets",
                        "Pant Chains",
                        "Anklets",
                      ],
                      example: "Bracelets",
                      description: "Type of jewelry piece",
                    },
                    productMaterial: {
                      type: "string",
                      enum: [
                        "Gold",
                        "VVS Diamonds Natural",
                        "VVS Diamonds Lab",
                      ],
                      example: "Gold",
                      description: "Primary material of the product",
                    },
                    productKarat: {
                      type: "string",
                      enum: ["14k", "18k", "24k"],
                      example: "18k",
                      description:
                        "Gold karat (optional — only applicable for gold products)",
                    },
                    productCarat: {
                      type: "string",
                      example: "1.5ct",
                      description:
                        "Diamond carat weight (optional — only applicable for diamond products)",
                    },
                    productWeight: {
                      type: "string",
                      enum: ["3-6g", "7-10g", "11-15g"],
                      example: "7-10g",
                      description: "Weight range of the product (optional)",
                    },
                    productSizes: {
                      type: "string",
                      example:
                        '[{"size":"Small","quantity":10},{"size":"Medium","quantity":15},{"size":"Large","quantity":5}]',
                      description:
                        "JSON string array of size + stock objects. Each size must be Small, Medium, or Large. Quantity must be >= 0.",
                    },
                    isNewArrival: {
                      type: "boolean",
                      example: true,
                      default: false,
                      description:
                        "Mark as a new arrival. Shows up in GET /new-arrivals on the storefront.",
                    },
                    images: {
                      type: "array",
                      items: { type: "string", format: "binary" },
                      description:
                        "Product image files. First file becomes the main image; files 2–6 become sub-images. Max 5 MB per file. Accepted: JPEG, PNG, WebP.",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Product created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      message: {
                        type: "string",
                        example: "Product created successfully",
                      },
                      data: {
                        type: "object",
                        properties: {
                          product: { $ref: "#/components/schemas/Product" },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description:
                "Missing required fields or invalid productSizes JSON",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: {
                    status: "fail",
                    message:
                      "Please provide all required product fields (including at least 1 image)",
                  },
                },
              },
            },
            "401": { description: "Not logged in" },
            "403": { description: "Admin access required" },
          },
        },
      },
      "/admin/products/{id}": {
        put: {
          tags: ["Admin - Products"],
          summary: "Update a product",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    productName: { type: "string" },
                    productDescription: { type: "string" },
                    productPrice: { type: "number" },
                    productJewelryType: { type: "string" },
                    productMaterial: { type: "string" },
                    productKarat: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Product updated" },
            "404": { description: "Product not found" },
          },
        },
        delete: {
          tags: ["Admin - Products"],
          summary: "Delete a product",
          description:
            "Deletes the product and automatically removes all Favourite documents that reference it, so users won't see dead favourites.",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Product deleted and orphaned favourites cleaned up",
            },
            "404": { description: "Product not found" },
          },
        },
      },
      // ─── ADMIN: ORDERS ──────────────────────
      "/admin/orders": {
        get: {
          tags: ["Admin - Orders"],
          summary: "List all orders",
          description:
            "Returns all orders across all users. Supports pagination and status filtering.",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 20 },
            },
            {
              name: "status",
              in: "query",
              schema: {
                type: "string",
                enum: ["pending", "ongoing", "completed", "cancelled"],
              },
            },
          ],
          responses: { "200": { description: "Paginated order list" } },
        },
      },
      "/admin/orders/{id}": {
        get: {
          tags: ["Admin - Orders"],
          summary: "Get order details",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Order details" },
            "404": { description: "Order not found" },
          },
        },
      },
      "/admin/orders/{id}/status": {
        put: {
          tags: ["Admin - Orders"],
          summary: "Update order status",
          description:
            "Updates the status of an order. Available statuses: pending, ongoing, completed, cancelled.",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: {
                      type: "string",
                      enum: ["pending", "ongoing", "completed", "cancelled"],
                      example: "completed",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Status updated" },
            "404": { description: "Order not found" },
          },
        },
      },
      // ─── ADMIN: DASHBOARD ───────────────────
      "/admin/dashboard/stats": {
        get: {
          tags: ["Admin - Dashboard"],
          summary: "Get dashboard statistics",
          description:
            "Returns key metrics: total earnings, total sales count, total users, and recent orders.",
          security: [{ BearerAuth: [] }],
          responses: {
            "200": {
              description: "Dashboard stats",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      data: {
                        type: "object",
                        properties: {
                          totalEarnings: {
                            type: "number",
                            example: 2500000,
                          },
                          totalSales: { type: "integer", example: 150 },
                          totalUsers: { type: "integer", example: 45 },
                          recentOrders: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Order" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      // ─── ADMIN: USERS ───────────────────────
      "/admin/users": {
        get: {
          tags: ["Admin - Users"],
          summary: "List all users",
          description:
            "Returns a paginated list of users with optional search.",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 20 },
            },
            {
              name: "search",
              in: "query",
              schema: { type: "string" },
              description: "Search by name or email",
            },
          ],
          responses: { "200": { description: "Paginated user list" } },
        },
      },
      "/admin/users/{id}": {
        get: {
          tags: ["Admin - Users"],
          summary: "Get user details with order history",
          description:
            "Returns user profile and their order history split into ongoing and past orders.",
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "User details with orders",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      data: {
                        type: "object",
                        properties: {
                          user: { $ref: "#/components/schemas/User" },
                          ongoingOrders: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Order" },
                          },
                          pastOrders: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Order" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "404": { description: "User not found" },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
