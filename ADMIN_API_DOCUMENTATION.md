# Admin API Documentation

## Overview
This documentation covers all administrative API endpoints and features available in the platform. Admins have comprehensive control over users, content, system settings, analytics, and platform operations across all modules including e-commerce, e-learning, online classes, and more.

## Base URL
```
http://localhost:3000/api/admin
```

## Authentication
All admin endpoints require authentication and admin role. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Admin Roles & Permissions
- `admin`: Full platform access with all administrative privileges
- All admin actions are logged for audit purposes
- Emergency controls available for immediate response to issues

---

## Dashboard & Overview

### Get Dashboard Overview
Get comprehensive platform statistics and metrics.

**Endpoint:** `GET /dashboard/overview`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (optional): Time period for statistics (`7d`, `30d`, `90d`, `1y`) - Default: `30d`

**Response:**
```json
{
  "data": {
    "users": {
      "total": 1250,
      "active": 1180,
      "new_this_period": 45,
      "students": 800,
      "instructors": 120,
      "sellers": 200,
      "buyers": 150,
      "admins": 5
    },
    "ecommerce": {
      "total_cars": 350,
      "active_cars": 320,
      "pending_cars": 15,
      "sold_cars": 15,
      "new_this_period": 25
    },
    "elearning": {
      "total_courses": 85,
      "published_courses": 75,
      "new_this_period": 8
    },
    "online_classes": {
      "total_classes": 45,
      "live_classes": 5,
      "completed_classes": 35,
      "new_this_period": 3
    },
    "revenue": {
      "total_revenue": 125000.00,
      "this_period": 15000.00,
      "course_sales": 8000.00,
      "car_sales": 7000.00
    },
    "period": "30d",
    "generated_at": "2024-01-20T10:30:00Z"
  }
}
```

### Get Pending Alerts
Get alerts requiring admin attention.

**Endpoint:** `GET /dashboard/alerts`

**Response:**
```json
{
  "data": [
    {
      "type": "user_verification",
      "count": 12,
      "description": "Users pending email verification"
    },
    {
      "type": "content_moderation",
      "count": 5,
      "description": "Content items pending moderation"
    },
    {
      "type": "course_approval",
      "count": 3,
      "description": "Courses pending approval"
    }
  ]
}
```

### Get Recent Activity
Get recent platform activity for monitoring.

**Endpoint:** `GET /dashboard/activity/recent`

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 20)

**Response:**
```json
{
  "data": [
    {
      "activity_type": "user_registration",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "timestamp": "2024-01-20T09:30:00Z",
      "description": "User registered"
    },
    {
      "activity_type": "car_listing",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane@example.com",
      "timestamp": "2024-01-20T08:45:00Z",
      "description": "Listed car: Toyota Camry"
    }
  ]
}
```

---

## User Management

### Get All Users
Retrieve and filter users with comprehensive search capabilities.

**Endpoint:** `GET /users`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Users per page (default: 50, max: 100)
- `role` (optional): Filter by role (`student`, `instructor`, `buyer`, `seller`, `dealer`, `university`, `visa_officer`, `admin`, `advertiser`)
- `status` (optional): Filter by status (`active`, `inactive`, `all`) - Default: `active`
- `search` (optional): Search by name or email
- `sort_by` (optional): Sort field (`created_at`, `email`, `first_name`, `last_name`, `role`) - Default: `created_at`
- `sort_order` (optional): Sort order (`ASC`, `DESC`) - Default: `DESC`

**Response:**
```json
{
  "data": [
    {
      "id": "user_123",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1234567890",
      "role": "student",
      "is_active": true,
      "is_verified": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T14:30:00Z",
      "total_cars": 0,
      "total_enrollments": 3,
      "total_classes": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250
  }
}
```

### Create User
Create a new user account.

