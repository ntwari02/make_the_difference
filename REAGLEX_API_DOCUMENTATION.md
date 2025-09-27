# 🚀 Reaglex Platform - Complete Backend API Documentation

## 📋 Table of Contents
- [System Overview](#system-overview)
- [Authentication](#authentication)
- [User Roles](#user-roles)
- [API Endpoints by Role](#api-endpoints-by-role)
  - [Public APIs](#public-apis)
  - [Student/Learner APIs](#studentlearner-apis)
  - [Instructor APIs](#instructor-apis)
  - [Seller APIs](#seller-apis)
  - [Buyer APIs](#buyer-apis)
  - [University APIs](#university-apis)
  - [Admin APIs](#admin-apis)
  - [Advertiser APIs](#advertiser-apis)
- [Testing Samples](#testing-samples)
- [Error Handling](#error-handling)

---

## 🏗️ System Overview

The Reaglex Platform is a comprehensive multi-module system combining:
- **E-Learning**: Courses, modules, lessons, certificates
- **E-Commerce**: Cars, spare parts, payments
- **Scholarships**: Applications, success prediction
- **Visa Services**: Application management
- **AI Features**: Chatbot, dynamic pricing, recommendations
- **Advertising**: Campaign management, ad serving

**Base URL**: `http://localhost:3000` (or your deployed URL)

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```http
Authorization: Bearer <your-jwt-token>
```

### Login Endpoint
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "student",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

---

## 👥 User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `student` | Learners taking courses | Course access, applications |
| `instructor` | Course creators and teachers | Course management, analytics |
| `buyer` | E-commerce customers | Purchase cars, spare parts |
| `seller` | E-commerce vendors | Sell cars, spare parts |
| `dealer` | Car dealerships | Advanced car management |
| `university` | Educational institutions | Scholarship management |
| `visa_officer` | Visa processing officers | Visa application management |
| `admin` | System administrators | Full system access |
| `advertiser` | Advertising platform users | Campaign management |

---

## 🌐 Public APIs

These endpoints don't require authentication:

### Health Check
```http
GET /health
```

### E-Commerce - Cars
```http
GET /api/cars
GET /api/cars/search?query=toyota&price_min=10000&price_max=50000
GET /api/cars/:id
GET /api/cars/:id/reviews
```

### E-Commerce - Spare Parts
```http
GET /api/spare-parts/search?query=brake&category_id=cat123
GET /api/spare-parts/categories
GET /api/spare-parts/brands
GET /api/spare-parts/:partId
GET /api/spare-parts/:partId/price-comparison
POST /api/spare-parts/:partId/compatibility
```

### E-Learning
```http
GET /api/elearning/courses
GET /api/elearning/courses/:courseId
GET /api/elearning/courses/search?query=javascript
GET /api/elearning/courses/:courseId/modules
GET /api/elearning/modules/:moduleId/lessons
GET /api/elearning/lessons/:lessonId
```

### Scholarships
```http
GET /api/scholarships
GET /api/scholarships/:id
GET /api/scholarships/featured/list
GET /api/scholarships/trending/list
GET /api/scholarships/stats/overview
```

### Visa Services
```http
GET /api/visa
GET /api/visa/:id
```

### Recommendations
```http
GET /api/recommendations/similar/:id
GET /api/recommendations/trending
```

### Advanced Search
```http
GET /api/search/courses?query=programming
GET /api/search/cars?query=honda&filters={"price_range":[10000,30000]}
```

---

## 🎓 Student/Learner APIs

**Required Role**: `student`, `learner`

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile
PUT /api/auth/profile
```

### E-Learning
```http
# Course Enrollment
POST /api/elearning/courses/:courseId/enroll
GET /api/elearning/courses/:courseId/enrollment
GET /api/elearning/enrollments

# Progress Tracking
GET /api/elearning/progress
GET /api/elearning/courses/:courseId/progress
GET /api/elearning/enrollments/:enrollmentId/progress
POST /api/elearning/progress
PUT /api/elearning/lessons/:lessonId/progress
POST /api/elearning/courses/:courseId/complete

# Reviews & Favorites
POST /api/elearning/courses/:courseId/reviews
POST /api/elearning/courses/:courseId/favorite
DELETE /api/elearning/courses/:courseId/favorite
GET /api/elearning/me/favorites

# Transactions
POST /api/elearning/transactions
GET /api/elearning/transactions
GET /api/elearning/transactions/:transactionId
```

### Scholarships
```http
# Applications
POST /api/scholarships/:id/apply
GET /api/scholarships/applications/my
GET /api/scholarships/applications/:id
PUT /api/scholarships/applications/:id
DELETE /api/scholarships/applications/:id
GET /api/scholarships/applications/stats/my

# Recommendations & Predictions
GET /api/scholarships/recommendations/personalized
GET /api/scholarships/:scholarshipId/prediction
GET /api/scholarships/:scholarshipId/success-prediction
POST /api/scholarships/:scholarshipId/success-prediction/form
GET /api/scholarships/:scholarshipId/success-check
```

### E-Commerce (Buyer)
```http
# Car Favorites & Reviews
POST /api/cars/:id/favorite
DELETE /api/cars/:id/favorite
GET /api/cars/buyer/favorites
POST /api/cars/:id/review

# Spare Parts
POST /api/spare-parts/:partId/wishlist
DELETE /api/spare-parts/:partId/wishlist
GET /api/spare-parts/wishlist/my
POST /api/spare-parts/:partId/price-alert
POST /api/spare-parts/purchase
POST /api/spare-parts/bundle/purchase
```

### AI Features
```http
# Chatbot
POST /api/ai/chat/message
GET /api/ai/chat/suggestions

# Personalization
GET /api/ai/personalization/recommendations
GET /api/ai/personalization/content
GET /api/ai/personalization/profile
POST /api/ai/personalization/predict-behavior

# Analytics
GET /api/ai/analytics/insights
GET /api/ai/analytics/trends
GET /api/ai/analytics/behavior
```

---

## 👨‍🏫 Instructor APIs

**Required Role**: `instructor`

### Course Management
```http
# Course CRUD
POST /api/elearning/courses
PATCH /api/elearning/courses/:courseId
DELETE /api/elearning/courses/:courseId
POST /api/elearning/courses/:courseId/status

# Modules
POST /api/elearning/courses/:courseId/modules
PATCH /api/elearning/modules/:moduleId
DELETE /api/elearning/modules/:moduleId

# Lessons
POST /api/elearning/modules/:moduleId/lessons
PATCH /api/elearning/lessons/:lessonId
DELETE /api/elearning/lessons/:lessonId

# Students
GET /api/elearning/students
```

### Analytics
```http
GET /api/elearning/me/instructor/analytics
```

### Online Classes
```http
POST /api/online-classes
GET /api/online-classes/:id
POST /api/online-classes/:id/enroll
GET /api/online-classes/:id/attendance
```

### Certificates
```http
POST /api/certificates/enrollment/:enrollmentId
GET /api/certificates/templates/list
POST /api/certificates/templates
```

---

## 🛒 Seller APIs

**Required Role**: `seller`

### Car Management
```http
POST /api/cars
PATCH /api/cars/:id
DELETE /api/cars/:id
GET /api/cars/seller/my-cars
```

### Spare Parts Management
```http
POST /api/spare-parts
GET /api/spare-parts/analytics/seller
```

### Analytics
```http
GET /api/cars/admin/analytics
```

---

## 🚗 Buyer APIs

**Required Role**: `buyer`

### Car Operations
```http
POST /api/cars/:id/favorite
DELETE /api/cars/:id/favorite
GET /api/cars/buyer/favorites
POST /api/cars/:id/review
```

### Spare Parts Operations
```http
POST /api/spare-parts/:partId/wishlist
DELETE /api/spare-parts/:partId/wishlist
GET /api/spare-parts/wishlist/my
POST /api/spare-parts/:partId/price-alert
POST /api/spare-parts/purchase
POST /api/spare-parts/bundle/purchase
POST /api/spare-parts/installation/purchase
POST /api/spare-parts/maintenance-plan/subscribe
```

---

## 🏛️ University APIs

**Required Role**: `university`

### Scholarship Management
```http
# Scholarship CRUD
POST /api/scholarships
PUT /api/scholarships/:id
DELETE /api/scholarships/:id
GET /api/scholarships/provider/my

# Application Management
GET /api/scholarships/:scholarshipId/applications
PUT /api/scholarships/applications/:id/status
GET /api/scholarships/applications/stats/provider
```

---

## 👑 Admin APIs

**Required Role**: `admin`

### User Management
```http
POST /api/auth/users
GET /api/auth/users
PUT /api/auth/users/:userId/role
DELETE /api/auth/users/:userId
```

### System Administration
```http
# Dashboard
GET /api/admin/dashboard/overview
GET /api/admin/dashboard/alerts
GET /api/admin/dashboard/activity/recent

# User Management
GET /api/admin/users
POST /api/admin/users
PATCH /api/admin/users/:userId
PATCH /api/admin/users/:userId/status
GET /api/admin/users/:userId/activity
GET /api/admin/users/:userId/sessions
DELETE /api/admin/users/:userId/sessions

# Analytics
GET /api/admin/analytics/overview
GET /api/admin/analytics/ecommerce
GET /api/admin/analytics/elearning
GET /api/admin/analytics/online-classes
GET /api/admin/analytics/certificates

# Content Moderation
GET /api/admin/content/flagged
PATCH /api/admin/content/:contentId/moderate
DELETE /api/admin/content/:contentId

# System Configuration
GET /api/admin/settings
PATCH /api/admin/settings
GET /api/admin/feature-flags
PATCH /api/admin/feature-flags/:flagId

# Audit & Logging
GET /api/admin/audit-logs
GET /api/admin/user-activity/:userId
GET /api/admin/system-events

# Emergency Controls
POST /api/admin/emergency/suspend-user
POST /api/admin/emergency/remove-content
PATCH /api/admin/maintenance-mode

# Bulk Operations
POST /api/admin/bulk/users/update-status
POST /api/admin/bulk/content/moderate
POST /api/admin/bulk/notifications/send
```

### E-Commerce Admin
```http
# Cars
PATCH /api/cars/:id/status
GET /api/cars/admin/pending
GET /api/cars/admin/all-cars
GET /api/cars/admin/sellers
GET /api/cars/admin/buyers
GET /api/cars/admin/analytics
PATCH /api/cars/admin/:id/force-update
DELETE /api/cars/admin/:id/force-delete
GET /api/cars/admin/reviews/all
PATCH /api/cars/admin/reviews/:reviewId/status

# Scholarships
GET /api/scholarships/admin/applications/all
GET /api/scholarships/admin/scholarships/all
```

### AI Admin
```http
GET /api/ai/admin/dashboard
```

### Advertising Admin
```http
GET /api/advertising/admin/advertisers
PUT /api/advertising/admin/advertisers/:advertiserId/verify
GET /api/advertising/admin/campaigns
PUT /api/advertising/admin/campaigns/:campaignId/status
GET /api/advertising/admin/creatives/approval
PUT /api/advertising/admin/creatives/:creativeId/status
```

---

## 📢 Advertiser APIs

**Required Role**: `advertiser`

### Advertiser Management
```http
POST /api/advertising/advertisers
GET /api/advertising/advertisers/:advertiserId
PUT /api/advertising/advertisers/:advertiserId
GET /api/advertising/advertisers/:advertiserId/stats
```

### Campaign Management
```http
# Campaign CRUD
POST /api/advertising/advertisers/:advertiserId/campaigns
GET /api/advertising/campaigns/:campaignId
GET /api/advertising/advertisers/:advertiserId/campaigns
PUT /api/advertising/campaigns/:campaignId
POST /api/advertising/campaigns/:campaignId/submit
PUT /api/advertising/campaigns/:campaignId/status
GET /api/advertising/campaigns/:campaignId/performance

# Creatives
POST /api/advertising/campaigns/:campaignId/creatives
GET /api/advertising/creatives/:creativeId
GET /api/advertising/campaigns/:campaignId/creatives
PUT /api/advertising/creatives/:creativeId
GET /api/advertising/creatives/:creativeId/performance
```

### Ad Serving
```http
POST /api/advertising/placements/:placementId/serve
POST /api/advertising/impressions/:impressionId/click
POST /api/advertising/impressions/:impressionId/conversion
```

### AI Targeting
```http
GET /api/advertising/campaigns/:campaignId/audience-suggestions
GET /api/advertising/campaigns/:campaignId/optimize-targeting
POST /api/advertising/campaigns/:campaignId/predict-performance
```

### Analytics
```http
GET /api/advertising/analytics/performance
GET /api/advertising/placements/:placementId/performance
```

---

## 🧪 Complete API Testing Samples

### 🔐 Authentication APIs

#### 1. User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student",
    "phone": "+1234567890",
    "date_of_birth": "1995-01-15",
    "gender": "male",
    "nationality": "American"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user-123",
    "email": "student@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student",
    "is_verified": false
  }
}
```

#### 2. User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "student@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student"
  }
}
```

#### 3. Get User Profile
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4. Update User Profile
```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Johnny",
    "last_name": "Smith",
    "phone": "+1234567891",
    "bio": "Passionate learner"
  }'
```

#### 5. Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "your_refresh_token"
  }'
```

#### 6. Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 🎓 E-Learning APIs

#### 7. List Courses (Public)
```bash
curl -X GET "http://localhost:3000/api/elearning/courses?page=1&limit=10&category=programming&level=beginner"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "course-123",
      "title": "JavaScript Fundamentals",
      "description": "Learn JavaScript from scratch",
      "short_description": "Complete beginner course",
      "price": 99.99,
      "currency": "USD",
      "category": "Programming",
      "subcategory": "Web Development",
      "level": "beginner",
      "language": "English",
      "duration_hours": 20,
      "thumbnail": "https://example.com/thumb.jpg",
      "preview_video": "https://example.com/preview.mp4",
      "rating": 4.7,
      "review_count": 125,
      "student_count": 1250,
      "is_published": true,
      "is_featured": false,
      "status": "published",
      "completion_certificate": true,
      "has_live_classes": false,
      "instructor": {
        "name": "Jane Smith",
        "rating": 4.8
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### 8. Get Course Details
```bash
curl -X GET http://localhost:3000/api/elearning/courses/course-123
```

#### 9. Search Courses
```bash
curl -X GET "http://localhost:3000/api/elearning/courses/search?query=javascript&price_max=100&rating_min=4"
```

#### 10. Create Course (Instructor)
```bash
curl -X POST http://localhost:3000/api/elearning/courses \
  -H "Authorization: Bearer INSTRUCTOR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced React Development",
    "description": "Master React with hooks, context, and performance optimization",
    "short_description": "Complete React course for intermediate developers",
    "price": 149.99,
    "currency": "USD",
    "category": "Programming",
    "subcategory": "Frontend Development",
    "level": "intermediate",
    "language": "English",
    "duration_hours": 30,
    "thumbnail": "https://example.com/thumbnail.jpg",
    "preview_video": "https://example.com/preview.mp4",
    "syllabus": [
      "React Hooks Deep Dive",
      "State Management with Context",
      "Performance Optimization"
    ],
    "requirements": ["JavaScript Fundamentals", "HTML/CSS"],
    "learning_outcomes": [
      "Master React hooks",
      "Implement state management",
      "Optimize performance"
    ],
    "tags": ["react", "javascript", "frontend"],
    "completion_certificate": true,
    "has_live_classes": false
  }'
```

#### 11. Update Course
```bash
curl -X PATCH http://localhost:3000/api/elearning/courses/course-123 \
  -H "Authorization: Bearer INSTRUCTOR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 129.99,
    "description": "Updated course description"
  }'
```

#### 12. Enroll in Course (Student)
```bash
curl -X POST http://localhost:3000/api/elearning/courses/course-123/enroll \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully enrolled in course",
  "enrollment": {
    "id": "enrollment-456",
    "course_id": "course-123",
    "student_id": "student-789",
    "enrolled_at": "2024-01-15T10:30:00Z",
    "status": "active"
  }
}
```

#### 13. Get Course Progress
```bash
curl -X GET http://localhost:3000/api/elearning/courses/course-123/progress \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN"
```

#### 14. Update Lesson Progress
```bash
curl -X PUT http://localhost:3000/api/elearning/lessons/lesson-123/progress \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true,
    "time_spent": 1800,
    "notes": "Great lesson on React hooks"
  }'
```

#### 15. Add Course Review
```bash
curl -X POST http://localhost:3000/api/elearning/courses/course-123/reviews \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Excellent course! Very well structured and easy to follow.",
    "recommend": true
  }'
```

#### 16. Add Course to Favorites
```bash
curl -X POST http://localhost:3000/api/elearning/courses/course-123/favorite \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN"
```

#### 17. Get User Favorites
```bash
curl -X GET http://localhost:3000/api/elearning/me/favorites \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN"
```

#### 18. Create Module
```bash
curl -X POST http://localhost:3000/api/elearning/courses/course-123/modules \
  -H "Authorization: Bearer INSTRUCTOR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React Hooks Deep Dive",
    "description": "Comprehensive guide to React hooks",
    "order": 1,
    "estimated_duration": 120
  }'
```

#### 19. Create Lesson
```bash
curl -X POST http://localhost:3000/api/elearning/modules/module-123/lessons \
  -H "Authorization: Bearer INSTRUCTOR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "useState Hook",
    "description": "Learn how to use useState hook",
    "content": "Detailed lesson content...",
    "video_url": "https://example.com/video.mp4",
    "duration_minutes": 15,
    "order": 1,
    "lesson_type": "video"
  }'
```

#### 20. Complete Course
```bash
curl -X POST http://localhost:3000/api/elearning/courses/course-123/complete \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN"
```

---

### 🚗 E-Commerce - Cars APIs

#### 21. List Cars (Public)
```bash
curl -X GET "http://localhost:3000/api/cars?page=1&limit=10&brand=toyota&price_max=30000"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "car-123",
      "title": "2022 Toyota Camry - Low Mileage",
      "brand": "Toyota",
      "model": "Camry",
      "year": 2022,
      "price": 25000,
      "mileage": 15000,
      "car_condition": "used",
      "fuel_type": "petrol",
      "transmission": "automatic",
      "body_type": "sedan",
      "color": "silver",
      "engine_size": "2.5L",
      "horsepower": 203,
      "images": ["image1.jpg", "image2.jpg"],
      "seller": {
        "name": "Auto Dealer",
        "rating": 4.5
      },
      "location": "New York, NY",
      "views_count": 125,
      "is_featured": false,
      "status": "active"
    }
  ]
}
```

#### 22. Search Cars
```bash
curl -X GET "http://localhost:3000/api/cars/search?query=toyota+camry&price_min=20000&price_max=30000&year_min=2020"
```

#### 23. Get Car Details
```bash
curl -X GET http://localhost:3000/api/cars/car-123
```

#### 24. Get Car Reviews
```bash
curl -X GET http://localhost:3000/api/cars/car-123/reviews
```

#### 25. Create Car (Seller)
```bash
curl -X POST http://localhost:3000/api/cars \
  -H "Authorization: Bearer SELLER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "2023 Honda Civic - Excellent Condition",
    "brand": "Honda",
    "model": "Civic",
    "year": 2023,
    "price": 22000,
    "mileage": 5000,
    "car_condition": "used",
    "fuel_type": "petrol",
    "transmission": "manual",
    "body_type": "sedan",
    "color": "blue",
    "engine_size": "1.5L",
    "horsepower": 158,
    "vin": "1HGBH41JXMN109186",
    "description": "Excellent condition, one owner",
    "features": ["Bluetooth", "Backup Camera", "Cruise Control"],
    "images": ["honda1.jpg", "honda2.jpg"],
    "location": "Los Angeles, CA",
    "latitude": 34.0522,
    "longitude": -118.2437
  }'
