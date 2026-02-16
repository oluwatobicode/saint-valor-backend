# Jewelry E-Commerce Backend API

A comprehensive backend system for a luxury jewelry e-commerce platform built with Node.js, Express, TypeScript, and MongoDB. Features include product management, user authentication, order processing with Paystack integration, and a complete admin dashboard.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Payment Integration](#payment-integration)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Development Timeline](#development-timeline)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)

---

## 🎯 Project Overview

This backend API powers a luxury jewelry e-commerce platform with the following key capabilities:

- **Customer Features:**
  - Browse jewelry by collections, categories, and filters
  - Add items to favorites
  - Place orders with Paystack payment integration
  - View order history (ongoing and past orders)

- **Admin Features:**
  - Dashboard with sales analytics
  - User management
  - Order management and status updates
  - Product, category, and collection CRUD operations

**Project Timeline:** 4-6 weeks  
**Development Start:** [Add Date]  
**Target Completion:** [Add Date]

---

## 🛠 Tech Stack

### Core Technologies
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)

### Third-Party Services
- **Payment Gateway:** Paystack
- **Image Storage:** Cloudinary / AWS S3 (choose one)
- **Email Service:** [TBD - e.g., SendGrid, Nodemailer]

### Key Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "typescript": "^5.3.3",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "express-validator": "^7.0.1",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.5",
  "cloudinary": "^1.41.0",
  "multer": "^1.4.5-lts.1",
  "axios": "^1.6.0"
}
```

---

## ✨ Features

### Customer-Facing Features
- ✅ User registration and authentication
- ✅ Browse products with advanced filtering
  - By collection (Signature Edit, Heirloom Series, Prestige Collection, Elysian Line)
  - By jewelry type (Rings, Necklaces, Earrings, Bracelets, Pant Chains, Anklets)
  - By material (Gold, VVS Diamonds Natural, VVS Diamonds Lab)
  - By karat (14k, 18k, 24k)
  - By weight (3-6g, 7-10g, 11-15g)
  - By size (Small, Medium, Large)
  - By price range
- ✅ Product details with image gallery (1 main + 5 sub images)
- ✅ New Arrivals section
- ✅ Best Sellers section
- ✅ Favorites/Wishlist functionality
- ✅ Shopping cart and checkout with Paystack
- ✅ Order tracking (ongoing/past orders)
- ✅ User profile management

### Admin Features
- ✅ Dashboard analytics
  - Total earnings
  - Total sales count
  - Total users
  - Recent orders overview
- ✅ User management
  - View all customers
  - View customer details and order history
- ✅ Order management
  - View all orders (ongoing/completed)
  - Update order status
  - View detailed order information
- ✅ Product management
  - CRUD operations for products
  - Multi-image upload (max 6 images)
  - Inventory management (sizes and quantities)
- ✅ Category management (CRUD)
- ✅ Collection management (CRUD)

---

## 🗄 Database Models

### User Model
```typescript
{
  _id: ObjectId,
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  role: String (enum: ['customer', 'admin'], default: 'customer'),
  memberSince: Date (default: now),
  createdAt: Date,
  updatedAt: Date
}
```

### Category Model
```typescript
{
  _id: ObjectId,
  name: String (required, unique),
  slug: String (auto-generated),
  createdAt: Date,
  updatedAt: Date
}
```

### Collection Model
```typescript
{
  _id: ObjectId,
  name: String (required, unique),
  slug: String (auto-generated),
  image: String (image URL),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```typescript
{
  _id: ObjectId,
  name: String (required),
  price: Number (required),
  collectionId: ObjectId (ref: Collection),
  categoryId: ObjectId (ref: Category),
  jewelryType: String (enum: ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pant Chains', 'Anklets']),
  material: String (enum: ['Gold', 'VVS Diamonds Natural', 'VVS Diamonds Lab']),
  karat: String (enum: ['14k', '18k', '24k']),
  carat: String,
  weight: String (enum: ['3-6g', '7-10g', '11-15g']),
  sizes: [
    {
      size: String (enum: ['Small', 'Medium', 'Large']),
      quantity: Number (required)
    }
  ],
  mainImage: String (required),
  subImages: [String] (max 5),
  isNewArrival: Boolean (default: false),
  salesCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Favourite Model
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  productId: ObjectId (ref: Product, required),
  createdAt: Date
}
// Compound unique index on (userId, productId)
```

### Order Model
```typescript
{
  _id: ObjectId,
  orderNumber: String (unique, auto-generated: "ORD-YYYYMMDD-XXX"),
  userId: ObjectId (ref: User, required),
  customerName: String (denormalized),
  items: [
    {
      productId: ObjectId (ref: Product),
      productName: String,
      jewelryType: String,
      collectionName: String,
      image: String,
      price: Number,
      size: String,
      quantity: Number
    }
  ],
  totalPrice: Number (required),
  status: String (enum: ['Pending', 'Ongoing', 'Completed', 'Cancelled'], default: 'Pending'),
  paymentStatus: String (enum: ['Pending', 'Paid', 'Failed'], default: 'Pending'),
  paystackReference: String (unique, from Paystack),
  orderDate: Date (default: now),
  deliveryDate: Date,
  shippingAddress: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Endpoints

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication Endpoints
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user/admin
POST   /api/auth/logout            - Logout user
GET    /api/auth/me                - Get current user profile
PUT    /api/auth/profile           - Update user profile
```

### Product Endpoints (Public/Customer)
```
GET    /api/products               - Get all products (paginated, with filters)
GET    /api/products/:id           - Get single product details
GET    /api/new-arrivals           - Get new arrival products
GET    /api/best-sellers           - Get best selling products
GET    /api/collections            - Get all collections
GET    /api/categories             - Get all categories
```

**Product Query Parameters:**
```
?page=1&limit=20              - Pagination
?collection=signature-edit     - Filter by collection
?category=gold-jewelry         - Filter by category
?jewelryType=rings            - Filter by jewelry type
?material=gold                - Filter by material
?karat=18k                    - Filter by karat
?weight=7-10g                 - Filter by weight
?size=medium                  - Filter by size
?priceMin=100&priceMax=500    - Filter by price range
?search=aurum                 - Search by name
```

### Favourites Endpoints (Protected - Customer)
```
GET    /api/favourites             - Get user's favourites
POST   /api/favourites             - Add product to favourites
                                    Body: { productId: String }
DELETE /api/favourites/:productId  - Remove from favourites
```

### Order Endpoints (Protected - Customer)
```
GET    /api/orders                 - Get user's orders
                                    Query: ?status=ongoing | ?status=completed
POST   /api/orders/initialize      - Initialize order and get Paystack payment URL
                                    Body: {
                                      items: [{productId, size, quantity}],
                                      shippingAddress: {...}
                                    }
POST   /api/orders/verify/:reference - Verify Paystack payment and create order
GET    /api/orders/:id             - Get single order details
```

### Admin - Dashboard Endpoints (Protected - Admin)
```
GET    /api/admin/dashboard/stats  - Get dashboard statistics
                                    Response: {
                                      totalEarnings: Number,
                                      totalSales: Number,
                                      totalUsers: Number,
                                      recentOrders: [...]
                                    }
```

### Admin - User Management (Protected - Admin)
```
GET    /api/admin/users            - Get all users (paginated)
                                    Query: ?page=1&limit=20&search=john
GET    /api/admin/users/:id        - Get user details with order history
                                    Response: {
                                      user: {...},
                                      ongoingOrders: [...],
                                      pastOrders: [...]
                                    }
```

### Admin - Order Management (Protected - Admin)
```
GET    /api/admin/orders           - Get all orders (paginated)
                                    Query: ?status=ongoing&page=1&limit=20
GET    /api/admin/orders/:id       - Get order details
PUT    /api/admin/orders/:id/status - Update order status
                                    Body: { status: 'Completed' | 'Cancelled' }
```

### Admin - Category Management (Protected - Admin)
```
GET    /api/admin/categories       - Get all categories
POST   /api/admin/categories       - Create category
                                    Body: { name: String }
PUT    /api/admin/categories/:id   - Update category
                                    Body: { name: String }
DELETE /api/admin/categories/:id   - Delete category
```

### Admin - Collection Management (Protected - Admin)
```
GET    /api/admin/collections      - Get all collections
POST   /api/admin/collections      - Create collection (multipart/form-data)
                                    Body: { name: String, image: File }
PUT    /api/admin/collections/:id  - Update collection
                                    Body: { name: String, image?: File }
DELETE /api/admin/collections/:id  - Delete collection
```

### Admin - Product Management (Protected - Admin)
```
GET    /api/admin/products         - Get all products (paginated)
POST   /api/admin/products         - Create product (multipart/form-data)
                                    Body: {
                                      name, price, collectionId, categoryId,
                                      jewelryType, material, karat, carat,
                                      weight, sizes: JSON string,
                                      isNewArrival,
                                      images: File[] (max 6)
                                    }
PUT    /api/admin/products/:id     - Update product
DELETE /api/admin/products/:id     - Delete product
```

---

## 🔐 Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "customer"
}
```

### Token Storage
- **Frontend:** Store JWT in httpOnly cookies or localStorage
- **Expiry:** 7 days (configurable)

### Protected Routes
- **Customer routes:** Require valid JWT token
- **Admin routes:** Require valid JWT token + role verification (admin only)

### Middleware Flow
```
Request → Auth Middleware (verify JWT) → Role Middleware (check admin) → Controller
```

---

## 💳 Payment Integration (Paystack)

### Payment Flow

#### 1. Initialize Payment
```
Customer submits order → Backend validates → Calls Paystack API to initialize transaction
→ Returns payment URL → Frontend redirects to Paystack
```

#### 2. Customer Pays
```
Customer enters card details on Paystack → Paystack processes payment
→ Redirects to callback URL
```

#### 3. Verify Payment
```
Frontend receives reference → Calls verify endpoint → Backend verifies with Paystack
→ If successful, create order with status "Ongoing"
```

### Paystack API Endpoints Used

**Initialize Transaction:**
```javascript
POST https://api.paystack.co/transaction/initialize
Headers: {
  Authorization: Bearer YOUR_SECRET_KEY,
  Content-Type: application/json
}
Body: {
  email: "customer@email.com",
  amount: 50000, // Amount in kobo (500 NGN)
  reference: "unique-reference-string",
  callback_url: "https://yourfrontend.com/verify-payment"
}
```

**Verify Transaction:**
```javascript
GET https://api.paystack.co/transaction/verify/:reference
Headers: {
  Authorization: Bearer YOUR_SECRET_KEY
}
```

### Order Status Flow
```
1. Order Initialized → Status: "Pending", PaymentStatus: "Pending"
2. Payment Verified → Status: "Ongoing", PaymentStatus: "Paid"
3. Admin Updates → Status: "Completed" or "Cancelled"
```

### Important Notes
- ⚠️ **Orders are only valid if Paystack payment is successful**
- Always verify payment on the backend (never trust frontend)
- Store Paystack reference in order document
- Handle payment failures gracefully
- Implement webhook for payment notifications (optional but recommended)

### Paystack Webhook (Optional but Recommended)
```
POST /api/webhooks/paystack
- Verify webhook signature
- Handle events: charge.success, charge.failed
- Update order status automatically
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/jewelry-ecommerce
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/jewelry-ecommerce

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
PAYSTACK_CALLBACK_URL=http://localhost:3000/verify-payment

