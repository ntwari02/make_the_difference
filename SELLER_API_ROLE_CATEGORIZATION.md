# Seller APIs - Role-Based Categorization

## Base URLs
```
http://localhost:3001/api/cars          # Car marketplace
http://localhost:3001/api/spare-parts   # Spare parts marketplace
http://localhost:3001/api/payments      # Payment processing
http://localhost:3001/api/search        # Advanced search
http://localhost:3001/api/recommendations # AI recommendations
```

## Overview
This document categorizes all Seller APIs based on user roles and permissions. The roles are:
- **Seller** - Can create, manage, and sell products (cars, spare parts)
- **Buyer** - Can browse, purchase, and review products
- **Admin** - Full administrative access to marketplace
- **Dealer** - Enhanced seller with additional privileges

---

## 🚗 SELLER ROLE APIs

Sellers have comprehensive access to product management, inventory control, and sales analytics.

### ✅ **Available to Sellers**

#### 1. **Car Management**
- **POST** `/api/cars` - Create new car listing
- **PATCH** `/api/cars/:id` - Update car listing
- **DELETE** `/api/cars/:id` - Delete car listing
- **GET** `/api/cars/seller/my-cars` - View my car listings

#### 2. **Spare Parts Management**
- **POST** `/api/spare-parts` - Create spare part listing
- **GET** `/api/spare-parts/analytics/seller` - View seller analytics

#### 3. **Product Discovery & Research**
- **GET** `/api/cars` - Browse all cars (public)
- **GET** `/api/cars/search` - Search cars
- **GET** `/api/cars/:id` - View car details
- **GET** `/api/cars/:id/reviews` - View car reviews

#### 4. **Spare Parts Discovery**
- **GET** `/api/spare-parts/search` - Search spare parts
- **GET** `/api/spare-parts/categories` - Browse categories
- **GET** `/api/spare-parts/brands` - Browse brands
- **GET** `/api/spare-parts/:partId` - View spare part details
- **GET** `/api/spare-parts/:partId/price-comparison` - Price comparison
- **POST** `/api/spare-parts/:partId/compatibility` - Check vehicle compatibility

#### 5. **Advanced Search & Analytics**
- **POST** `/api/search/visual` - Visual search (image-based)
- **POST** `/api/search/voice` - Voice search
- **POST** `/api/search/semantic` - Semantic search
- **GET** `/api/search/filters` - Get search filter options
- **GET** `/api/search/analytics` - Search analytics
- **POST** `/api/search/save` - Save search criteria
- **GET** `/api/search/saved` - Get saved searches

#### 6. **AI-Powered Features**
- **GET** `/api/recommendations/personalized` - Get personalized recommendations
- **GET** `/api/recommendations/trending` - Get trending products
- **GET** `/api/recommendations/similar` - Get similar products

#### 7. **Payment Processing**
- **POST** `/api/payments/create` - Create payment
- **GET** `/api/payments/:id` - Get payment details
- **POST** `/api/enhanced-payments/process` - Process enhanced payments

### ❌ **Restricted for Sellers**

Sellers **CANNOT**:
- Access admin-only analytics
- Force update/delete other sellers' products
- Manage other sellers' accounts
- Access platform-wide administrative features
- Moderate reviews (admin only)
- Access pending approval workflows (admin only)

---

## 🛒 BUYER ROLE APIs

Buyers have access to browsing, purchasing, and reviewing products.

### ✅ **Available to Buyers**

#### 1. **Product Browsing**
- **GET** `/api/cars` - Browse all cars
- **GET** `/api/cars/search` - Search cars
- **GET** `/api/cars/:id` - View car details
- **GET** `/api/cars/:id/reviews` - View car reviews

#### 2. **Spare Parts Shopping**
- **GET** `/api/spare-parts/search` - Search spare parts
- **GET** `/api/spare-parts/categories` - Browse categories
- **GET** `/api/spare-parts/brands` - Browse brands
- **GET** `/api/spare-parts/:partId` - View spare part details
- **GET** `/api/spare-parts/:partId/price-comparison` - Price comparison
- **POST** `/api/spare-parts/:partId/compatibility` - Check vehicle compatibility