**Endpoint:** `POST /users`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "first_name": "New",
  "last_name": "User",
  "phone": "+1234567890",
  "role": "student",
  "is_active": true,
  "is_verified": false
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "data": {
    "user_id": "user_456",
    "email": "newuser@example.com",
    "role": "student"
  }
}
```

### Update User
Update user information.

**Endpoint:** `PATCH /users/:userId`

**Request Body:**
```json
{
  "first_name": "Updated",
  "last_name": "Name",
  "phone": "+0987654321",
  "role": "instructor",
  "is_active": true,
  "is_verified": true
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "data": {
    "user_id": "user_123"
  }
}
```

### Update User Status
Change user status (suspend, activate, deactivate).

**Endpoint:** `PATCH /users/:userId/status`

**Request Body:**
```json
{
  "action": "suspend",
  "reason": "Violation of terms of service",
  "duration": "30 days"
}
```

**Valid Actions:** `suspend`, `activate`, `deactivate`

**Response:**
```json
{
  "message": "User suspended",
  "data": {
    "user_id": "user_123",
    "is_active": false
  }
}
```

### Get User Activity
Get detailed activity logs for a specific user.

**Endpoint:** `GET /users/:userId/activity`

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 50)

**Response:**
```json
{
  "data": [
    {
      "activity_type": "login",
      "description": "User logged in",
      "timestamp": "2024-01-20T14:30:00Z",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0..."
    },
    {
      "activity_type": "course_enrollment",
      "description": "Enrolled in course: JavaScript Basics",
      "timestamp": "2024-01-19T10:15:00Z",
      "ip_address": null,
      "user_agent": null
    }
  ]
}
```

### Get User Sessions
Get active user sessions.

**Endpoint:** `GET /users/:userId/sessions`

**Response:**
```json
{
  "data": [
    {
      "id": "session_123",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2024-01-20T14:30:00Z",
      "last_activity": "2024-01-20T15:45:00Z",
      "is_active": true
    }
  ]
}
```

### Revoke User Sessions
Revoke all active sessions for a user.

**Endpoint:** `DELETE /users/:userId/sessions`

**Response:**
```json
{
  "message": "User sessions revoked successfully",
  "data": {
    "user_id": "user_123"
  }
}
```

---

## System Analytics

### Get System Analytics Overview
Get comprehensive system-wide analytics.

**Endpoint:** `GET /analytics/overview`

**Query Parameters:**
- `period` (optional): Time period (`7d`, `30d`, `90d`, `1y`) - Default: `30d`

**Response:**
```json
{
  "data": {
    "users": {
      "total": 1250,
      "active": 1180,
      "new_this_period": 45,
      "students": 800,
      "instructors": 120,
      "sellers": 200,
      "buyers": 150,
      "admins": 5
    },
    "ecommerce": {
      "total_cars": 350,
      "active_cars": 320,
      "pending_cars": 15,
      "sold_cars": 15,
      "new_this_period": 25
    },
    "elearning": {
      "total_courses": 85,
      "published_courses": 75,
      "new_this_period": 8
    },
    "online_classes": {
      "total_classes": 45,
      "live_classes": 5,
      "completed_classes": 35,
      "new_this_period": 3
    },
    "certificates": {
      "total_certificates": 120,
      "issued_certificates": 115,
      "new_this_period": 15
    },
    "revenue": {
      "total_revenue": 125000.00,
      "this_period": 15000.00,
      "course_sales": 8000.00,
      "car_sales": 7000.00
    },
    "period": "30d",
    "generated_at": "2024-01-20T10:30:00Z"
  }
}
```

### Get E-commerce Analytics
Get detailed e-commerce metrics and statistics.

**Endpoint:** `GET /analytics/ecommerce`

**Query Parameters:**
- `period` (optional): Time period (`7d`, `30d`, `90d`, `1y`) - Default: `30d`

**Response:**
```json
{
  "data": {
    "total_cars": 350,
    "active_cars": 320,
    "pending_cars": 15,
    "sold_cars": 15,
    "new_this_period": 25,
    "avg_car_price": 25000.00,
    "max_car_price": 75000.00,
    "min_car_price": 5000.00,
    "total_sales": 15,
    "new_listings": 25,
    "period": "30d",
    "generated_at": "2024-01-20T10:30:00Z"
  }
}
```

### Get E-learning Analytics
Get detailed e-learning metrics and statistics.

**Endpoint:** `GET /analytics/elearning`

**Query Parameters:**
- `period` (optional): Time period (`7d`, `30d`, `90d`, `1y`) - Default: `30d`

**Response:**
```json
{
  "data": {
    "total_courses": 85,
    "published_courses": 75,
    "new_this_period": 8,
    "avg_course_rating": 4.6,
    "highly_rated_courses": 65,
    "new_courses": 8,
    "active_instructors": 45,
    "period": "30d",
    "generated_at": "2024-01-20T10:30:00Z"
  }
}
```

### Get Online Classes Analytics
Get detailed online classes metrics and statistics.

**Endpoint:** `GET /analytics/online-classes`

**Query Parameters:**
- `period` (optional): Time period (`7d`, `30d`, `90d`, `1y`) - Default: `30d`

**Response:**
```json
{
  "data": {
    "total_classes": 45,
    "live_classes": 5,
    "completed_classes": 35,
    "new_this_period": 3,
    "active_instructors": 12,
    "avg_class_price": 150.00,
    "new_classes": 3,
    "currently_live": 5,
    "period": "30d",
    "generated_at": "2024-01-20T10:30:00Z"
  }
}
```

### Get Certificate Analytics
Get detailed certificate metrics and statistics.

**Endpoint:** `GET /analytics/certificates`

**Query Parameters:**
- `period` (optional): Time period (`7d`, `30d`, `90d`, `1y`) - Default: `30d`

**Response:**
```json
{
  "data": {
    "total_certificates": 120,
    "issued_certificates": 115,
    "new_this_period": 15,
    "unique_certificate_holders": 110,
    "new_certificates": 15,
    "total_issued": 115,
    "period": "30d",
    "generated_at": "2024-01-20T10:30:00Z"
  }
}
```

---

## Content Moderation

### Get Flagged Content
Get content that has been flagged for review.

**Endpoint:** `GET /content/flagged`

**Query Parameters:**
- `type` (optional): Content type (`all`, `cars`, `courses`, `reviews`, `messages`) - Default: `all`
- `status` (optional): Flag status (`pending`, `reviewed`, `resolved`) - Default: `pending`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "data": {
    "cars": [
      {
        "id": "car_123",
        "title": "Suspicious Car Listing",
        "reason": "Inappropriate content",
        "flagged_by": "user_456",
        "flagged_at": "2024-01-20T10:30:00Z",
        "status": "pending"
      }
    ],
    "courses": [],
    "reviews": [],
    "messages": []
  }
}
```

