# 🚀 Complete E-Learning API Testing Guide

## Server Status
- **Base URL**: `http://localhost:3001`
- **Database**: ✅ Connected and working
- **Status**: All endpoints ready for testing

---

## 🔐 Authentication Endpoints

### 1. User Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@example.com",
    "password": "StrongPassword123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user-uuid",
    "email": "instructor@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student"
  },
  "token": "jwt-token-here"
}
```

### 2. User Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "instructor@example.com",
    "password": "StrongPassword123!"
  }'
```

**Expected Response:**
```json
{
  "access_token": "jwt-access-token-here",
  "access_expires_in": 900,
  "refresh_token": "refresh-token-here",
  "refresh_expires_in": 2592000,
  "user": {
    "id": "user-uuid",
    "email": "instructor@example.com",
    "role": "student"
  }
}
```

### 3. Get User Profile
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "instructor@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student",
    "created_at": "2025-01-22T10:00:00.000Z"
  }
}
```

### 4. Update User Profile
```bash
curl -X PUT http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John Updated",
    "last_name": "Doe Updated",
    "bio": "Updated bio information"
  }'
```

**Expected Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user-uuid",
    "email": "instructor@example.com",
    "first_name": "John Updated",
    "last_name": "Doe Updated",
    "bio": "Updated bio information",
    "role": "student"
  }
}
```

---

## 🏢 Organization Management (Multi-Tenant)

### 4. Create Organization
```bash
curl -X POST http://localhost:3001/api/orgs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Learning Corp",
    "description": "Technology learning organization",
    "website": "https://techlearning.com",
    "industry": "Technology"
  }'
```

**Expected Response:**
```json
{
  "message": "Organization created successfully",
  "organization": {
    "id": "org-uuid",
    "name": "Tech Learning Corp",
    "description": "Technology learning organization",
    "website": "https://techlearning.com",
    "industry": "Technology",
    "created_by": "user-uuid",
    "created_at": "2025-01-22T10:00:00.000Z"
  }
}
```

### 5. List User's Organizations
```bash
curl -X GET http://localhost:3001/api/orgs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "organizations": [
    {
      "id": "org-uuid",
      "name": "Tech Learning Corp",
      "description": "Technology learning organization",
      "role": "org_admin",
      "joined_at": "2025-01-22T10:00:00.000Z"
    }
  ]
}
```

### 6. Add Member to Organization
```bash
curl -X POST http://localhost:3001/api/orgs/ORG_ID/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_ID",
    "role": "student"
  }'
```

**Expected Response:**
```json
{
  "message": "Member added successfully",
  "membership": {
    "id": "membership-uuid",
    "user_id": "USER_ID",
    "organization_id": "ORG_ID",
    "role": "student",
    "joined_at": "2025-01-22T10:00:00.000Z"
  }
}
```

### 7. List Organization Members
```bash
curl -X GET http://localhost:3001/api/orgs/ORG_ID/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "members": [
    {
      "id": "membership-uuid",
      "user": {
        "id": "user-uuid",
        "email": "member@example.com",
        "first_name": "Member",
        "last_name": "User"
      },
      "role": "student",
      "joined_at": "2025-01-22T10:00:00.000Z"
    }
  ]
}
```

### 8. Remove Member from Organization
```bash
curl -X DELETE http://localhost:3001/api/orgs/ORG_ID/members/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "message": "Member removed successfully"
}
```

---

## 📚 Course Management

### 7. List All Courses (Public)
```bash
curl -X GET http://localhost:3001/api/elearning/courses
```

### 8. List Courses with Pagination
```bash
curl -X GET "http://localhost:3001/api/elearning/courses?page=1&limit=10"
```

### 9. List Courses with Filters
```bash
# Filter by category
curl -X GET "http://localhost:3001/api/elearning/courses?category=Programming"

# Filter by level
curl -X GET "http://localhost:3001/api/elearning/courses?level=beginner"

# Filter by price range
curl -X GET "http://localhost:3001/api/elearning/courses?min_price=0&max_price=100"

# Filter by rating
curl -X GET "http://localhost:3001/api/elearning/courses?min_rating=4.0"
```

### 10. Search Courses
```bash
curl -X GET "http://localhost:3001/api/elearning/courses/search?q=node&category=Programming"
```

