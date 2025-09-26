# 🎓 Student API Documentation & Testing Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL & Headers](#base-url--headers)
- [Student API Endpoints](#student-api-endpoints)
  - [Authentication & Profile](#authentication--profile)
  - [Course Management](#course-management)
  - [Enrollment & Progress](#enrollment--progress)
  - [Reviews & Favorites](#reviews--favorites)
  - [Scholarships](#scholarships)
  - [AI Features](#ai-features)
  - [Transactions](#transactions)
- [Testing Examples](#testing-examples)
- [Error Handling](#error-handling)
- [Sample Data](#sample-data)

---

## 🏗️ Overview

This documentation covers all API endpoints available to students in the Reaglex Platform. Students can:
- Browse and enroll in courses
- Track their learning progress
- Apply for scholarships
- Use AI-powered features
- Manage their profile and preferences

**Student Role**: `student`

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Login to Get Token
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "student-123",
    "email": "student@example.com",
    "role": "student",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

---

## 🌐 Base URL & Headers

**Base URL**: `http://localhost:3001`

**Required Headers:**
```http
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

---

## 🎯 Student API Endpoints

### 🔑 Authentication & Profile

#### Register New Student
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "newstudent@example.com",
  "password": "password123",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "student"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1234567890",
  "bio": "Passionate learner"
}
```

---

### 📚 Course Management

#### Browse All Courses
```http
GET /api/elearning/courses
Authorization: Bearer <token>
```

**Query Parameters:**
- `category` - Filter by category (e.g., "Programming")
- `level` - Filter by level (beginner, intermediate, advanced, expert)
- `language` - Filter by language (e.g., "English")
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `isFeatured` - Show only featured courses (true/false)
- `isPublished` - Show only published courses (true/false)
- `sortBy` - Sort by: title, price, rating, created_at, student_count
- `sortDir` - Sort direction: asc, desc
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset (default: 0)

#### Get Course Details
```http
GET /api/elearning/courses/:courseId
Authorization: Bearer <token>
```

#### Search Courses
```http
GET /api/elearning/courses/search?query=javascript
Authorization: Bearer <token>
```

#### Get Course Modules
```http
GET /api/elearning/courses/:courseId/modules
Authorization: Bearer <token>
```

#### Get Module Lessons
```http
GET /api/elearning/modules/:moduleId/lessons
Authorization: Bearer <token>
```

#### Get Lesson Details
```http
GET /api/elearning/lessons/:lessonId
Authorization: Bearer <token>
```

#### Get Recommended Courses
```http
GET /api/elearning/courses-recommended
Authorization: Bearer <token>
```

#### Get Trending Courses
```http
GET /api/elearning/trending
Authorization: Bearer <token>
```

#### Get Course Categories
```http
GET /api/elearning/categories
Authorization: Bearer <token>
```

---

### 🎯 Enrollment & Progress

#### Enroll in Course
```http
POST /api/elearning/courses/:courseId/enroll
Authorization: Bearer <token>
```

#### Get Enrollment Status
```http
GET /api/elearning/courses/:courseId/enrollment
Authorization: Bearer <token>
```

#### Get All Enrollments
```http
GET /api/elearning/enrollments
Authorization: Bearer <token>
```

#### Get Progress Summary
```http
GET /api/elearning/progress
Authorization: Bearer <token>
```

#### Get Course Progress
```http
GET /api/elearning/courses/:courseId/progress
Authorization: Bearer <token>
```

#### Get Enrollment Progress
```http
GET /api/elearning/enrollments/:enrollmentId/progress
Authorization: Bearer <token>
```

#### Update Lesson Progress
```http
PUT /api/elearning/lessons/:lessonId/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_completed": true,
  "time_spent_minutes": 45,
  "progress_percentage": 100,
  "notes": "Great lesson!",
  "quiz_score": 85,
  "last_position_seconds": 1800
}
```

#### Upsert Progress
```http
POST /api/elearning/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "enrollment_id": "enrollment-123",
  "lesson_id": "lesson-456",
  "is_completed": true,
  "time_spent_minutes": 30,
  "progress_percentage": 100
}
```

#### Complete Course
```http
POST /api/elearning/courses/:courseId/complete
Authorization: Bearer <token>
```

---

### ⭐ Reviews & Favorites

#### Add Course Review
```http
POST /api/elearning/courses/:courseId/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent course! Very well structured and informative."
}
```

#### Get Course Reviews
```http
GET /api/elearning/courses/:courseId/reviews
Authorization: Bearer <token>
```

#### Add Course to Favorites
```http
POST /api/elearning/courses/:courseId/favorite
Authorization: Bearer <token>
```

#### Remove Course from Favorites
```http
DELETE /api/elearning/courses/:courseId/favorite
Authorization: Bearer <token>
```

#### Get My Favorites
```http
GET /api/elearning/me/favorites
Authorization: Bearer <token>
```

---

### 🎓 Scholarships

#### Browse Scholarships
```http
GET /api/scholarships
Authorization: Bearer <token>
```

**Query Parameters:**
- `provider_type` - Filter by provider type
- `amount_type` - Filter by amount type
- `field_of_study` - Filter by field of study
- `country` - Filter by country
- `deadline` - Filter by deadline
- `limit` - Number of results
- `offset` - Pagination offset

#### Get Scholarship Details
```http
GET /api/scholarships/:id
Authorization: Bearer <token>
```

#### Get Featured Scholarships
```http
GET /api/scholarships/featured/list
Authorization: Bearer <token>
```

#### Get Trending Scholarships
```http
GET /api/scholarships/trending/list
Authorization: Bearer <token>
```

#### Apply for Scholarship
```http
POST /api/scholarships/:id/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "personal_info": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "date_of_birth": "1995-01-01",
    "nationality": "US",
    "address": "123 Main St, City, State"
  },
  "academic_info": {
    "current_university": "University of Technology",
    "current_program": "Computer Science",
    "gpa": 3.8,
    "graduation_year": 2024
  },
  "financial_info": {
    "annual_income": 50000,
    "family_size": 4,
    "financial_aid_received": 5000
  },
  "essay": "I am passionate about technology and want to contribute to the field...",
  "documents": [
    {
      "type": "transcript",
      "url": "https://example.com/transcript.pdf"
    },
    {
      "type": "recommendation",
      "url": "https://example.com/recommendation.pdf"
    }
  ]
}
```

#### Get My Applications
```http
GET /api/scholarships/applications/my
Authorization: Bearer <token>
```

#### Get Application Details
```http
GET /api/scholarships/applications/:id
Authorization: Bearer <token>
```

#### Update Application
```http
PUT /api/scholarships/applications/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "essay": "Updated essay content...",
  "documents": [
    {
      "type": "updated_transcript",
      "url": "https://example.com/new-transcript.pdf"
    }
  ]
}
```

#### Withdraw Application
```http
DELETE /api/scholarships/applications/:id
Authorization: Bearer <token>
```

#### Get Application Statistics
```http
GET /api/scholarships/applications/stats/my
Authorization: Bearer <token>
```

#### Get Personalized Recommendations
```http
GET /api/scholarships/recommendations/personalized
Authorization: Bearer <token>
```

#### Get Success Prediction
```http
GET /api/scholarships/:scholarshipId/prediction
Authorization: Bearer <token>
```

#### Get Detailed Success Prediction
```http
GET /api/scholarships/:scholarshipId/success-prediction
Authorization: Bearer <token>
```

#### Get Application Form Prediction
```http
POST /api/scholarships/:scholarshipId/success-prediction/form
Authorization: Bearer <token>
Content-Type: application/json

{
  "gpa": 3.8,
  "essay_quality": "high",
  "recommendations": 2,
  "extracurriculars": ["volunteering", "research"],
  "financial_need": "moderate"
}
```

#### Get Quick Success Check
```http
GET /api/scholarships/:scholarshipId/success-check
Authorization: Bearer <token>
```

---

### 🤖 AI Features

#### Get AI Status
```http
GET /api/ai/status
Authorization: Bearer <token>
```

#### Send Chat Message
```http
POST /api/ai/chat/message
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "What courses do you recommend for learning JavaScript?",
  "context": "beginner"
}
```

#### Get Chat Suggestions
```http
GET /api/ai/chat/suggestions
Authorization: Bearer <token>
```

#### Get Personalized Recommendations
```http
GET /api/ai/personalization/recommendations?type=courses&limit=10
Authorization: Bearer <token>
```

#### Get Personalized Content
```http
GET /api/ai/personalization/content?content_type=courses&limit=5
Authorization: Bearer <token>
```

#### Get User Profile
```http
GET /api/ai/personalization/profile
Authorization: Bearer <token>
```

#### Predict User Behavior
```http
POST /api/ai/personalization/predict-behavior
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "course_enrollment",
  "context": {
    "course_category": "programming",
    "course_level": "intermediate"
  }
}
```

#### Get Business Insights
```http
GET /api/ai/analytics/insights?period=30d
Authorization: Bearer <token>
```

#### Get Future Trends
```http
GET /api/ai/analytics/trends?forecast_days=30
Authorization: Bearer <token>
```

#### Get User Behavior Analysis
```http
GET /api/ai/analytics/behavior?analysis_type=learning_patterns
Authorization: Bearer <token>
```

#### Get Optimization Recommendations
```http
GET /api/ai/analytics/optimization
Authorization: Bearer <token>
```

#### Detect Anomalies
```http
GET /api/ai/analytics/anomalies?timeframe=7d
Authorization: Bearer <token>
```

---

### 💳 Transactions

#### Create Transaction
```http
POST /api/elearning/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": "course-123",
  "amount": 99.99,
  "currency": "USD",
  "payment_method": "credit_card",
  "payment_details": {
    "card_number": "****1234",
    "expiry_month": 12,
    "expiry_year": 2025
  }
}
```

#### Get My Transactions
```http
GET /api/elearning/transactions
Authorization: Bearer <token>
```

#### Get Transaction Details
```http
GET /api/elearning/transactions/:transactionId
Authorization: Bearer <token>
```

---

## 🧪 Testing Examples

### Complete Student Workflow Test

#### 1. Register and Login
```bash
# Register new student
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teststudent@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "Student",
    "role": "student"
  }'

# Login to get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teststudent@example.com",
    "password": "password123"
  }'
```

#### 2. Browse Courses
```bash
# Get all courses
curl -X GET http://localhost:3001/api/elearning/courses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Search for JavaScript courses
curl -X GET "http://localhost:3001/api/elearning/courses/search?query=javascript" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get course details
curl -X GET http://localhost:3001/api/elearning/courses/course-123 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 3. Enroll in Course
```bash
# Enroll in a course
curl -X POST http://localhost:3001/api/elearning/courses/course-123/enroll \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Check enrollment status
curl -X GET http://localhost:3001/api/elearning/courses/course-123/enrollment \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4. Track Progress
```bash
# Update lesson progress
curl -X PUT http://localhost:3001/api/elearning/lessons/lesson-456/progress \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "is_completed": true,
    "time_spent_minutes": 45,
    "progress_percentage": 100,
    "notes": "Great lesson!"
  }'

# Get progress summary
curl -X GET http://localhost:3001/api/elearning/progress \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 5. Add Review and Favorite
```bash
# Add course review
curl -X POST http://localhost:3001/api/elearning/courses/course-123/reviews \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Excellent course!"
  }'

# Add to favorites
curl -X POST http://localhost:3001/api/elearning/courses/course-123/favorite \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get my favorites
curl -X GET http://localhost:3001/api/elearning/me/favorites \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 6. Apply for Scholarship
```bash
# Apply for scholarship
curl -X POST http://localhost:3001/api/scholarships/scholarship-123/apply \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "personal_info": {
      "full_name": "Test Student",
      "email": "teststudent@example.com",
      "phone": "+1234567890",
      "date_of_birth": "1995-01-01",
      "nationality": "US"
    },
    "academic_info": {
      "current_university": "Test University",
      "current_program": "Computer Science",
      "gpa": 3.8,
      "graduation_year": 2024
    },
    "essay": "I am passionate about learning..."
  }'

# Get my applications
curl -X GET http://localhost:3001/api/scholarships/applications/my \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 7. Use AI Features
```bash
# Chat with AI
curl -X POST http://localhost:3001/api/ai/chat/message \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What courses do you recommend?",
    "context": "beginner"
  }'

# Get personalized recommendations
curl -X GET "http://localhost:3001/api/ai/personalization/recommendations?type=courses&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ❌ Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📊 Sample Data

### Sample Course Response
```json
{
  "id": "course-123",
  "title": "JavaScript Fundamentals",
  "description": "Learn JavaScript from scratch with hands-on projects",
  "short_description": "Master JavaScript programming",
  "price": "99.99",
  "currency": "USD",
  "category": "Programming",
  "subcategory": "Web Development",
  "level": "beginner",
  "language": "English",
  "duration_hours": 20,
  "thumbnail": "https://example.com/js-thumbnail.jpg",
  "preview_video": "https://example.com/js-preview.mp4",
  "syllabus": ["Variables", "Functions", "Objects", "DOM Manipulation"],
  "requirements": ["Basic HTML knowledge", "Text editor"],
  "learning_outcomes": ["Write JavaScript code", "Build interactive web pages"],
  "tags": ["javascript", "web-development", "programming"],
  "rating": "4.50",
  "review_count": 150,
  "student_count": 1200,
  "is_published": 1,
  "is_featured": 1,
  "status": "published",
  "instructor_id": "instructor-123",
  "completion_certificate": 1,
  "has_live_classes": 0,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### Sample Enrollment Response
```json
{
  "id": "enrollment-123",
  "user_id": "student-123",
  "course_id": "course-123",
  "enrolled_at": "2024-01-15T10:30:00.000Z",
  "status": "active",
  "progress_percentage": 0,
  "completed_at": null,
  "certificate_issued": false
}
```

### Sample Progress Response
```json
{
  "id": "progress-123",
  "user_id": "student-123",
  "lesson_id": "lesson-456",
  "is_completed": true,
  "time_spent_minutes": 45,
  "progress_percentage": 100,
  "notes": "Great lesson!",
  "quiz_score": 85,
  "last_position_seconds": 1800,
  "completed_at": "2024-01-15T11:15:00.000Z",
  "updated_at": "2024-01-15T11:15:00.000Z"
}
```

### Sample Scholarship Response
```json
{
  "id": "scholarship-123",
  "title": "Computer Science Excellence Scholarship",
  "description": "Awarded to outstanding computer science students",
  "provider_name": "Tech University",
  "provider_type": "university",
  "amount_type": "full",
  "amount": 25000,
  "currency": "USD",
  "field_of_study": ["Computer Science", "Software Engineering"],
  "application_deadline": "2024-06-30",
  "start_date": "2024-09-01",
  "duration_months": 12,
  "eligibility_criteria": {
    "min_gpa": 3.5,
    "required_documents": ["transcript", "essay", "recommendation"]
  },
  "is_merit_based": true,
  "is_need_based": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔧 Testing Tools

### Using Postman
1. Import the collection with all endpoints
2. Set up environment variables for `base_url` and `token`
3. Run the authentication flow first to get a token
4. Use the token in subsequent requests

### Using curl
All examples above use curl commands that can be run directly in terminal

### Using JavaScript/Fetch
```javascript
// Example: Get courses
const response = await fetch('http://localhost:3001/api/elearning/courses', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'Content-Type': 'application/json'
  }
});
const courses = await response.json();
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- Prices are returned as strings to maintain precision
- Boolean values are returned as integers (0/1) for database compatibility
- Pagination uses `limit` and `offset` parameters
- All protected endpoints require valid JWT token
- Rate limiting may apply to prevent abuse
- Some endpoints may have additional query parameters not listed here

---

**Last Updated**: January 2024  
**API Version**: v1  
**Server Port**: 3001