### Moderate Content
Take moderation action on flagged content.

**Endpoint:** `PATCH /content/:contentId/moderate`

**Request Body:**
```json
{
  "action": "approve",
  "reason": "Content meets platform standards",
  "moderator_notes": "No violations found after review"
}
```

**Valid Actions:** `approve`, `reject`, `flag`, `remove`

**Response:**
```json
{
  "message": "Content moderated successfully",
  "data": {
    "content_id": "content_123",
    "action": "approve"
  }
}
```

### Remove Content
Remove inappropriate or violating content.

**Endpoint:** `DELETE /content/:contentId`

**Request Body:**
```json
{
  "reason": "Violation of community guidelines"
}
```

**Response:**
```json
{
  "message": "Content removed successfully",
  "data": {
    "content_id": "content_123"
  }
}
```

---

## System Configuration

### Get System Settings
Get current system configuration settings.

**Endpoint:** `GET /settings`

**Response:**
```json
{
  "data": {
    "max_file_size": "10MB",
    "auto_approve_courses": false,
    "require_email_verification": true,
    "maintenance_mode": false,
    "registration_enabled": true,
    "max_users_per_org": 1000
  }
}
```

### Update System Settings
Update system configuration settings.

**Endpoint:** `PATCH /settings`

**Request Body:**
```json
{
  "max_file_size": "15MB",
  "auto_approve_courses": true,
  "require_email_verification": false,
  "maintenance_mode": false,
  "registration_enabled": true,
  "max_users_per_org": 2000
}
```

