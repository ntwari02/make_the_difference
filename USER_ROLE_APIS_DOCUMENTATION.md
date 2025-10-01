# User Role APIs Documentation

## Overview
This document provides comprehensive documentation for the APIs created for different user roles: **Dealer**, **Visa Officer**, **Advertiser**, and **Moderator**.

## Base URLs
```
http://localhost:3001/api/dealers          # Dealer APIs
http://localhost:3001/api/visa-officer     # Visa Officer APIs
http://localhost:3001/api/advertising      # Advertiser APIs (existing)
http://localhost:3001/api/moderators        # Moderator APIs
```

---

## 🚗 DEALER APIs

### Authentication
All dealer endpoints require authentication with `dealer` role unless specified otherwise.

### Profile Management

#### Create Dealer Profile
- **POST** `/api/dealers/profile`
- **Auth:** Dealer role required
- **Body:**
```json
{
  "business_name": "ABC Auto Dealership",
  "business_type": "dealership",
  "license_number": "DL123456",
  "description": "Premium car dealership",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "postal_code": "10001",
  "phone": "+1234567890",
  "email": "contact@abcauto.com",
  "website": "https://abcauto.com",
  "logo": "https://example.com/logo.png",
  "images": ["url1", "url2"],
  "business_hours": {
    "monday": "9:00-18:00",
    "tuesday": "9:00-18:00"
  },
  "services": ["sales", "service", "financing"]
}
```

#### Get My Dealer Profile
- **GET** `/api/dealers/profile/my`
- **Auth:** Dealer role required

#### Get Dealer Profile
- **GET** `/api/dealers/profile/:dealerId`
- **Auth:** Public access

#### Update Dealer Profile
- **PUT** `/api/dealers/profile/:dealerId`
- **Auth:** Dealer or Admin role required

#### Get Dealer Statistics
- **GET** `/api/dealers/profile/:dealerId/stats`
- **Auth:** Required

### Inventory Management

#### Get Dealer Inventory
- **GET** `/api/dealers/profile/:dealerId/inventory`
- **Query Parameters:** `page`, `limit`, `status`, `make`, `model`, `min_price`, `max_price`, `year_from`, `year_to`