#### 3. **Favorites & Wishlist**
- **POST** `/api/cars/:id/favorite` - Add car to favorites
- **DELETE** `/api/cars/:id/favorite` - Remove car from favorites
- **GET** `/api/cars/buyer/favorites` - Get my favorites
- **POST** `/api/spare-parts/:partId/wishlist` - Add to wishlist
- **DELETE** `/api/spare-parts/:partId/wishlist` - Remove from wishlist
- **GET** `/api/spare-parts/wishlist/my` - Get my wishlist

#### 4. **Reviews & Ratings**
- **POST** `/api/cars/:id/review` - Create car review

#### 5. **Price Alerts**
- **POST** `/api/spare-parts/:partId/price-alert` - Create price alert

#### 6. **Advanced Search**
- **POST** `/api/search/visual` - Visual search
- **POST** `/api/search/voice` - Voice search
- **POST** `/api/search/semantic` - Semantic search
- **GET** `/api/search/filters` - Get search filter options
- **POST** `/api/search/save` - Save search criteria
- **GET** `/api/search/saved` - Get saved searches

#### 7. **AI Recommendations**
- **GET** `/api/recommendations/personalized` - Get personalized recommendations
- **GET** `/api/recommendations/trending` - Get trending products
- **GET** `/api/recommendations/similar` - Get similar products

#### 8. **Purchasing**
- **POST** `/api/spare-parts/purchase` - Purchase spare parts
- **POST** `/api/spare-parts/bundle/purchase` - Purchase bundles
- **POST** `/api/spare-parts/installation/purchase` - Purchase installation service
- **POST** `/api/spare-parts/maintenance-plan/subscribe` - Subscribe to maintenance plan

### ❌ **Restricted for Buyers**

Buyers **CANNOT**:
- Create or manage product listings
- Access seller analytics
- Manage other users' accounts
- Access administrative features

---

## 🏢 DEALER ROLE APIs

Dealers have enhanced seller privileges with additional business features.

### ✅ **Available to Dealers**

#### 1. **All Seller Permissions** (Inherited)
- All APIs listed under Seller role

#### 2. **Enhanced Analytics**
- **GET** `/api/cars/dealer/analytics` - Dealer-specific analytics
- **GET** `/api/spare-parts/dealer/analytics` - Dealer spare parts analytics

#### 3. **Bulk Operations**
- **POST** `/api/cars/bulk` - Bulk create car listings
- **PATCH** `/api/cars/bulk` - Bulk update car listings
- **POST** `/api/spare-parts/bulk` - Bulk create spare parts

#### 4. **Advanced Inventory Management**
- **GET** `/api/cars/dealer/inventory` - Inventory overview
- **POST** `/api/cars/dealer/inventory/sync` - Sync inventory
- **GET** `/api/spare-parts/dealer/inventory` - Spare parts inventory

### ❌ **Restricted for Dealers**

Dealers **CANNOT**:
- Access platform-wide admin features
- Manage other dealers' accounts
- Access system-wide analytics

---

## 👑 ADMIN ROLE APIs

Admins have full administrative access to the marketplace.

### ✅ **Available to Admins**

#### 1. **All Previous Role Permissions** (Inherited)
- All APIs from Seller, Buyer, and Dealer roles

#### 2. **Platform Management**
- **PATCH** `/api/cars/:id/status` - Update car status
- **GET** `/api/cars/admin/pending` - Get pending cars
- **GET** `/api/cars/admin/all-cars` - Get all cars
- **PATCH** `/api/cars/admin/:id/force-update` - Force update car
- **DELETE** `/api/cars/admin/:id/force-delete` - Force delete car

#### 3. **User Management**
- **GET** `/api/cars/admin/sellers` - Get all sellers
- **GET** `/api/cars/admin/buyers` - Get all buyers

#### 4. **Content Moderation**
- **GET** `/api/cars/admin/reviews/all` - Get all reviews
- **PATCH** `/api/cars/admin/reviews/:reviewId/status` - Update review status