**Response:**
```json
{
  "message": "System settings updated successfully",
  "data": {
    "max_file_size": "15MB",
    "auto_approve_courses": true,
    "require_email_verification": false,
    "maintenance_mode": false,
    "registration_enabled": true,
    "max_users_per_org": 2000
  }
}
```

### Get Feature Flags
Get all feature flags and their current status.

**Endpoint:** `GET /feature-flags`

**Response:**
```json
{
  "data": [
    {
      "id": "flag_123",
      "name": "new_dashboard",
      "description": "Enable new dashboard interface",
      "is_enabled": true,
      "target_percentage": 100,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T14:30:00Z"
    },
    {
      "id": "flag_456",
      "name": "advanced_search",
      "description": "Enable advanced search functionality",
      "is_enabled": false,
      "target_percentage": 50,
      "created_at": "2024-01-10T09:15:00Z",
      "updated_at": "2024-01-18T16:45:00Z"
    }
  ]
}
```

### Update Feature Flag
Update a specific feature flag.

**Endpoint:** `PATCH /feature-flags/:flagId`

**Request Body:**
```json
{
  "is_enabled": true,
  "target_percentage": 75,
  "description": "Updated description for feature flag"
}
```

**Response:**
```json
{
  "message": "Feature flag updated successfully",
  "data": {
    "flag_id": "flag_123"
  }
}
```

---

## Audit & Logging

### Get Audit Logs
Get comprehensive audit logs of admin actions.

**Endpoint:** `GET /audit-logs`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Logs per page (default: 50, max: 100)
- `action_type` (optional): Filter by action type
- `admin_id` (optional): Filter by admin ID
- `start_date` (optional): Start date filter (ISO format)
- `end_date` (optional): End date filter (ISO format)

**Response:**
```json
{
  "data": [
    {
      "id": "log_123",
      "admin_id": "admin_456",
      "action": "update_user_status",
      "details": {
        "user_id": "user_789",
        "action": "suspend",
        "reason": "Terms violation"
      },
      "created_at": "2024-01-20T14:30:00Z",
      "first_name": "Admin",
      "last_name": "User",
      "email": "admin@example.com"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250
  }
}
```

### Get User Activity Logs
Get detailed activity logs for a specific user.

**Endpoint:** `GET /user-activity/:userId`

**Query Parameters:**
- `limit` (optional): Number of logs to return (default: 100)

**Response:**
```json
{
  "data": [
    {
      "id": "activity_123",
      "user_id": "user_456",
      "activity_type": "login",
      "description": "User logged in",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2024-01-20T14:30:00Z",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    }
  ]
}
```

### Get System Events
Get system events and alerts.

**Endpoint:** `GET /system-events`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Events per page (default: 50, max: 100)
- `event_type` (optional): Filter by event type
- `severity` (optional): Filter by severity (`info`, `warning`, `error`, `critical`)
- `start_date` (optional): Start date filter (ISO format)
- `end_date` (optional): End date filter (ISO format)

**Response:**
```json
{
  "data": [
    {
      "id": "event_123",
      "event_type": "system_error",
      "severity": "error",
      "message": "Database connection timeout",
      "details": {
        "error_code": "DB_TIMEOUT",
        "retry_count": 3
      },
      "created_at": "2024-01-20T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 45
  }
}
```

---

## Emergency Controls

### Emergency Suspend User
Immediately suspend a user account.

**Endpoint:** `POST /emergency/suspend-user`