```

#### 26. Update Car
```bash
curl -X PATCH http://localhost:3000/api/cars/car-123 \
  -H "Authorization: Bearer SELLER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 24000,
    "description": "Updated description"
  }'
```

#### 27. Add Car to Favorites (Buyer)
```bash
curl -X POST http://localhost:3000/api/cars/car-123/favorite \
  -H "Authorization: Bearer BUYER_JWT_TOKEN"
```

#### 28. Create Car Review (Buyer)
```bash
curl -X POST http://localhost:3000/api/cars/car-123/review \
  -H "Authorization: Bearer BUYER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Great car, smooth ride",
    "pros": ["Fuel efficient", "Reliable"],
    "cons": ["Small trunk"]
  }'
```

#### 29. Get Seller's Cars
```bash
curl -X GET http://localhost:3000/api/cars/seller/my-cars \
  -H "Authorization: Bearer SELLER_JWT_TOKEN"
```

#### 30. Get Buyer's Favorites
```bash
curl -X GET http://localhost:3000/api/cars/buyer/favorites \
  -H "Authorization: Bearer BUYER_JWT_TOKEN"
```

---

### 🔧 E-Commerce - Spare Parts APIs

#### 31. Search Spare Parts (Public)
```bash
curl -X GET "http://localhost:3000/api/spare-parts/search?query=brake+pad&category_id=cat123&brand=toyota&price_min=50&price_max=200"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "part-123",
      "sku": "BP-001-FRONT",
      "name": "Front Brake Pads",
      "description": "High-quality ceramic brake pads for front wheels",
      "short_description": "Ceramic brake pads",
      "category_id": "cat123",
      "brand_id": "brand456",
      "part_number": "BP-001",
      "oem_number": "04465-33020",
      "price": 89.99,
      "currency": "USD",
      "cost_price": 65.00,
      "msrp": 120.00,
      "discount_percentage": 25.01,
      "weight": 2.5,
      "dimensions": {
        "length": 15,
        "width": 12,
        "height": 3,
        "unit": "cm"
      },
      "images": ["brake1.jpg", "brake2.jpg"],
      "specifications": {
        "material": "Ceramic",
        "thickness": "12mm",
        "temperature_range": "-40°C to 600°C"
      },
      "features": ["Low noise", "Low dust", "Long life"],
      "warranty_period": 24,
      "warranty_type": "manufacturer",
      "condition": "new",
      "stock_quantity": 25,
      "min_stock_level": 5,
      "max_stock_level": 100,
      "is_featured": false,
      "is_bestseller": true,
      "rating": 4.5,
      "review_count": 45,
      "view_count": 1250,
      "sales_count": 89,
      "status": "active",
      "seller_id": "seller123"
    }
  ]
}
```

#### 32. Get Spare Part Categories
```bash
curl -X GET http://localhost:3000/api/spare-parts/categories
```

#### 33. Get Spare Part Brands
```bash
curl -X GET http://localhost:3000/api/spare-parts/brands
```

#### 34. Get Spare Part Details
```bash
curl -X GET http://localhost:3000/api/spare-parts/part-123
```

#### 35. Check Vehicle Compatibility
```bash
curl -X POST http://localhost:3000/api/spare-parts/part-123/compatibility \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "engine": "2.5L"
  }'