#### 5. **Platform Analytics**
- **GET** `/api/cars/admin/analytics` - E-commerce analytics
- **GET** `/api/spare-parts/admin/analytics` - Spare parts analytics
- **GET** `/api/search/admin/analytics` - Search analytics

---

## 📊 API Access Matrix

| API Category | Seller | Buyer | Dealer | Admin |
|--------------|--------|-------|--------|-------|
| **Car Management** |
| `POST /api/cars` | ✅ | ❌ | ✅ | ✅ |
| `PATCH /api/cars/:id` | ✅ | ❌ | ✅ | ✅ |
| `DELETE /api/cars/:id` | ✅ | ❌ | ✅ | ✅ |
| `GET /api/cars/seller/my-cars` | ✅ | ❌ | ✅ | ✅ |
| **Spare Parts Management** |
| `POST /api/spare-parts` | ✅ | ❌ | ✅ | ✅ |
| `GET /api/spare-parts/analytics/seller` | ✅ | ❌ | ✅ | ✅ |
| **Product Browsing** |
| `GET /api/cars` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/cars/search` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/cars/:id` | ✅ | ✅ | ✅ | ✅ |
| **Favorites & Wishlist** |
| `POST /api/cars/:id/favorite` | ❌ | ✅ | ❌ | ✅ |
| `GET /api/cars/buyer/favorites` | ❌ | ✅ | ❌ | ✅ |
| `POST /api/spare-parts/:partId/wishlist` | ❌ | ✅ | ❌ | ✅ |
| **Reviews** |
| `POST /api/cars/:id/review` | ❌ | ✅ | ❌ | ✅ |
| `GET /api/cars/admin/reviews/all` | ❌ | ❌ | ❌ | ✅ |
| **Advanced Search** |
| `POST /api/search/visual` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/search/voice` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/search/analytics` | ✅ | ❌ | ✅ | ✅ |
| **AI Recommendations** |
| `GET /api/recommendations/personalized` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/recommendations/trending` | ✅ | ✅ | ✅ | ✅ |
| **Admin Functions** |
| `PATCH /api/cars/:id/status` | ❌ | ❌ | ❌ | ✅ |
| `GET /api/cars/admin/pending` | ❌ | ❌ | ❌ | ✅ |
| `GET /api/cars/admin/analytics` | ❌ | ❌ | ❌ | ✅ |

**Legend:**
- ✅ **Full Access** - Can perform the action
- ❌ **No Access** - Cannot perform the action

---

## 🎯 **Seller-Specific Features**

### **Product Management**
- Create and manage car listings
- Manage spare parts inventory
- Update product information
- Set pricing and availability

### **Analytics & Insights**
- View seller-specific analytics
- Track product performance
- Monitor sales metrics
- Access search analytics

### **AI-Powered Tools**
- Visual search for product identification
- Voice search for hands-free operation
- Semantic search for natural language queries
- Personalized recommendations

### **Inventory Control**
- Stock level management
- Price comparison tools
- Vehicle compatibility checking
- Bundle creation and management

---

## 🔐 **Permission Notes**

### **Seller Role Capabilities**
- Full product lifecycle management
- Access to seller analytics
- AI-powered search and recommendations
- Inventory management tools

### **Buyer Role Focus**
- Product discovery and browsing
- Favorites and wishlist management
- Review and rating system
- Price alerts and notifications

### **Dealer Role Enhancements**
- Bulk operations for efficiency
- Enhanced analytics and reporting
- Advanced inventory management
- Business-focused features

### **Admin Role Powers**
- Platform-wide management
- Content moderation
- User account management
- System analytics and reporting

---

## 🧪 **Postman Test Samples**

### **Authentication Setup**
First, get your JWT token by logging in:
```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "seller@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "seller@example.com",
    "role": "seller"
  }
}
```

**Add to Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### **🚗 Car Management CRUD**

#### **1. Create Car Listing**
```bash
POST http://localhost:3001/api/cars
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "brand": "Toyota",
  "model": "Camry",
  "year": 2022,
  "price": 25000,
  "mileage": 15000,
  "fuel_type": "gasoline",
  "transmission": "automatic",
  "color": "silver",
  "condition": "excellent",
  "description": "Well-maintained Toyota Camry with low mileage",
  "images": [
    "https://example.com/car1.jpg",
    "https://example.com/car2.jpg"
  ],
  "features": ["air_conditioning", "bluetooth", "backup_camera"],
  "location": {
    "city": "New York",
    "state": "NY",
    "zipcode": "10001"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "car-123",
    "brand": "Toyota",
    "model": "Camry",
    "year": 2022,
    "price": 25000,
    "status": "pending",
    "created_at": "2025-01-27T10:30:00.000Z"
  }
}
```

#### **2. Get My Cars**
```bash
GET http://localhost:3001/api/cars/seller/my-cars
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "car-123",
      "brand": "Toyota",
      "model": "Camry",
      "year": 2022,
      "price": 25000,
      "status": "active",
      "views": 45,
      "favorites": 3,
      "created_at": "2025-01-27T10:30:00.000Z"
    }
  ]
}
```

#### **3. Update Car Listing**
```bash
PATCH http://localhost:3001/api/cars/car-123
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "price": 24000,
  "description": "Updated description - Price reduced!",
  "features": ["air_conditioning", "bluetooth", "backup_camera", "sunroof"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "car-123",
    "price": 24000,
    "description": "Updated description - Price reduced!",
    "updated_at": "2025-01-27T11:15:00.000Z"
  }
}
```

#### **4. Delete Car Listing**
```bash
DELETE http://localhost:3001/api/cars/car-123
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Car listing deleted successfully"
}
```

---

### **🔧 Spare Parts Management CRUD**

#### **1. Create Spare Part**
```bash
POST http://localhost:3001/api/spare-parts
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "sku": "TOY-CAM-2022-BRK",
  "name": "Toyota Camry 2022 Brake Pads",
  "description": "High-quality brake pads for Toyota Camry 2022",
  "short_description": "Camry 2022 Brake Pads",
  "category_id": "brake-parts",
  "brand_id": "toyota",
  "part_number": "04465-0W010",
  "oem_number": "04465-0W010",
  "price": 89.99,
  "currency": "USD",
  "cost_price": 65.00,
  "msrp": 120.00,
  "weight": 2.5,
  "dimensions": {
    "length": 15,
    "width": 8,
    "height": 3
  },
  "images": [
    "https://example.com/brake-pads-1.jpg",
    "https://example.com/brake-pads-2.jpg"
  ],
  "specifications": {
    "material": "ceramic",
    "thickness": "12mm",
    "compatibility": "2022 Toyota Camry"
  },
  "features": ["low_noise", "long_lasting", "easy_installation"],
  "warranty_period": 12,
  "warranty_type": "manufacturer",
  "condition": "new",
  "stock_quantity": 50,
  "min_stock_level": 5,
  "max_stock_level": 100,
  "is_installable": true,
  "installation_difficulty": "medium",
  "estimated_installation_time": 60,
  "installation_cost": 150.00,
  "vehicle_compatibility": [
    {
      "make": "Toyota",
      "model": "Camry",
      "year": 2022,
      "engine": "2.5L"
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "part-456",
    "sku": "TOY-CAM-2022-BRK",
    "name": "Toyota Camry 2022 Brake Pads",
    "price": 89.99,
    "status": "pending",
    "created_at": "2025-01-27T10:30:00.000Z"
  }
}
```

#### **2. Get Spare Part Details**
```bash
GET http://localhost:3001/api/spare-parts/part-456
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "part-456",
    "sku": "TOY-CAM-2022-BRK",
    "name": "Toyota Camry 2022 Brake Pads",
    "price": 89.99,
    "stock_quantity": 50,
    "status": "active",
    "views": 25,
    "sales_count": 3
  }
}
```

#### **3. Get Seller Analytics**
```bash
GET http://localhost:3001/api/spare-parts/analytics/seller
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_parts": 15,
    "active_parts": 12,
    "pending_parts": 3,
    "total_sales": 45,
    "total_revenue": 2250.50,
    "top_selling_parts": [
      {
        "id": "part-456",
        "name": "Toyota Camry 2022 Brake Pads",
        "sales_count": 8,
        "revenue": 719.92
      }
    ],
    "monthly_stats": {
      "current_month": {
        "sales": 12,
        "revenue": 600.00
      }
    }
  }
}
```

---

### **🔍 Advanced Search Examples**

#### **1. Visual Search**
```bash
POST http://localhost:3001/api/search/visual
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