**Request Body:**
```json
{
  "user_id": "user_123",
  "reason": "Immediate security threat detected",
  "duration": "Indefinite"
}
```

**Response:**
```json
{
  "message": "User emergency suspended",
  "data": {
    "user_id": "user_123",
    "reason": "Immediate security threat detected",
    "duration": "Indefinite"
  }
}
```

### Emergency Remove Content
Immediately remove content from the platform.

**Endpoint:** `POST /emergency/remove-content`

**Request Body:**
```json
{
  "content_id": "content_123",
  "content_type": "car",
  "reason": "Illegal content detected"
}
```

**Valid Content Types:** `car`, `course`, `review`, `message`, `user`

**Response:**
```json
{
  "message": "Content emergency removed",
  "data": {
    "content_id": "content_123",
    "content_type": "car",
    "reason": "Illegal content detected"
  }
}
```

### Toggle Maintenance Mode
Enable or disable maintenance mode for the platform.

**Endpoint:** `PATCH /maintenance-mode`

**Request Body:**
```json
{
  "enabled": true,
  "message": "Scheduled maintenance in progress. We'll be back shortly.",
  "estimated_duration": "2 hours"
}
```

**Response:**
```json
{
  "message": "Maintenance mode enabled",
  "data": {
    "enabled": true,
    "message": "Scheduled maintenance in progress. We'll be back shortly."
  }
}
```

---

## Bulk Operations

### Bulk Update User Status
Update status for multiple users at once.

**Endpoint:** `POST /bulk/users/update-status`

**Request Body:**
```json
{
  "user_ids": ["user_123", "user_456", "user_789"],
  "action": "suspend",
  "reason": "Bulk suspension for policy violation"
}
```

**Valid Actions:** `suspend`, `activate`, `deactivate`, `verify`, `unverify`

**Response:**
```json
{
  "message": "Bulk suspend completed for 3 users",
  "data": {
    "user_ids": ["user_123", "user_456", "user_789"],
    "action": "suspend",
    "count": 3
  }
}
```

### Bulk Moderate Content
Moderate multiple content items at once.

**Endpoint:** `POST /bulk/content/moderate`

**Request Body:**
```json
{
  "content_ids": ["content_123", "content_456"],
  "action": "approve",
  "reason": "Bulk approval after review",
  "moderator_notes": "All items meet platform standards"
}
```

**Valid Actions:** `approve`, `reject`, `flag`, `remove`

**Response:**
```json
{
  "message": "Bulk moderation completed for 2 content items",
  "data": {
    "content_ids": ["content_123", "content_456"],
    "action": "approve",
    "count": 2
  }
}
```

### Send Bulk Notifications
Send notifications to multiple users.

**Endpoint:** `POST /bulk/notifications/send`

**Request Body:**
```json
{
  "user_ids": ["user_123", "user_456", "user_789"],
  "title": "Platform Update",
  "message": "We've released new features. Check them out!",
  "notification_type": "admin_announcement",
  "channels": ["email", "in_app"],
  "priority": "medium"
}
```

**Valid Notification Types:** `info`, `warning`, `error`, `success`
**Valid Priorities:** `low`, `medium`, `high`, `urgent`
**Valid Channels:** `email`, `in_app`, `sms`, `push`

**Response:**
```json
{
  "message": "Bulk notifications sent to 3 users",
  "data": {
    "user_ids": ["user_123", "user_456", "user_789"],
    "title": "Platform Update",
    "notification_type": "admin_announcement",
    "count": 3
  }
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
      "field": "email",
      "message": "Valid email is required"
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
  "message": "Admin access required"
}
```

**404 Not Found:**
```json
{
  "message": "User not found"
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

Admin API endpoints have higher rate limits than regular user endpoints:

- **General admin endpoints:** 200 requests per minute
- **Analytics endpoints:** 100 requests per minute
- **Bulk operations:** 20 requests per minute
- **Emergency controls:** 10 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 195
X-RateLimit-Reset: 1640995200
```

---