#### Add Vehicle to Inventory
- **POST** `/api/dealers/profile/:dealerId/inventory`
- **Auth:** Dealer role required
- **Body:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2023,
  "price": 25000,
  "mileage": 15000,
  "fuel_type": "gasoline",
  "transmission": "automatic",
  "body_type": "sedan",
  "color": "Silver",
  "condition": "excellent",
  "description": "Well maintained vehicle",
  "images": ["url1", "url2"],
  "features": ["GPS", "Bluetooth"],
  "specifications": {"engine": "2.5L"},
  "vin": "1HGBH41JXMN109186",
  "engine_size": 2.5,
  "horsepower": 203,
  "torque": 184
}
```

#### Update Vehicle in Inventory
- **PUT** `/api/dealers/profile/:dealerId/inventory/:vehicleId`
- **Auth:** Dealer role required

#### Remove Vehicle from Inventory
- **DELETE** `/api/dealers/profile/:dealerId/inventory/:vehicleId`
- **Auth:** Dealer role required

### Reviews and Analytics

#### Get Dealer Reviews
- **GET** `/api/dealers/profile/:dealerId/reviews`
- **Query Parameters:** `page`, `limit`

#### Get Dealer Sales Analytics
- **GET** `/api/dealers/profile/:dealerId/analytics`
- **Auth:** Dealer or Admin role required
- **Query Parameters:** `start_date`, `end_date`, `period`

### Search and Discovery

#### Search Dealers
- **GET** `/api/dealers/search`
- **Query Parameters:** `page`, `limit`, `business_type`, `status`, `city`, `state`, `search`

### Admin Functions

#### Get All Dealers
- **GET** `/api/dealers/admin/all`
- **Auth:** Admin role required

#### Verify Dealer
- **PUT** `/api/dealers/admin/:dealerId/verify`
- **Auth:** Admin role required

#### Update Dealer Status
- **PUT** `/api/dealers/admin/:dealerId/status`
- **Auth:** Admin role required

---

## 🛂 VISA OFFICER APIs

### Authentication
All visa officer endpoints require authentication with `visa_officer` or `admin` role.

### Dashboard

#### Get Dashboard
- **GET** `/api/visa-officer/dashboard`
- **Auth:** Visa Officer or Admin role required
- **Response:** Pending applications count, today's reviewed count, weekly stats, recent applications

### Application Management

#### Get All Visa Applications
- **GET** `/api/visa-officer/applications`
- **Query Parameters:** `page`, `limit`, `status`, `country`, `visa_type`, `submitted_from`, `submitted_to`, `reviewed_by`

#### Get Visa Application by ID
- **GET** `/api/visa-officer/applications/:applicationId`
- **Auth:** Visa Officer or Admin role required

#### Review Visa Application
- **PUT** `/api/visa-officer/applications/:applicationId/review`
- **Auth:** Visa Officer or Admin role required
- **Body:**
```json
{
  "status": "approved",
  "comments": "All documents verified",
  "required_actions": []
}
```

#### Request Additional Documents
- **POST** `/api/visa-officer/applications/:applicationId/request-documents`
- **Auth:** Visa Officer or Admin role required
- **Body:**
```json
{
  "required_documents": ["passport", "bank_statement"],
  "deadline": "2024-02-15T00:00:00Z",
  "message": "Please provide additional documents"
}
```

#### Approve Visa Application
- **PUT** `/api/visa-officer/applications/:applicationId/approve`
- **Auth:** Visa Officer or Admin role required
- **Body:**
```json
{
  "approval_details": "Application approved",
  "validity_period": "6 months",
  "conditions": ["Single entry only"]
}
```

#### Reject Visa Application
- **PUT** `/api/visa-officer/applications/:applicationId/reject`
- **Auth:** Visa Officer or Admin role required
- **Body:**
```json
{
  "rejection_reason": "Insufficient financial documents",
  "rejection_code": "FIN001",
  "appeal_instructions": "You may appeal within 30 days"
}
```

### Application Status Management

#### Get Applications by Status
- **GET** `/api/visa-officer/applications/status/:status`
- **Auth:** Visa Officer or Admin role required

#### Get Pending Applications
- **GET** `/api/visa-officer/applications/pending`
- **Query Parameters:** `page`, `limit`, `priority`

### Notes and History

#### Add Application Notes
- **POST** `/api/visa-officer/applications/:applicationId/notes`
- **Auth:** Visa Officer or Admin role required
- **Body:**
```json
{
  "notes": "Internal note for review",
  "is_internal": true
}
```

#### Get Application History
- **GET** `/api/visa-officer/applications/:applicationId/history`
- **Auth:** Visa Officer or Admin role required

### Bulk Operations

#### Bulk Update Applications
- **PUT** `/api/visa-officer/applications/bulk-update`
- **Auth:** Visa Officer or Admin role required
- **Body:**
```json
{
  "application_ids": ["id1", "id2", "id3"],
  "status": "approved",
  "comments": "Bulk approval"
}
```

### Analytics and Reports

#### Get Visa Application Statistics
- **GET** `/api/visa-officer/statistics`
- **Query Parameters:** `start_date`, `end_date`, `period`

#### Get Performance Metrics
- **GET** `/api/visa-officer/performance/:officerId`
- **Query Parameters:** `start_date`, `end_date`

#### Export Applications Data
- **GET** `/api/visa-officer/export`
- **Query Parameters:** `format`, `status`, `country`, `start_date`, `end_date`

---

## 📢 ADVERTISER APIs (Existing)

### Note
Advertiser APIs were already implemented in the system. The existing endpoints include:

- **Advertiser Management:** Create, get, update advertiser profiles
- **Campaign Management:** Create, manage, and track ad campaigns
- **Creative Management:** Create and manage ad creatives
- **Ad Serving:** Serve ads and track performance
- **AI Targeting:** Get audience suggestions and optimize targeting
- **Analytics:** Performance tracking and reporting
- **Admin Functions:** Verify advertisers and manage campaigns

### Base URL
```
http://localhost:3001/api/advertising
```

---

## 🛡️ MODERATOR APIs

### Authentication
All moderator endpoints require authentication with `moderator` or `admin` role.

### Dashboard

#### Get Dashboard
- **GET** `/api/moderators/dashboard`
- **Auth:** Moderator or Admin role required
- **Response:** Pending content count, today's moderated count, weekly stats, recent flags

### Content Moderation

#### Get Flagged Content
- **GET** `/api/moderators/flagged-content`
- **Query Parameters:** `page`, `limit`, `content_type`, `reason`, `priority`, `flagged_from`, `flagged_to`

#### Get Content for Moderation
- **GET** `/api/moderators/content/:contentType/:contentId`
- **Auth:** Moderator or Admin role required
- **Content Types:** `car`, `course`, `scholarship`, `visa_service`

#### Moderate Content
- **PUT** `/api/moderators/content/:contentType/:contentId/moderate`
- **Auth:** Moderator or Admin role required
- **Body:**
```json
{
  "action": "approved",
  "reason": "Content meets guidelines",
  "notes": "Additional notes"
}
```

#### Approve Content
- **PUT** `/api/moderators/content/:contentType/:contentId/approve`
- **Auth:** Moderator or Admin role required

#### Reject Content
- **PUT** `/api/moderators/content/:contentType/:contentId/reject`
- **Auth:** Moderator or Admin role required

#### Remove Content
- **DELETE** `/api/moderators/content/:contentType/:contentId`
- **Auth:** Moderator or Admin role required

### Content Flagging

#### Flag Content
- **POST** `/api/moderators/content/:contentType/:contentId/flag`
- **Auth:** Required
- **Body:**
```json
{
  "reason": "inappropriate",
  "description": "Content violates community guidelines"
}
```

### User Moderation

#### Get User Reports
- **GET** `/api/moderators/user-reports`
- **Query Parameters:** `page`, `limit`, `status`, `reason`, `reported_from`, `reported_to`

#### Moderate User
- **PUT** `/api/moderators/users/:userId/moderate`
- **Auth:** Moderator or Admin role required
- **Body:**
```json
{
  "action": "suspend",
  "reason": "Repeated violations",
  "duration": "7 days"
}
```

### Moderation Queue and History

#### Get Moderation Queue
- **GET** `/api/moderators/queue`
- **Query Parameters:** `page`, `limit`, `priority`

#### Add Moderation Notes
- **POST** `/api/moderators/content/:contentType/:contentId/notes`
- **Auth:** Moderator or Admin role required

#### Get Moderation History
- **GET** `/api/moderators/content/:contentType/:contentId/history`
- **Auth:** Moderator or Admin role required

### Bulk Operations

#### Bulk Moderate Content
- **PUT** `/api/moderators/content/bulk-moderate`
- **Auth:** Moderator or Admin role required
- **Body:**
```json
{
  "content_ids": ["id1", "id2", "id3"],
  "content_type": "car",
  "action": "approved",
  "reason": "Bulk approval"
}
```

### Analytics and Reports

#### Get Moderation Statistics
- **GET** `/api/moderators/statistics`
- **Query Parameters:** `start_date`, `end_date`, `period`

#### Get Performance Metrics
- **GET** `/api/moderators/performance/:moderatorId`
- **Query Parameters:** `start_date`, `end_date`

---

## 🔐 Authentication & Authorization

### JWT Token Required
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Role-Based Access Control
- **Dealer APIs:** Require `dealer` role
- **Visa Officer APIs:** Require `visa_officer` or `admin` role
- **Advertiser APIs:** Require `advertiser` or `admin` role
- **Moderator APIs:** Require `moderator` or `admin` role

### Getting Authentication Token
```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "identifier": "your_email@example.com",
  "password": "your_password"
}
```

---

## 📊 Response Format

All APIs follow a consistent response format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ]
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 🚀 Getting Started

1. **Start the server:**
   ```bash
   cd server
   npm start
   ```

2. **Authenticate:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"identifier":"your_email","password":"your_password"}'
   ```

3. **Use the token:**
   ```bash
   curl -X GET http://localhost:3001/api/dealers/profile/my \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- File uploads should be handled separately (not included in these APIs)
- Rate limiting may be applied to prevent abuse
- All sensitive operations are logged for audit purposes
- Database transactions are used for data consistency
- Input validation is performed on all endpoints
- Error handling follows RESTful conventions

---

## 🔧 Database Tables Required

The following tables are required for these APIs to function:

- `dealers` - Dealer profiles and business information
- `cars` - Vehicle inventory
- `dealer_reviews` - Customer reviews for dealers
- `visa_applications` - Visa application data
- `content_moderation` - Content moderation records
- `content_flags` - Content flagging system
- `user_reports` - User reporting system
- `user_moderation` - User moderation actions
- `advertisers` - Advertiser profiles (existing)
- `ad_campaigns` - Advertising campaigns (existing)
- `ad_creatives` - Ad creative content (existing)

Make sure these tables exist in your database schema before using the APIs.