```

#### 36. Get Price Comparison
```bash
curl -X GET http://localhost:3000/api/spare-parts/part-123/price-comparison
```

#### 37. Add to Wishlist
```bash
curl -X POST http://localhost:3000/api/spare-parts/part-123/wishlist \
  -H "Authorization: Bearer BUYER_JWT_TOKEN"
```

#### 38. Create Price Alert
```bash
curl -X POST http://localhost:3000/api/spare-parts/part-123/price-alert \
  -H "Authorization: Bearer BUYER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_price": 75.00,
    "notification_method": "email"
  }'
```

#### 39. Purchase Spare Part
```bash
curl -X POST http://localhost:3000/api/spare-parts/purchase \
  -H "Authorization: Bearer BUYER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "part_id": "part-123",
        "quantity": 2
      }
    ],
    "shipping_address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001"
    },
    "payment_method": "credit_card"
  }'
```

#### 40. Create Spare Part (Seller)
```bash
curl -X POST http://localhost:3000/api/spare-parts \
  -H "Authorization: Bearer SELLER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "OF-001-TOYOTA",
    "name": "Oil Filter for Toyota Camry",
    "description": "Genuine Toyota oil filter for 2015-2023 Camry models",
    "short_description": "High-quality oil filter",
    "category_id": "cat456",
    "brand_id": "brand123",
    "part_number": "OF-001",
    "oem_number": "04152-37040",
    "price": 15.99,
    "currency": "USD",
    "cost_price": 10.50,
    "msrp": 19.99,
    "weight": 0.5,
    "dimensions": {
      "length": 10,
      "width": 8,
      "height": 6,
      "unit": "cm"
    },
    "images": ["filter1.jpg", "filter2.jpg"],
    "specifications": {
      "thread_size": "M20x1.5",
      "bypass_pressure": "8-12 PSI",
      "filter_media": "Cellulose"
    },
    "features": ["High efficiency", "Long service life", "Easy installation"],
    "warranty_period": 12,
    "warranty_type": "manufacturer",
    "condition": "new",
    "stock_quantity": 100,
    "min_stock_level": 10,
    "max_stock_level": 500,
    "is_digital": false,
    "is_installable": true,
    "installation_difficulty": "easy",
    "estimated_installation_time": 15,
    "installation_cost": 25.00,
    "is_featured": false,
    "is_bestseller": false,
    "status": "active"
  }'