## Security Considerations

1. **Authentication:** All admin endpoints require valid JWT tokens
2. **Authorization:** Admin role verification on every request
3. **Audit Logging:** All admin actions are logged with timestamps and details
4. **Input Validation:** Comprehensive validation on all inputs
5. **Rate Limiting:** Strict rate limits to prevent abuse
6. **Emergency Controls:** Immediate response capabilities for security incidents

---

## Best Practices

1. **Authentication:** Always include the JWT token in the Authorization header
2. **Error Handling:** Check HTTP status codes and handle errors appropriately
3. **Pagination:** Use pagination parameters for large data sets
4. **Rate Limiting:** Implement exponential backoff for rate limit errors
5. **Data Validation:** Validate all input data before sending requests
6. **Security:** Never expose admin tokens in client-side code
7. **Audit Trail:** All admin actions are automatically logged
8. **Emergency Response:** Use emergency controls only for immediate threats

---

## Security Questions Management

### Get Available Security Questions
Get all available security questions for user setup.

**Endpoint:** `GET /security-questions`

**Response:**
```json
{
  "data": [
    {
      "id": "question_123",
      "question_text": "What is your mother's maiden name?",
      "category": "family"
    },
    {
      "id": "question_456",
      "question_text": "What was the name of your first pet?",
      "category": "childhood"
    }
  ]
}
```

### Get Security Questions by Category
Get security questions filtered by category.

**Endpoint:** `GET /security-questions/category/:category`

**Valid Categories:** `personal`, `family`, `childhood`, `education`, `work`, `location`, `preference`

**Response:**
```json
{
  "data": [
    {
      "id": "question_123",
      "question_text": "What is your mother's maiden name?",
      "category": "family"
    }
  ]
}
```

### Get User's Security Questions
Get security questions set up by a specific user (admin only).

**Endpoint:** `GET /users/:userId/security-questions`

**Response:**
```json
{
  "data": [
    {
      "id": "user_question_123",
      "question_text": "What is your mother's maiden name?",
      "category": "family"
    }
  ]
}
```

### Delete User's Security Questions
Remove all security questions for a user (admin only).

**Endpoint:** `DELETE /users/:userId/security-questions`

**Response:**
```json
{
  "message": "Security questions deleted successfully"
}
```

---

## Password Reset Management

### Get Password Reset Options
Get available password reset methods for a user.

**Endpoint:** `GET /password-reset/options/:email`

**Response:**
```json
{
  "data": {
    "options": [
      {
        "method": "security_questions",
        "name": "Security Questions",
        "description": "Answer your security questions to reset your password"
      },
      {
        "method": "email",
        "name": "Email Reset",
        "description": "Receive a password reset link via email"
      }
    ]
  }
}
```

### Initiate Password Reset
Start the password reset process with security questions.

**Endpoint:** `POST /password-reset/initiate`

**Request Body:**
```json
{
  "email": "user@example.com",
  "answers": [
    {
      "questionId": "question_123",
      "answer": "Smith"
    },
    {
      "questionId": "question_456",
      "answer": "Fluffy"
    }
  ]
}
```

**Response:**
```json
{
  "data": {
    "resetToken": "abc123def456",
    "expiresAt": "2024-01-20T15:30:00Z",
    "message": "Security questions verified. You can now reset your password."
  }
}
```

### Reset Password
Complete password reset using the token from security questions verification.

**Endpoint:** `POST /password-reset/reset`

**Request Body:**
```json
{
  "token": "abc123def456",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

### Verify Reset Token
Check if a password reset token is valid.

**Endpoint:** `GET /password-reset/verify/:token`

**Response:**
```json
{
  "data": {
    "valid": true,
    "email": "user@example.com"
  }
}
```

---

## Support

For technical support or questions about the Admin API:
- Email: admin-support@example.com
- Documentation: https://docs.example.com/admin-api
- Status Page: https://status.example.com
- Emergency Contact: emergency@example.com