### 11. Get Course Details
```bash
curl -X GET http://localhost:3001/api/elearning/courses/COURSE_ID
```

### 12. Create Course (Instructor Only)
```bash
curl -X POST http://localhost:3001/api/elearning/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced JavaScript",
    "description": "Learn advanced JavaScript concepts including closures, prototypes, and modern ES6+ features",
    "short_description": "Advanced JS course for experienced developers",
    "price": 99.99,
    "currency": "USD",
    "category": "Programming",
    "subcategory": "Web Development",
    "level": "advanced",
    "language": "English",
    "duration_hours": 20,
    "thumbnail": "https://example.com/thumbnail.jpg",
    "preview_video": "https://example.com/preview.mp4",
    "tags": ["javascript", "advanced", "programming", "es6"],
    "requirements": [
      "Basic JavaScript knowledge",
      "Understanding of HTML/CSS",
      "Node.js installed"
    ],
    "learning_outcomes": [
      "Master advanced JS concepts",
      "Understand closures and scope",
      "Work with prototypes and classes",
      "Use modern ES6+ features"
    ],
    "syllabus": [
      "Module 1: Closures and Scope",
      "Module 2: Prototypes and Classes",
      "Module 3: ES6+ Features",
      "Module 4: Async Programming"
    ],
    "completion_certificate": true,
    "has_live_classes": false
  }'
```

**Expected Response:**
```json
{
  "message": "Course created successfully",
  "course": {
    "id": "course-uuid",
    "title": "Advanced JavaScript",
    "description": "Learn advanced JavaScript concepts including closures, prototypes, and modern ES6+ features",
    "short_description": "Advanced JS course for experienced developers",
    "price": "99.99",
    "currency": "USD",
    "category": "Programming",
    "subcategory": "Web Development",
    "level": "advanced",
    "language": "English",
    "duration_hours": 20,
    "thumbnail": "https://example.com/thumbnail.jpg",
    "preview_video": "https://example.com/preview.mp4",
    "tags": ["javascript", "advanced", "programming", "es6"],
    "requirements": ["Basic JavaScript knowledge", "Understanding of HTML/CSS", "Node.js installed"],
    "learning_outcomes": ["Master advanced JS concepts", "Understand closures and scope", "Work with prototypes and classes", "Use modern ES6+ features"],
    "syllabus": ["Module 1: Closures and Scope", "Module 2: Prototypes and Classes", "Module 3: ES6+ Features", "Module 4: Async Programming"],
    "rating": "0.00",
    "review_count": 0,
    "student_count": 0,
    "is_published": false,
    "is_featured": false,
    "status": "draft",
    "instructor_id": "instructor-uuid",
    "completion_certificate": true,
    "has_live_classes": false,
    "live_class_schedule": null,
    "created_at": "2025-01-22T10:00:00.000Z",
    "updated_at": "2025-01-22T10:00:00.000Z",
    "organization_id": null
  }
}
```

### 13. Update Course (Instructor Only)
```bash
curl -X PATCH http://localhost:3001/api/elearning/courses/COURSE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Advanced JavaScript Course",
    "description": "Updated description with more details",
    "price": 129.99,
    "tags": ["javascript", "advanced", "programming", "es6", "updated"],
    "is_featured": true
  }'
```

**Expected Response:**
```json
{
  "message": "Course updated successfully",
  "course": {
    "id": "course-uuid",
    "title": "Updated Advanced JavaScript Course",
    "description": "Updated description with more details",
    "price": "129.99",
    "tags": ["javascript", "advanced", "programming", "es6", "updated"],
    "is_featured": true,
    "updated_at": "2025-01-22T10:30:00.000Z"
  }
}
```

### 14. Publish/Unpublish Course (Admin Only)
```bash
curl -X POST http://localhost:3001/api/elearning/courses/COURSE_ID/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_published": true,
    "status": "published"
  }'
```

**Expected Response:**
```json
{
  "message": "Course status updated successfully",
  "course": {
    "id": "course-uuid",
    "is_published": true,
    "status": "published",
    "published_at": "2025-01-22T10:30:00.000Z"
  }
}
```

### 15. Delete Course (Instructor Only)
```bash
curl -X DELETE http://localhost:3001/api/elearning/courses/COURSE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "message": "Course deleted successfully"
}
```