# Form Data:
# file: [Upload image file]
# filters: {"category": "cars", "price_range": {"min": 20000, "max": 30000}}
```

#### **2. Voice Search**
```bash
POST http://localhost:3001/api/search/voice
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

# Form Data:
# audio: [Upload audio file]
# language: "en-US"
```

#### **3. Semantic Search**
```bash
POST http://localhost:3001/api/search/semantic
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "query": "Find me a reliable family car under 30k",
  "filters": {
    "category": "cars",
    "price_range": {"max": 30000},
    "features": ["reliable", "family_friendly"]
  }
}
```

#### **4. Advanced Filter Search**
```bash
GET http://localhost:3001/api/search/filters?brand=Toyota&model=Camry&year_min=2020&year_max=2023&price_min=20000&price_max=30000&fuel_type=gasoline&transmission=automatic
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### **🤖 AI Recommendations**

#### **1. Get Personalized Recommendations**
```bash
GET http://localhost:3001/api/recommendations/personalized?user_id=user-123&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **2. Get Trending Products**
```bash
GET http://localhost:3001/api/recommendations/trending?category=cars&limit=5
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **3. Get Similar Products**
```bash
GET http://localhost:3001/api/recommendations/similar?product_id=car-123&limit=5
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### **💳 Payment Processing**

#### **1. Create Payment**
```bash
POST http://localhost:3001/api/payments/create
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "amount": 25000,
  "currency": "USD",
  "product_id": "car-123",
  "product_type": "car",
  "buyer_id": "buyer-456",
  "payment_method": "credit_card",
  "billing_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipcode": "10001"
  }
}
```

#### **2. Get Payment Details**
```bash
GET http://localhost:3001/api/payments/payment-789
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### **📊 Search Analytics**