```

---

### 🎓 Scholarship APIs

#### 41. Get All Scholarships (Public)
```bash
curl -X GET "http://localhost:3000/api/scholarships?country=USA&degree_level=undergraduate&amount_min=1000"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "scholarship-123",
      "title": "Computer Science Excellence Scholarship",
      "description": "For outstanding CS students",
      "provider_name": "Tech University",
      "provider_type": "university",
      "amount": 5000,
      "currency": "USD",
      "amount_type": "fixed",
      "country": "USA",
      "university": "Tech University",
      "degree_level": "undergraduate",
      "field_of_study": ["Computer Science", "Software Engineering"],
      "application_deadline": "2024-12-31",
      "start_date": "2025-09-01",
      "duration_months": 36,
      "eligibility_criteria": {
        "gpa_min": 3.5,
        "field_of_study": ["Computer Science", "Software Engineering"],
        "financial_need": true
      },
      "required_documents": ["Transcript", "Essay", "Letters of Recommendation"],
      "is_merit_based": true,
      "is_need_based": true,
      "gpa_requirement": 3.5,
      "tags": ["computer-science", "merit-based"]
    }
  ]
}
```

#### 42. Get Scholarship Details
```bash
curl -X GET http://localhost:3000/api/scholarships/scholarship-123
```

#### 43. Get Featured Scholarships
```bash
curl -X GET http://localhost:3000/api/scholarships/featured/list
```

#### 44. Get Trending Scholarships
```bash
curl -X GET http://localhost:3000/api/scholarships/trending/list
```

#### 45. Apply for Scholarship (Student)
```bash
curl -X POST http://localhost:3000/api/scholarships/scholarship-123/apply \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "application_data": {
      "academic_background": "Computer Science",
      "gpa": 3.8,
      "financial_need": true,
      "essay": "I am passionate about technology and want to make a difference in the field of computer science...",
      "extracurricular_activities": ["Programming Club", "Volunteer Work"],
      "references": [
        {
          "name": "Dr. Smith",
          "email": "dr.smith@university.edu",
          "relationship": "Professor"
        }
      ]
    }
  }'