### 15. Get Course Statistics
```bash
curl -X GET http://localhost:3001/api/elearning/courses/COURSE_ID/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📖 Module Management

### 16. List Course Modules
```bash
curl -X GET http://localhost:3001/api/elearning/courses/COURSE_ID/modules
```

### 17. Create Module (Instructor Only)
```bash
curl -X POST http://localhost:3001/api/elearning/courses/COURSE_ID/modules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to JavaScript",
    "description": "Learn the basics of JavaScript programming language",
    "order_index": 1,
    "is_published": true,
    "estimated_duration": 120
  }'
```

**Expected Response:**
```json
{
  "message": "Module created successfully",
  "module": {
    "id": "module-uuid",
    "title": "Introduction to JavaScript",
    "description": "Learn the basics of JavaScript programming language",
    "order_index": 1,
    "is_published": true,
    "estimated_duration": 120,
    "course_id": "course-uuid",
    "created_at": "2025-01-22T10:00:00.000Z",
    "updated_at": "2025-01-22T10:00:00.000Z"
  }
}
```

### 18. Get Module Details
```bash
curl -X GET http://localhost:3001/api/elearning/modules/MODULE_ID
```

### 19. Update Module (Instructor Only)
```bash
curl -X PATCH http://localhost:3001/api/elearning/modules/MODULE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Introduction to JavaScript",
    "description": "Updated description with more comprehensive content",
    "estimated_duration": 150,
    "is_published": true
  }'
```

**Expected Response:**
```json
{
  "message": "Module updated successfully",
  "module": {
    "id": "module-uuid",
    "title": "Updated Introduction to JavaScript",
    "description": "Updated description with more comprehensive content",
    "estimated_duration": 150,
    "is_published": true,
    "updated_at": "2025-01-22T10:30:00.000Z"
  }
}
```

### 20. Delete Module (Instructor Only)
```bash
curl -X DELETE http://localhost:3001/api/elearning/modules/MODULE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "message": "Module deleted successfully"
}
```

---

## 🎯 Lesson Management

### 21. List Module Lessons
```bash
curl -X GET http://localhost:3001/api/elearning/modules/MODULE_ID/lessons
```

### 22. Create Lesson (Instructor Only)
```bash
curl -X POST http://localhost:3001/api/elearning/modules/MODULE_ID/lessons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Variables and Data Types",
    "content": "Learn about JavaScript variables and data types including let, const, var, and primitive types",
    "video_url": "https://example.com/video.mp4",
    "duration_minutes": 30,
    "order_index": 1,
    "is_preview": false,
    "is_published": true,
    "lesson_type": "video",
    "resources": [
      {
        "type": "pdf",
        "title": "Variables Cheat Sheet",
        "url": "https://example.com/cheatsheet.pdf"
      },
      {
        "type": "code",
        "title": "Practice Exercises",
        "url": "https://example.com/exercises.js"
      }
    ],
    "quiz_questions": [
      {
        "question": "What is the difference between let and const?",
        "type": "multiple_choice",
        "options": ["let is mutable, const is immutable", "No difference", "const is mutable, let is immutable"],
        "correct_answer": 0
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "message": "Lesson created successfully",
  "lesson": {
    "id": "lesson-uuid",
    "title": "Variables and Data Types",
    "content": "Learn about JavaScript variables and data types including let, const, var, and primitive types",
    "video_url": "https://example.com/video.mp4",
    "duration_minutes": 30,
    "order_index": 1,
    "is_preview": false,
    "is_published": true,
    "lesson_type": "video",
    "resources": [
      {
        "type": "pdf",
        "title": "Variables Cheat Sheet",
        "url": "https://example.com/cheatsheet.pdf"
      },
      {
        "type": "code",
        "title": "Practice Exercises",
        "url": "https://example.com/exercises.js"
      }
    ],
    "quiz_questions": [
      {
        "question": "What is the difference between let and const?",
        "type": "multiple_choice",
        "options": ["let is mutable, const is immutable", "No difference", "const is mutable, let is immutable"],
        "correct_answer": 0
      }
    ],
    "module_id": "module-uuid",
    "created_at": "2025-01-22T10:00:00.000Z",
    "updated_at": "2025-01-22T10:00:00.000Z"
  }
}
```

### 23. Get Lesson Details
```bash
curl -X GET http://localhost:3001/api/elearning/lessons/LESSON_ID
```

### 24. Update Lesson (Instructor Only)
```bash
curl -X PATCH http://localhost:3001/api/elearning/lessons/LESSON_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Lesson Title",
    "content": "Updated lesson content"
  }'