#### **1. Get Search Analytics**
```bash
GET http://localhost:3001/api/search/analytics?date_range=30&seller_id=seller-123
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **2. Save Search Criteria**
```bash
POST http://localhost:3001/api/search/save
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "search_criteria": {
    "brand": "Toyota",
    "model": "Camry",
    "year_min": 2020,
    "price_max": 30000
  },
  "search_name": "My Toyota Camry Search"
}
```

#### **3. Get Saved Searches**
```bash
GET http://localhost:3001/api/search/saved
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### **🔧 Error Handling Examples**

#### **400 Bad Request**
```json
{
  "errors": [
    {
      "field": "price",
      "message": "Price must be a positive number"
    },
    {
      "field": "brand",
      "message": "Brand is required"
    }
  ]
}
```

#### **401 Unauthorized**
```json
{
  "error": "Authentication required",
  "message": "Please provide a valid JWT token"
}
```

#### **403 Forbidden**
```json
{
  "error": "Insufficient permissions",
  "message": "Seller role required for this action"
}
```

#### **404 Not Found**
```json
{
  "error": "Car not found",
  "message": "The requested car listing does not exist"
}
```

---

## 🚀 **Implementation Recommendations**

1. **Role-Based Middleware**: Implement middleware to check seller roles before API access
2. **Permission Matrix**: Use the above matrix for frontend UI/UX decisions
3. **Analytics Tracking**: Track seller performance and product metrics
4. **AI Integration**: Leverage AI features for enhanced seller experience
5. **Inventory Management**: Implement real-time inventory tracking
6. **Payment Processing**: Ensure secure payment handling for sellers
7. **Review System**: Implement fair review and rating mechanisms
8. **Search Optimization**: Use AI-powered search for better product discovery
