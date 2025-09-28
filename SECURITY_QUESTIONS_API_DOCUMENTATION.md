# Security Questions API Documentation

## Overview
This documentation covers the Security Questions API endpoints that allow users to set up and use security questions for password reset, similar to Microsoft Windows security questions functionality.

## Base URL
```
http://localhost:3000/api/security-questions
```

## Authentication
Some endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Public Endpoints (No Authentication Required)

### Get Available Security Questions
Get all available security questions that users can choose from.

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
    },
    {
      "id": "question_789",
      "question_text": "What city were you born in?",
      "category": "location"
    }
  ],
  "message": "Security questions retrieved successfully"
}
```

### Get Security Questions by Category
Get security questions filtered by a specific category.

**Endpoint:** `GET /security-questions/category/:category`

**Path Parameters:**
- `category` (required): Category to filter by

**Valid Categories:**
- `personal` - Personal information questions
- `family` - Family-related questions
- `childhood` - Childhood memories
- `education` - Educational background
- `work` - Work experience
- `location` - Location-based questions
- `preference` - Personal preferences

**Example Request:**
```
GET /security-questions/category/family
```

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
      "id": "question_124",
      "question_text": "What is your father's middle name?",
      "category": "family"
    }
  ],
  "message": "Security questions retrieved successfully"
}
```

### Get Security Questions for Password Reset
Get a user's security questions for password reset (public endpoint).

**Endpoint:** `GET /security-questions/reset/:email`

**Path Parameters:**
- `email` (required): User's email address

**Response:**
```json
{
  "data": [
    {
      "id": "user_question_123",
      "question_text": "What is your mother's maiden name?",
      "category": "family"
    },
    {
      "id": "user_question_456",
      "question_text": "What was the name of your first pet?",
      "category": "childhood"
    }
  ],
  "message": "Security questions retrieved successfully"
}
```

**Error Response (No Questions Set Up):**
```json
{
  "message": "No security questions set up for this account"
}
```

### Verify Security Questions for Password Reset
Verify security question answers to initiate password reset.

**Endpoint:** `POST /security-questions/verify`

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

**Response (Success):**
```json
{
  "data": {
    "resetToken": "abc123def456ghi789",
    "expiresAt": "2024-01-20T15:30:00Z"
  },
  "message": "Security questions verified successfully. You can now reset your password."
}
```

**Response (Failure):**
```json
{
  "message": "Incorrect answers provided. Please try again.",
  "correctAnswers": 1,
  "requiredCorrect": 2
}
```

---

## Protected Endpoints (Authentication Required)

### Set Up Security Questions
Set up security questions for the authenticated user.

**Endpoint:** `POST /security-questions/setup`

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
      "questionId": "question_123",
      "answer": "Smith"
    },
    {
      "questionId": "question_456",
      "answer": "Fluffy"
    },
    {
      "questionId": "question_789",
      "answer": "New York"
    }
  ]
}
```

**Validation Rules:**
- Minimum 3 questions required
- Maximum 5 questions allowed
- Each answer must be at least 2 characters long
- No duplicate questions allowed

**Response:**
```json
{
  "data": {
    "message": "Security questions set up successfully"
  },
  "message": "Security questions set up successfully"
}
```

### Get User's Security Questions
Get the authenticated user's security questions (without answers).

**Endpoint:** `GET /security-questions/user`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "user_question_123",
      "question_text": "What is your mother's maiden name?",
      "category": "family"
    },
    {
      "id": "user_question_456",
      "question_text": "What was the name of your first pet?",
      "category": "childhood"
    }
  ],
  "message": "User security questions retrieved successfully"
}
```

### Check Security Questions Status
Check if the authenticated user has security questions set up.

**Endpoint:** `GET /security-questions/check`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "hasQuestions": true
  },
  "message": "Security questions status retrieved successfully"
}
```

### Delete Security Questions
Delete all security questions for the authenticated user.

**Endpoint:** `DELETE /security-questions/user`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "message": "Security questions deleted successfully"
  },
  "message": "Security questions deleted successfully"
}
```

### Update Security Question Answer
Update a specific security question answer for the authenticated user.

**Endpoint:** `PATCH /security-questions/user/:questionId`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
- `questionId` (required): ID of the security question to update

**Request Body:**
```json
{
  "answer": "New Answer"
}
```

**Response:**
```json
{
  "data": {
    "message": "Security question updated successfully"
  },
  "message": "Security question updated successfully"
}
```

---

## Password Reset Integration

### Password Reset Flow with Security Questions

1. **Get Reset Options**
   ```
   GET /api/password-reset/options/user@example.com
   ```

2. **Get Security Questions** (if security questions method is available)
   ```
   GET /api/security-questions/reset/user@example.com
   ```

3. **Verify Security Questions**
   ```
   POST /api/security-questions/verify
   {
     "email": "user@example.com",
     "answers": [...]
   }
   ```

4. **Reset Password**
   ```
   POST /api/password-reset/reset
   {
     "token": "reset_token_from_step_3",
     "newPassword": "newSecurePassword123"
   }
   ```

---

## Security Features

### Answer Hashing
- All security question answers are hashed using bcrypt with salt rounds of 12
- Answers are converted to lowercase and trimmed before hashing
- Original answers are never stored in the database

### Verification Logic
- Users must answer at least 60% of their security questions correctly
- Verification is case-insensitive
- Answers are trimmed of whitespace before comparison

### Token Management
- Reset tokens are generated using crypto.randomBytes(32)
- Tokens expire after 15 minutes
- Tokens are cleared after successful password reset

### Rate Limiting
- Security question verification attempts are rate-limited
- Failed attempts are logged for security monitoring

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "message": "At least 3 security questions are required"
}
```

**401 Unauthorized:**
```json
{
  "message": "Authentication required"
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
  "message": "Failed to setup security questions: Database connection error"
}
```

---

## Best Practices

1. **Setup Process:**
   - Encourage users to set up security questions during registration
   - Provide clear instructions on answer format
   - Suggest memorable but not easily guessable answers

2. **Security:**
   - Never store answers in plain text
   - Use strong hashing algorithms
   - Implement rate limiting on verification attempts
   - Log security events for monitoring

3. **User Experience:**
   - Provide clear error messages
   - Allow users to update their answers
   - Offer alternative reset methods (email) as fallback

4. **Questions Selection:**
   - Choose questions from different categories
   - Avoid questions with easily researchable answers
   - Provide a good variety of question types

---

## Support

For technical support or questions about the Security Questions API:
- Email: support@example.com
- Documentation: https://docs.example.com/security-questions
- Status Page: https://status.example.com