```

### 25. Delete Lesson (Instructor Only)
```bash
curl -X DELETE http://localhost:3001/api/elearning/lessons/LESSON_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎓 Enrollment & Progress

### 26. Enroll in Course (Student Only)
```bash
curl -X POST http://localhost:3001/api/elearning/courses/COURSE_ID/enroll \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method": "credit_card",
    "coupon_code": "WELCOME10"
  }'
```

**Expected Response:**
```json
{
  "message": "Successfully enrolled in course",
  "enrollment": {
    "id": "enrollment-uuid",
    "user_id": "user-uuid",
    "course_id": "course-uuid",
    "enrolled_at": "2025-01-22T10:00:00.000Z",
    "status": "active",
    "progress_percentage": 0,
    "completion_date": null
  }
}
```

### 27. List User Enrollments
```bash
curl -X GET http://localhost:3001/api/elearning/enrollments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 28. Update Lesson Progress (Student Only)
```bash
curl -X PUT http://localhost:3001/api/elearning/lessons/LESSON_ID/progress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true,
    "time_spent": 30,
    "progress_percentage": 100,
    "notes": "Great lesson, learned a lot about variables",
    "quiz_score": 85,
    "last_position": 1800
  }'
```

**Expected Response:**
```json
{
  "message": "Progress updated successfully",
  "progress": {
    "id": "progress-uuid",
    "user_id": "user-uuid",
    "lesson_id": "lesson-uuid",
    "completed": true,
    "time_spent": 30,
    "progress_percentage": 100,
    "notes": "Great lesson, learned a lot about variables",
    "quiz_score": 85,
    "last_position": 1800,
    "updated_at": "2025-01-22T10:30:00.000Z"
  }
}
```

### 29. Get User Progress Summary
```bash
curl -X GET http://localhost:3001/api/elearning/progress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 30. Get Course Progress
```bash
curl -X GET http://localhost:3001/api/elearning/courses/COURSE_ID/progress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ⭐ Reviews & Ratings

### 31. Get Course Reviews
```bash
curl -X GET http://localhost:3001/api/elearning/courses/COURSE_ID/reviews
```

### 32. Add Review (Student Only)
```bash
curl -X POST http://localhost:3001/api/elearning/courses/COURSE_ID/reviews \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Excellent course! Very well explained with practical examples.",
    "title": "Great Learning Experience",
    "pros": ["Clear explanations", "Good examples", "Practical exercises"],
    "cons": ["Could use more advanced topics"],
    "recommend": true
  }'
```

**Expected Response:**
```json
{
  "message": "Review added successfully",
  "review": {
    "id": "review-uuid",
    "user_id": "user-uuid",
    "course_id": "course-uuid",
    "rating": 5,
    "comment": "Excellent course! Very well explained with practical examples.",
    "title": "Great Learning Experience",
    "pros": ["Clear explanations", "Good examples", "Practical exercises"],
    "cons": ["Could use more advanced topics"],
    "recommend": true,
    "created_at": "2025-01-22T10:00:00.000Z",
    "updated_at": "2025-01-22T10:00:00.000Z"
  }
}
```

### 33. Update Review (Student Only)
```bash
curl -X PUT http://localhost:3001/api/elearning/reviews/REVIEW_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Updated review comment"
  }'
```

### 34. Delete Review (Student Only)
```bash
curl -X DELETE http://localhost:3001/api/elearning/reviews/REVIEW_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ❤️ Favorites & Wishlist

### 35. Add to Favorites (Student Only)
```bash
curl -X POST http://localhost:3001/api/elearning/courses/COURSE_ID/favorite \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 36. Remove from Favorites
```bash
curl -X DELETE http://localhost:3001/api/elearning/courses/COURSE_ID/favorite \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 37. List User Favorites
```bash
curl -X GET http://localhost:3001/api/elearning/favorites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Analytics & Reports

### 38. Get Platform Analytics (Admin Only)
```bash
curl -X GET http://localhost:3001/api/elearning/analytics/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 39. Get Course Analytics (Instructor Only)
```bash
curl -X GET http://localhost:3001/api/elearning/courses/COURSE_ID/analytics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 40. Get Instructor Analytics
```bash
curl -X GET http://localhost:3001/api/elearning/instructor/analytics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 41. List Students (Admin/Instructor Only)
```bash
curl -X GET http://localhost:3001/api/elearning/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔍 Search & Recommendations

### 42. Get Personalized Recommendations
```bash
curl -X GET http://localhost:3001/api/elearning/recommendations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 43. Get Trending Courses
```bash
curl -X GET http://localhost:3001/api/elearning/trending
```