# Image Upload (Choose one)
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OR AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name
AWS_REGION=us-east-1

# Email Service (Optional - for order confirmations)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Admin Credentials (for first admin account)
ADMIN_EMAIL=admin@jewelry.com
ADMIN_PASSWORD=change-this-password
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+ installed
- MongoDB installed locally or MongoDB Atlas account
- Paystack account (for payment integration)
- Cloudinary/AWS account (for image storage)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd jewelry-ecommerce-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Environment Variables
```bash
cp .env.example .env
# Edit .env with your actual values
```

### Step 4: Run Development Server
```bash
npm run dev
```

### Step 5: Create Admin Account (Optional)
```bash
npm run seed:admin
```

### Step 6: Seed Sample Data (Optional)
```bash
npm run seed:products
```

---

## 📁 Project Structure

```
jewelry-ecommerce-backend/
├── src/
│   ├── config/
│   │   ├── database.ts           # MongoDB connection
│   │   ├── cloudinary.ts         # Image upload config
│   │   └── paystack.ts           # Paystack config
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Category.ts
│   │   ├── Collection.ts
│   │   ├── Order.ts
│   │   └── Favourite.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── order.controller.ts
│   │   ├── favourite.controller.ts
│   │   └── admin.controller.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   ├── order.routes.ts
│   │   ├── favourite.routes.ts
│   │   └── admin.routes.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT verification
│   │   ├── admin.middleware.ts   # Admin role check
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── upload.middleware.ts  # Multer config
│   │
│   ├── utils/
│   │   ├── generateOrderNumber.ts
│   │   ├── uploadImage.ts
│   │   ├── paystack.ts           # Paystack helper functions
│   │   └── response.ts
│   │
│   ├── types/
│   │   └── index.ts              # TypeScript types/interfaces
│   │
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── product.validator.ts
│   │   └── order.validator.ts
│   │
│   └── server.ts                 # App entry point
│
├── .env                          # Environment variables
├── .env.example                  # Example env file
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📅 Development Timeline

| Week | Tasks | Status |
|------|-------|--------|
| **Week 1** | Project setup, models, authentication | 🟡 In Progress |
| **Week 2** | Product endpoints, filtering, search | ⚪ Not Started |
| **Week 3** | Favourites, orders, Paystack integration | ⚪ Not Started |
| **Week 4** | Admin dashboard, user & order management | ⚪ Not Started |
| **Week 5** | Admin product management, categories, collections | ⚪ Not Started |
| **Week 6** | Testing, optimization, deployment | ⚪ Not Started |

### Current Progress
- [ ] Week 1: Setup & Authentication
  - [x] Project initialization
  - [x] Database models
  - [ ] Authentication endpoints
  - [ ] JWT middleware
  - [ ] Image upload setup

---

## 📖 API Documentation

### Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ] // Optional validation errors
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 200,
    "limit": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Test Coverage
```bash
npm run test:coverage
```

### Manual Testing with Postman
1. Import Postman collection: `postman/jewelry-api.json`
2. Set environment variables
3. Run test suite

---

## 🚢 Deployment

### Deploy to Production

**Option 1: Heroku**
```bash
heroku create jewelry-ecommerce-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
# Set other env variables
git push heroku main
```

**Option 2: Railway**
```bash
railway login
railway init
railway add
railway up
```

**Option 3: Render/DigitalOcean/AWS**
- Follow platform-specific deployment guides
- Ensure all environment variables are set
- Configure MongoDB Atlas for production

### Production Checklist
- [ ] Environment variables configured
- [ ] MongoDB Atlas setup (or production DB)
- [ ] Paystack production keys configured
- [ ] CORS configured for production frontend
- [ ] Rate limiting enabled
- [ ] Error logging setup (e.g., Sentry)
- [ ] SSL certificate configured
- [ ] Database indexes created
- [ ] Backup strategy implemented

---

## 🎯 AI Assistance Prompts

When using AI tools (ChatGPT, Claude, etc.) to help with development, use these prompts:

### For Model Creation
```
I'm building a jewelry e-commerce backend with Node.js, Express, TypeScript, and MongoDB.
I need help creating a [Model Name] model with the following fields:
[List fields and requirements]
Please use Mongoose and TypeScript interfaces.
```

### For Controller Logic
```
I need to create a controller for [feature description] in my jewelry e-commerce API.
The endpoint should:
- [Requirement 1]
- [Requirement 2]
Here's my model structure: [paste model]
Please write the controller with proper error handling.
```

### For Paystack Integration
```
I need to integrate Paystack payment in my Node.js/TypeScript backend.
The flow should be:
1. Initialize payment
2. Customer pays on Paystack
3. Verify payment and create order
Please provide the implementation with proper error handling.
My Order model: [paste Order model]
```

### For Authentication
```
I need JWT authentication middleware for my Express/TypeScript API.
Requirements:
- Verify JWT token from Authorization header
- Attach user to request object
- Handle expired tokens
Please provide the middleware implementation.
```

---

## 📝 Notes for Development

### Important Reminders
1. **Always verify Paystack payments** on the backend before creating orders
2. **Never trust frontend** for payment verification
3. **Use transactions** when updating order status and inventory
4. **Validate all inputs** before processing
5. **Log errors** properly for debugging
6. **Test payment flow** thoroughly in sandbox mode

### Common Issues & Solutions

**Issue: Paystack payment verification fails**
- Solution: Ensure you're using the correct secret key (not public key)
- Verify the reference matches exactly

**Issue: Image upload fails**
- Solution: Check Cloudinary/S3 credentials
- Ensure file size is within limits
- Verify file type is allowed

**Issue: MongoDB connection timeout**
- Solution: Check MongoDB URI format
- Verify network access in MongoDB Atlas
- Ensure IP whitelist is configured

### Best Practices
- Always use environment variables for secrets
- Implement proper error handling
- Write meaningful commit messages
- Keep controllers thin, move logic to services
- Document complex business logic
- Use TypeScript types consistently

---

## 👤 Contact & Support

**Developer:** [Your Name]  
**Email:** [Your Email]  
**GitHub:** [Your GitHub]  
**Project Repository:** [Repository URL]

---

## 📄 License

[Choose appropriate license - e.g., MIT, ISC]

---

## 🙏 Acknowledgments

- Express.js documentation
- Mongoose documentation
- Paystack API documentation
- TypeScript handbook
- Claude AI for development assistance

---

**Last Updated:** [Date]  
**Version:** 1.0.0
