# Instructor API Documentation

## Overview
This documentation covers all API endpoints and features available to instructors in the e-learning platform. Instructors can create and manage courses, modules, lessons, quizzes, certificates, and track student progress and analytics.

## Base URL
```
http://localhost:3000/api/elearning
```

## Authentication
All instructor endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Instructor Roles
- `instructor`: Can create and manage their own courses
- `admin`: Can manage all courses and access admin features

---

## Course Management

### Create Course
Create a new course as an instructor.

**Endpoint:** `POST /courses`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
X-Org-Id: <organization-id> (required)
```

**Request Body:**
```json
{
  "title": "Introduction to JavaScript",
  "description": "Learn the fundamentals of JavaScript programming",
  "price": 99.99,
  "currency": "USD",
  "category": "Programming",
  "level": "beginner",
  "language": "English",
  "duration_hours": 20
}
```

**Response:**
```json
{
  "id": "course_123",
  "title": "Introduction to JavaScript",
  "description": "Learn the fundamentals of JavaScript programming",
  "price": 99.99,
  "currency": "USD",
  "category": "Programming",
  "level": "beginner",
  "language": "English",
  "duration_hours": 20,
  "instructor_id": "instructor_456",
  "status": "draft",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Update Course
Update an existing course.

**Endpoint:** `PATCH /courses/:courseId`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
X-Org-Id: <organization-id>
```

**Request Body:**
```json
{
  "title": "Advanced JavaScript Concepts",
  "description": "Deep dive into advanced JavaScript features",
  "price": 149.99
}
```

### Delete Course
Delete a course (only if no students are enrolled).

**Endpoint:** `DELETE /courses/:courseId`

**Headers:**
```
Authorization: Bearer <token>
X-Org-Id: <organization-id>
```

### Set Course Status
Change the status of a course (admin only).

**Endpoint:** `POST /courses/:courseId/status`

**Request Body:**
```json
{
  "status": "published"
}
```

**Valid Statuses:** `draft`, `pending_review`, `approved`, `rejected`, `published`

---

## Module Management

### Create Module
Create a new module within a course.

**Endpoint:** `POST /courses/:courseId/modules`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
X-Org-Id: <organization-id>
```

**Request Body:**
```json
{
  "title": "Variables and Data Types",
  "order_index": 1
}
```

### Update Module
Update an existing module.

**Endpoint:** `PATCH /modules/:moduleId`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
X-Org-Id: <organization-id>
```

### Delete Module
Delete a module.

**Endpoint:** `DELETE /modules/:moduleId`

**Headers:**
```
Authorization: Bearer <token>
X-Org-Id: <organization-id>
```

---

## Lesson Management

### Create Lesson
Create a new lesson within a module.

**Endpoint:** `POST /modules/:moduleId/lessons`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
X-Org-Id: <organization-id>
```

**Request Body:**
```json
{
  "title": "Understanding Variables",
  "content_type": "video",
  "order_index": 1,
  "content": "https://example.com/video.mp4",
  "duration_minutes": 15
}
```

**Content Types:** `video`, `text`, `quiz`, `assignment`, `live`

### Update Lesson
Update an existing lesson.

**Endpoint:** `PATCH /lessons/:lessonId`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
X-Org-Id: <organization-id>
```

### Delete Lesson
Delete a lesson.

**Endpoint:** `DELETE /lessons/:lessonId`

**Headers:**
```
Authorization: Bearer <token>
X-Org-Id: <organization-id>
```

---

## Quiz Management

### Create Quiz Questions
Create quiz questions for a lesson.

**Endpoint:** `POST /lessons/:lessonId/questions`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "questions": [
    {
      "question_text": "What is a variable in JavaScript?",
      "question_type": "multiple_choice",
      "options": [
        "A container for storing data",
        "A function",
        "A loop",
        "A condition"
      ],
      "correct_answer": 0,
      "points": 10,
      "explanation": "A variable is a container for storing data values."
    },
    {
      "question_text": "Which keyword is used to declare a variable?",
      "question_type": "multiple_choice",
      "options": ["var", "let", "const", "All of the above"],
      "correct_answer": 3,
      "points": 10,
      "explanation": "JavaScript supports var, let, and const for variable declaration."
    }
  ]
}
```

### Get Quiz Statistics
Get statistics for quiz performance.

**Endpoint:** `GET /lessons/:lessonId/statistics`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "lesson_id": "lesson_123",
  "total_attempts": 45,
  "average_score": 78.5,
  "completion_rate": 85.2,
  "common_mistakes": [
    {
      "question_id": "q1",
      "mistake_count": 12,
      "description": "Confused variable declaration with function definition"
    }
  ]
}
```

---

## Student Management

### Get Students
Get list of students enrolled in your courses.

**Endpoint:** `GET /students`

**Headers:**
```
Authorization: Bearer <token>
X-Org-Id: <organization-id>
```

**Query Parameters:**
- `courseId` (optional): Filter by specific course
- `page` (optional): Page number for pagination
- `limit` (optional): Number of students per page

**Response:**
```json
{
  "students": [
    {
      "id": "student_123",
      "name": "John Doe",
      "email": "john@example.com",
      "enrolled_courses": [
        {
          "course_id": "course_456",
          "course_title": "Introduction to JavaScript",
          "enrollment_date": "2024-01-15T10:30:00Z",
          "progress_percentage": 75.5,
          "last_activity": "2024-01-20T14:30:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

## Analytics & Dashboard

### Instructor Overview
Get instructor analytics and course performance.

**Endpoint:** `GET /me/instructor/analytics`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "courses": [
    {
      "id": "course_123",
      "title": "Introduction to JavaScript",
      "student_count": 150,
      "rating": 4.8,
      "review_count": 45
    },
    {
      "id": "course_456",
      "title": "Advanced JavaScript",
      "student_count": 75,
      "rating": 4.9,
      "review_count": 23
    }
  ],
  "totalRevenue": 15750.00
}
```

### Course Progress Analytics
Get detailed progress analytics for a specific course.

**Endpoint:** `GET /courses/:courseId/progress`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "course_id": "course_123",
  "total_enrollments": 150,
  "completion_rate": 68.5,
  "average_progress": 75.2,
  "module_progress": [
    {
      "module_id": "module_1",
      "title": "Variables and Data Types",
      "completion_rate": 85.3,
      "average_time_spent": 45.5
    }
  ],
  "student_progress": [
    {
      "student_id": "student_123",
      "name": "John Doe",
      "progress_percentage": 80.5,
      "last_activity": "2024-01-20T14:30:00Z",
      "time_spent_minutes": 120
    }
  ]
}
```

---

## Certificate Management

### Create Certificate
Create a certificate for a completed course enrollment.

**Endpoint:** `POST /certificates/enrollment/:enrollmentId`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "template_id": "template_123",
  "issued_date": "2024-01-20T10:30:00Z",
  "metadata": {
    "grade": "A+",
    "completion_time": "2 weeks"
  }
}
```

### Get Certificate Templates
Get available certificate templates.

**Endpoint:** `GET /certificates/templates/list`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "templates": [
    {
      "id": "template_123",
      "name": "Modern Certificate",
      "description": "Clean, modern certificate design",
      "preview_url": "https://example.com/preview.jpg",
      "is_active": true
    }
  ]
}
```

### Create Certificate Template
Create a new certificate template.

**Endpoint:** `POST /certificates/templates`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Custom Certificate",
  "description": "Custom certificate design for our courses",
  "template_data": {
    "background_color": "#ffffff",
    "text_color": "#333333",
    "logo_url": "https://example.com/logo.png",
    "signature_url": "https://example.com/signature.png"
  }
}
```

---

## Reviews & Ratings

### List Course Reviews
Get reviews for a specific course.

**Endpoint:** `GET /courses/:courseId/reviews`

**Headers:**
```
Authorization: Bearer <token> (optional)
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Reviews per page
- `rating` (optional): Filter by rating (1-5)

**Response:**
```json
{
  "reviews": [
    {
      "id": "review_123",
      "student_name": "John Doe",
      "rating": 5,
      "comment": "Excellent course! Very well explained.",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  },
  "average_rating": 4.8,
  "total_reviews": 45
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

### Common Error Responses

**400 Bad Request:**
```json
{
  "errors": [
    {
      "field": "title",
      "message": "Title must be at least 3 characters long"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "message": "Course not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Internal server error"
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **General endpoints:** 100 requests per minute
- **File upload endpoints:** 10 requests per minute
- **Analytics endpoints:** 50 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Webhooks

Instructors can subscribe to webhooks for real-time notifications:

### Available Webhook Events
- `course.enrolled` - Student enrolls in course
- `course.completed` - Student completes course
- `lesson.completed` - Student completes lesson
- `quiz.submitted` - Student submits quiz
- `certificate.issued` - Certificate is issued
- `review.added` - New review is added

### Webhook Configuration
Configure webhooks in the instructor dashboard or via API:
```
POST /webhooks
{
  "url": "https://your-domain.com/webhook",
  "events": ["course.enrolled", "course.completed"],
  "secret": "your-webhook-secret"
}
```

---

## Best Practices

1. **Authentication:** Always include the JWT token in the Authorization header
2. **Organization Context:** Include the X-Org-Id header for multi-tenant operations
3. **Error Handling:** Check HTTP status codes and handle errors appropriately
4. **Pagination:** Use pagination parameters for large data sets
5. **Rate Limiting:** Implement exponential backoff for rate limit errors
6. **Data Validation:** Validate all input data before sending requests
7. **Security:** Never expose API keys or tokens in client-side code

---

## Support

For technical support or questions about the Instructor API:
- Email: support@example.com
- Documentation: https://docs.example.com
- Status Page: https://status.example.com