### 44. Get Course Categories
```bash
curl -X GET http://localhost:3001/api/elearning/categories
```

---

## 💳 Transactions & Payments

### 45. Create Transaction
```bash
curl -X POST http://localhost:3001/api/elearning/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "course_purchase",
    "amount": 99.99,
    "currency": "USD",
    "payment_method": "credit_card",
    "payment_id": "pay_1234567890",
    "status": "completed",
    "metadata": {
      "course_id": "COURSE_ID",
      "course_title": "Advanced JavaScript",
      "instructor_id": "instructor-uuid",
      "discount_applied": 10.00,
      "coupon_code": "WELCOME10"
    }
  }'
```

**Expected Response:**
```json
{
  "message": "Transaction created successfully",
  "transaction": {
    "id": "transaction-uuid",
    "user_id": "user-uuid",
    "type": "course_purchase",
    "amount": "99.99",
    "currency": "USD",
    "payment_method": "credit_card",
    "payment_id": "pay_1234567890",
    "status": "completed",
    "metadata": {
      "course_id": "COURSE_ID",
      "course_title": "Advanced JavaScript",
      "instructor_id": "instructor-uuid",
      "discount_applied": 10.00,
      "coupon_code": "WELCOME10"
    },
    "created_at": "2025-01-22T10:00:00.000Z",
    "updated_at": "2025-01-22T10:00:00.000Z"
  }
}
```

### 46. List User Transactions
```bash
curl -X GET http://localhost:3001/api/elearning/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 47. Get Transaction Details
```bash
curl -X GET http://localhost:3001/api/elearning/transactions/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🧪 Testing Workflow

### Step 1: Start the Server
```bash
cd D:\make_the_difference\server
set MYSQL_URL=mysql://root:XOCwwEyAzulQupJJEmbKgiZFdsalhAaf@tramway.proxy.rlwy.net:54880/railway
set JWT_ACCESS_SECRET=dev_access_secret
set PORT=3001
npm start
```

### Step 2: Test Basic Health
```bash
curl http://localhost:3001/health
```

### Step 3: Test Public Endpoints
```bash
# List courses
curl http://localhost:3001/api/elearning/courses

# Search courses
curl "http://localhost:3001/api/elearning/courses/search?q=node"
```

### Step 4: Test Authentication
```bash
# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"StrongPassword123!","first_name":"Test","last_name":"User"}'

# Login and get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"StrongPassword123!"}'
```

### Step 5: Test Protected Endpoints
Use the JWT token from login in the Authorization header for protected endpoints.

---

## 📋 Quick Test Checklist

- [ ] Server health check
- [ ] Public course listing
- [ ] User registration/login
- [ ] Course creation (instructor)
- [ ] Module creation
- [ ] Lesson creation
- [ ] Course enrollment (student)
- [ ] Progress tracking
- [ ] Review system
- [ ] Favorites system
- [ ] Analytics endpoints
- [ ] Search functionality
- [ ] Organization management

---

## 🔧 Troubleshooting

### Common Issues:
1. **401 Unauthorized**: Missing or invalid JWT token
2. **403 Forbidden**: Insufficient role permissions
3. **404 Not Found**: Invalid endpoint or resource ID
4. **400 Bad Request**: Invalid request data

### Debug Tips:
- Check server logs for detailed error messages
- Verify JWT token is valid and not expired
- Ensure user has correct role for the endpoint
- Validate request data format matches API specification

---

## 🎯 Expected Results

- **Health Check**: `{"status":"ok"}`
- **Course List**: Array of course objects
- **Authentication**: JWT token for protected endpoints
- **CRUD Operations**: Success responses with created/updated data
- **Error Handling**: Proper HTTP status codes and error messages

---

**All 47+ endpoints are ready for testing! The e-learning platform is fully functional with multi-tenant support, role-based access control, and comprehensive course management features.**