```

#### 46. Get User Applications
```bash
curl -X GET http://localhost:3000/api/scholarships/applications/my \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN"
```

#### 47. Get Success Prediction
```bash
curl -X GET http://localhost:3000/api/scholarships/scholarship-123/success-prediction \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN"
```

#### 48. Create Scholarship (University)
```bash
curl -X POST http://localhost:3000/api/scholarships \
  -H "Authorization: Bearer UNIVERSITY_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Engineering Excellence Scholarship",
    "description": "For outstanding engineering students",
    "provider_name": "Tech University",
    "provider_type": "university",
    "amount": 7500,
    "currency": "USD",
    "amount_type": "fixed",
    "country": "USA",
    "university": "Tech University",
    "degree_level": "undergraduate",
    "field_of_study": ["Engineering", "Computer Science"],
    "application_deadline": "2024-12-31",
    "start_date": "2025-09-01",
    "duration_months": 36,
    "eligibility_criteria": {
      "gpa_min": 3.7,
      "financial_need": true,
      "citizenship": ["USA", "Canada"]
    },
    "required_documents": ["Transcript", "Essay", "Letters of Recommendation"],
    "application_process": "Submit online application with required documents",
    "website_url": "https://techuniversity.edu/scholarships",
    "contact_email": "scholarships@techuniversity.edu",
    "tags": ["engineering", "merit-based", "need-based"],
    "is_merit_based": true,
    "is_need_based": true,
    "gpa_requirement": 3.7,
    "age_limit_min": 18,
    "age_limit_max": 25
  }'
```

#### 49. Get Scholarship Applications (University)
```bash
curl -X GET http://localhost:3000/api/scholarships/scholarship-123/applications \
  -H "Authorization: Bearer UNIVERSITY_JWT_TOKEN"
```

#### 50. Update Application Status
```bash
curl -X PUT http://localhost:3000/api/scholarships/applications/app-123/status \
  -H "Authorization: Bearer UNIVERSITY_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "notes": "Excellent application, meets all criteria"
  }'
```

---

### 🤖 AI APIs

#### 51. AI System Status
```bash
curl -X GET http://localhost:3000/api/ai/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 52. AI Chat Message
```bash
curl -X POST http://localhost:3000/api/ai/chat/message \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What courses do you recommend for someone learning web development?",
    "context": "learning",
    "session_id": "session-123"
  }'
```

**Response:**
```json
{
  "success": true,
  "response": "I recommend starting with HTML/CSS fundamentals, then JavaScript, followed by a framework like React or Vue. Here are some specific courses that might interest you...",
  "suggestions": [
    "Show me beginner courses",
    "What about backend development?",
    "Tell me about pricing"
  ],
  "session_id": "session-123"
}
```

#### 53. Get Dynamic Pricing
```bash
curl -X GET http://localhost:3000/api/ai/pricing/car-123/dynamic \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 54. Get Personalized Recommendations
```bash
curl -X GET "http://localhost:3000/api/ai/personalization/recommendations?type=courses&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 55. Predict User Behavior
```bash
curl -X POST http://localhost:3000/api/ai/personalization/predict-behavior \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "course_purchase",
    "context": {
      "course_category": "programming",
      "price_range": "100-200",
      "user_level": "intermediate"
    }
  }'
```

#### 56. Get Business Insights
```bash
curl -X GET "http://localhost:3000/api/ai/analytics/insights?period=30d&metrics=revenue,enrollments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 📢 Advertising APIs

#### 57. Create Advertiser
```bash
curl -X POST http://localhost:3000/api/advertising/advertisers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Tech Solutions Inc",
    "contact_email": "contact@techsolutions.com",
    "contact_phone": "+1234567890",
    "website": "https://techsolutions.com",
    "industry": "Technology",
    "budget": 10000,
    "currency": "USD"
  }'
```

#### 58. Create Campaign
```bash
curl -X POST http://localhost:3000/api/advertising/advertisers/advertiser-123/campaigns \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Course Promotion",
    "description": "Promote our summer programming courses",
    "budget": 5000,
    "currency": "USD",
    "start_date": "2024-06-01T00:00:00Z",
    "end_date": "2024-08-31T23:59:59Z",
    "target_audience": {
      "age_range": [18, 35],
      "interests": ["programming", "technology"],
      "location": ["USA", "Canada"]
    },
    "bidding_strategy": "cpm",
    "bid_amount": 2.50
  }'
```

#### 59. Create Creative
```bash
curl -X POST http://localhost:3000/api/advertising/campaigns/campaign-123/creatives \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Programming Today!",
    "description": "Start your coding journey with our expert-led courses",
    "image_url": "https://example.com/ad-image.jpg",
    "landing_page_url": "https://techsolutions.com/courses",
    "call_to_action": "Enroll Now",
    "creative_type": "banner"
  }'
```

#### 60. Get Campaign Performance
```bash
curl -X GET http://localhost:3000/api/advertising/campaigns/campaign-123/performance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 👑 Admin APIs

#### 61. Get Dashboard Overview
```bash
curl -X GET http://localhost:3000/api/admin/dashboard/overview \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_users": 1250,
    "active_users": 980,
    "total_courses": 150,
    "total_scholarships": 45,
    "total_cars": 320,
    "revenue": {
      "total": 125000,
      "monthly": 15000,
      "growth": 12.5
    },
    "recent_activity": [
      {
        "type": "user_registration",
        "user": "John Doe",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### 62. Get All Users
```bash
curl -X GET "http://localhost:3000/api/admin/users?page=1&limit=20&role=student&status=active" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### 63. Create User (Admin)
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@example.com",
    "password": "password123",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "instructor",
    "phone": "+1234567890"
  }'
```

#### 64. Update User Status
```bash
curl -X PATCH http://localhost:3000/api/admin/users/user-123/status \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "suspended",
    "reason": "Violation of terms of service"
  }'
```

#### 65. Get System Analytics
```bash
curl -X GET "http://localhost:3000/api/admin/analytics/overview?period=30d" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### 66. Get Flagged Content
```bash
curl -X GET http://localhost:3000/api/admin/content/flagged \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### 67. Moderate Content
```bash
curl -X PATCH http://localhost:3000/api/admin/content/content-123/moderate \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve",
    "notes": "Content meets guidelines"
  }'
```

#### 68. Emergency Suspend User
```bash
curl -X POST http://localhost:3000/api/admin/emergency/suspend-user \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-123",
    "reason": "Suspicious activity detected",
    "duration_hours": 24
  }'
```

---

### 🎓 Online Classes APIs

#### 69. List Online Classes
```bash
curl -X GET "http://localhost:3000/api/online-classes?page=1&limit=10&status=upcoming"
```

#### 70. Create Online Class (Instructor)
```bash
curl -X POST http://localhost:3000/api/online-classes \
  -H "Authorization: Bearer INSTRUCTOR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Live JavaScript Workshop",
    "description": "Interactive JavaScript coding session",
    "instructor_id": "instructor-123",
    "scheduled_date": "2024-02-15T14:00:00Z",
    "duration_minutes": 90,
    "max_students": 50,
    "price": 29.99,
    "meeting_url": "https://zoom.us/j/123456789",
    "materials": ["worksheet.pdf", "code-examples.zip"]
  }'
```

#### 71. Enroll in Online Class
```bash
curl -X POST http://localhost:3000/api/online-classes/class-123/enroll \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN"
```

#### 72. Get Class Attendance
```bash
curl -X GET http://localhost:3000/api/online-classes/class-123/attendance \
  -H "Authorization: Bearer INSTRUCTOR_JWT_TOKEN"
```

---

### 🏆 Certificate APIs

#### 73. Verify Certificate (Public)
```bash
curl -X GET http://localhost:3000/api/certificates/verify/VER123456
```

#### 74. Get User Certificates
```bash
curl -X GET http://localhost:3000/api/certificates/my-certificates \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN"
```

#### 75. Create Certificate
```bash
curl -X POST http://localhost:3000/api/certificates/enrollment/enrollment-123 \
  -H "Authorization: Bearer INSTRUCTOR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "template-123",
    "issued_date": "2024-01-15T00:00:00Z",
    "grade": "A+",
    "completion_percentage": 95
  }'
```

---

### 💳 Payment APIs

#### 76. Process Course Payment
```bash
curl -X POST http://localhost:3000/api/elearning-payments/process \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "course-123",
    "amount": 99.99,
    "currency": "USD",
    "payment_method": "credit_card",
    "card_details": {
      "number": "4111111111111111",
      "expiry": "12/25",
      "cvv": "123"
    }
  }'
```

#### 77. Process Car Payment
```bash
curl -X POST http://localhost:3000/api/payments/car-purchase \
  -H "Authorization: Bearer BUYER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "car_id": "car-123",
    "amount": 25000,
    "currency": "USD",
    "payment_method": "bank_transfer",
    "financing": {
      "down_payment": 5000,
      "loan_term_months": 60,
      "interest_rate": 3.5
    }
  }'
```

---

### 🔍 Search & Recommendations APIs

#### 78. Advanced Course Search
```bash
curl -X GET "http://localhost:3000/api/search/courses?query=javascript&filters=%7B%22price_range%22:%5B50,200%5D,%22level%22:%5B%22beginner%22%5D%7D"
```

#### 79. Get Similar Courses
```bash
curl -X GET http://localhost:3000/api/recommendations/similar/course-123
```

#### 80. Get Trending Courses
```bash
curl -X GET http://localhost:3000/api/recommendations/trending
```

---

## 🔧 Testing Workflow

### Step 1: Environment Setup
```bash
# Set your base URL
export BASE_URL="http://localhost:3001"

# Register and get tokens for different roles
# Student token
STUDENT_TOKEN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}' | jq -r '.token')

# Instructor token  
INSTRUCTOR_TOKEN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"instructor@example.com","password":"password123"}' | jq -r '.token')

# Admin token
ADMIN_TOKEN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' | jq -r '.token')
```

### Step 2: Test Public APIs
```bash
# Test health check
curl -X GET $BASE_URL/health

# Test public course listing
curl -X GET "$BASE_URL/api/elearning/courses?page=1&limit=5"

# Test public car search
curl -X GET "$BASE_URL/api/cars/search?query=toyota"
```

### Step 3: Test Role-Specific APIs
```bash
# Test student enrollment
curl -X POST $BASE_URL/api/elearning/courses/course-123/enroll \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Test instructor course creation
curl -X POST $BASE_URL/api/elearning/courses \
  -H "Authorization: Bearer $INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Course","description":"Test Description","price":99.99}'

# Test admin user management
curl -X GET $BASE_URL/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## ⚠️ Error Handling

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient role)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Authentication Errors
```json
{
  "message": "Authentication required"
}
```

### Authorization Errors
```json
{
  "message": "Forbidden: insufficient role"
}
```

---

## 🔧 Testing Tips

1. **Start with Public APIs**: Test public endpoints first to verify basic functionality
2. **Authentication Flow**: Register → Login → Use token for protected endpoints
3. **Role Testing**: Test each role's specific endpoints with appropriate tokens
4. **Error Scenarios**: Test with invalid data, missing tokens, wrong roles
5. **Pagination**: Use `page` and `limit` parameters for list endpoints
6. **Filtering**: Use query parameters for search and filter functionality

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- File uploads use `multipart/form-data`
- Pagination defaults: `page=1`, `limit=20`
- JWT tokens expire (check your configuration)
- Admin users can access all endpoints regardless of role requirements
- Some endpoints require organization context headers

---

## 📊 Database Compatibility Notes

### ✅ **Verified Database Schema Compatibility**

This API documentation has been verified against the actual database schema and includes the following accurate field mappings:

#### **Cars Table Fields**
- `title` (VARCHAR) - Car listing title
- `brand` (VARCHAR) - Car manufacturer
- `model` (VARCHAR) - Car model
- `car_condition` (ENUM: 'new', 'used', 'certified')
- `fuel_type` (ENUM: 'petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'cng')
- `transmission` (ENUM: 'manual', 'automatic', 'semi-automatic')
- `body_type` (ENUM: 'sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'pickup', 'van')
- `engine_size` (VARCHAR) - Engine displacement
- `horsepower` (INT) - Engine power
- `vin` (VARCHAR(17)) - Vehicle identification number
- `latitude`/`longitude` (DECIMAL) - GPS coordinates
- `views_count` (INT) - View counter
- `is_featured` (BOOLEAN) - Featured listing flag
- `status` (ENUM: 'active', 'sold', 'pending', 'draft')

#### **Courses Table Fields**
- `short_description` (VARCHAR(500)) - Brief course summary
- `subcategory` (VARCHAR) - Course subcategory
- `language` (VARCHAR) - Course language
- `thumbnail` (VARCHAR) - Course thumbnail URL
- `preview_video` (VARCHAR) - Preview video URL
- `syllabus` (JSON) - Course syllabus structure
- `requirements` (JSON) - Prerequisites array
- `learning_outcomes` (JSON) - Learning objectives
- `tags` (JSON) - Course tags array
- `rating` (DECIMAL(3,2)) - Average rating
- `review_count` (INT) - Number of reviews
- `student_count` (INT) - Enrolled students
- `is_published` (BOOLEAN) - Publication status
- `is_featured` (BOOLEAN) - Featured course flag
- `status` (ENUM: 'draft', 'pending_review', 'approved', 'rejected', 'published')
- `completion_certificate` (BOOLEAN) - Certificate availability
- `has_live_classes` (BOOLEAN) - Live class availability

#### **Scholarships Table Fields**
- `provider_name` (VARCHAR) - Scholarship provider
- `provider_type` (ENUM: 'university', 'government', 'private_organization', 'foundation', 'corporation')
- `amount_type` (ENUM: 'fixed', 'partial', 'full', 'variable')
- `university` (VARCHAR) - Associated university
- `field_of_study` (JSON) - Eligible fields
- `application_deadline` (DATE) - Application deadline
- `start_date` (DATE) - Scholarship start date
- `duration_months` (INT) - Scholarship duration
- `eligibility_criteria` (JSON) - Eligibility requirements
- `required_documents` (JSON) - Required documents
- `application_process` (TEXT) - Application instructions
- `website_url` (VARCHAR) - Provider website
- `contact_email` (VARCHAR) - Contact information
- `is_merit_based` (BOOLEAN) - Merit-based flag
- `is_need_based` (BOOLEAN) - Need-based flag
- `is_athletic` (BOOLEAN) - Athletic scholarship flag
- `is_artistic` (BOOLEAN) - Artistic scholarship flag
- `gpa_requirement` (DECIMAL(3,2)) - Minimum GPA
- `language_requirements` (JSON) - Language requirements
- `nationality_restrictions` (JSON) - Citizenship restrictions
- `age_limit_min`/`age_limit_max` (INT) - Age restrictions

#### **Spare Parts Table Fields**
- `sku` (VARCHAR(100)) - Stock keeping unit
- `short_description` (VARCHAR(500)) - Brief description
- `category_id` (VARCHAR(36)) - Category reference
- `brand_id` (VARCHAR(36)) - Brand reference
- `cost_price` (DECIMAL(10,2)) - Cost price
- `msrp` (DECIMAL(10,2)) - Manufacturer suggested retail price
- `discount_percentage` (DECIMAL(5,2)) - Discount percentage
- `weight` (DECIMAL(8,2)) - Product weight in kg
- `dimensions` (JSON) - Product dimensions
- `specifications` (JSON) - Technical specifications
- `features` (JSON) - Key features array
- `warranty_period` (INT) - Warranty in months
- `warranty_type` (ENUM: 'manufacturer', 'seller', 'extended')
- `condition` (ENUM: 'new', 'refurbished', 'used', 'remanufactured')
- `stock_quantity` (INT) - Available stock
- `min_stock_level`/`max_stock_level` (INT) - Stock limits
- `is_digital` (BOOLEAN) - Digital product flag
- `is_installable` (BOOLEAN) - Installation availability
- `installation_difficulty` (ENUM: 'easy', 'medium', 'hard', 'professional')
- `estimated_installation_time` (INT) - Installation time in minutes
- `installation_cost` (DECIMAL(8,2)) - Installation cost
- `is_featured`/`is_bestseller` (BOOLEAN) - Product flags
- `rating` (DECIMAL(3,2)) - Average rating
- `review_count`/`view_count`/`sales_count` (INT) - Counters
- `status` (ENUM: 'active', 'inactive', 'discontinued', 'pending')

### 🔍 **Database Schema Verification**

The API examples in this documentation have been cross-referenced with the actual database schema files:
- `server/db/schema/reaglex_database_schema.sql`
- `server/db/schema/spare_parts_schema.sql`

All field names, data types, and constraints match the actual database structure, ensuring accurate API testing and development.

---

*This documentation covers all major API endpoints in the Reaglex Platform with verified database compatibility. For specific implementation details, refer to the individual route files and controllers.*
