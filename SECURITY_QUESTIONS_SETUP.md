# Security Questions Setup Guide

## Overview
This guide explains how to set up and use the Security Questions feature for password reset, similar to Microsoft Windows security questions functionality.

## Features
- **Predefined Questions**: 30+ security questions across 7 categories
- **Secure Storage**: Answers are hashed using bcrypt
- **Flexible Setup**: Users can choose 3-5 questions
- **Password Reset**: Alternative to email-based password reset
- **Admin Management**: Admins can view and manage user security questions

## Database Setup

### 1. Run Migration
Execute the migration script to create the necessary tables:

```sql
-- Run this SQL script in your database
source server/db/migrations/add_security_questions.sql
```

### 2. Verify Tables Created
The migration creates two new tables:
- `security_questions` - Stores predefined questions
- `user_security_questions` - Stores user's selected questions and hashed answers

## API Endpoints

### Public Endpoints (No Authentication)
- `GET /api/security-questions` - Get all available questions
- `GET /api/security-questions/category/:category` - Get questions by category
- `GET /api/security-questions/reset/:email` - Get user's questions for reset
- `POST /api/security-questions/verify` - Verify answers for password reset

### Protected Endpoints (Authentication Required)
- `POST /api/security-questions/setup` - Set up security questions
- `GET /api/security-questions/user` - Get user's questions
- `GET /api/security-questions/check` - Check if user has questions set up
- `DELETE /api/security-questions/user` - Delete user's questions
- `PATCH /api/security-questions/user/:questionId` - Update specific answer

### Password Reset Endpoints
- `GET /api/password-reset/options/:email` - Get reset options
- `POST /api/password-reset/initiate` - Start password reset process
- `POST /api/password-reset/reset` - Complete password reset
- `GET /api/password-reset/verify/:token` - Verify reset token

## Usage Examples

### 1. Set Up Security Questions (User)

```javascript
// Get available questions
const response = await fetch('/api/security-questions');
const questions = await response.json();

// Set up security questions
const setupResponse = await fetch('/api/security-questions/setup', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + userToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    questions: [
      {
        questionId: 'question_123',
        answer: 'Smith'
      },
      {
        questionId: 'question_456',
        answer: 'Fluffy'
      },
      {
        questionId: 'question_789',
        answer: 'New York'
      }
    ]
  })
});
```

### 2. Password Reset Flow

```javascript
// Step 1: Get reset options
const optionsResponse = await fetch('/api/password-reset/options/user@example.com');
const options = await optionsResponse.json();

// Step 2: Get security questions (if available)
if (options.data.options.some(opt => opt.method === 'security_questions')) {
  const questionsResponse = await fetch('/api/security-questions/reset/user@example.com');
  const questions = await questionsResponse.json();
  
  // Step 3: Verify answers
  const verifyResponse = await fetch('/api/security-questions/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      answers: [
        { questionId: 'question_123', answer: 'Smith' },
        { questionId: 'question_456', answer: 'Fluffy' }
      ]
    })
  });
  
  const verifyResult = await verifyResponse.json();
  
  // Step 4: Reset password
  if (verifyResult.data.resetToken) {
    const resetResponse = await fetch('/api/password-reset/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: verifyResult.data.resetToken,
        newPassword: 'newSecurePassword123'
      })
    });
  }
}
```

### 3. Admin Management

```javascript
// Get user's security questions (admin)
const userQuestionsResponse = await fetch('/api/users/user_123/security-questions', {
  headers: { 'Authorization': 'Bearer ' + adminToken }
});

// Delete user's security questions (admin)
const deleteResponse = await fetch('/api/users/user_123/security-questions', {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer ' + adminToken }
});
```

## Security Considerations

### 1. Answer Hashing
- All answers are hashed using bcrypt with 12 salt rounds
- Answers are converted to lowercase and trimmed before hashing
- Original answers are never stored in the database

### 2. Verification Logic
- Users must answer at least 60% of their security questions correctly
- Verification is case-insensitive
- Failed attempts are logged for security monitoring

### 3. Token Security
- Reset tokens are generated using crypto.randomBytes(32)
- Tokens expire after 15 minutes
- Tokens are cleared after successful password reset

### 4. Rate Limiting
- Security question verification attempts are rate-limited
- Implement exponential backoff for failed attempts

## Question Categories

The system includes 30+ predefined questions across 7 categories:

### Family (4 questions)
- What is your mother's maiden name?
- What is your father's middle name?
- What is your oldest sibling's middle name?
- What is your youngest sibling's first name?

### Childhood (5 questions)
- What was the name of your first pet?
- What was the name of your childhood best friend?
- What was the name of the street you grew up on?
- What was the name of your elementary school?
- What was the name of your high school?

### Personal Preferences (10 questions)
- What is your favorite color?
- What is your favorite food?
- What is your favorite movie?
- What is your favorite book?
- What is your favorite song?
- What is your favorite hobby?
- What is your favorite sport?
- What is your favorite season?
- What is your favorite holiday?
- What is your favorite animal?

### Education (4 questions)
- What was the name of your college or university?
- What was your major in college?
- What was the name of your first teacher?
- What was the name of your favorite teacher?

### Work (3 questions)
- What was your first job?
- What was the name of your first boss?
- What was the name of your first company?

### Location (4 questions)
- What city were you born in?
- What state or province were you born in?
- What country were you born in?
- What is your favorite vacation destination?

### Personal Details (4 questions)
- What was your first car?
- What is your grandmother's first name?
- What is your grandfather's first name?
- What is your aunt's first name?

## Frontend Integration

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';

const SecurityQuestionsSetup = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    // Load available questions
    fetch('/api/security-questions')
      .then(res => res.json())
      .then(data => setQuestions(data.data));
  }, []);

  const handleSetup = async () => {
    if (selectedQuestions.length < 3) {
      alert('Please select at least 3 questions');
      return;
    }

    const questionsData = selectedQuestions.map(qId => ({
      questionId: qId,
      answer: answers[qId]
    }));

    try {
      const response = await fetch('/api/security-questions/setup', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + userToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ questions: questionsData })
      });

      if (response.ok) {
        alert('Security questions set up successfully!');
      }
    } catch (error) {
      alert('Error setting up security questions');
    }
  };

  return (
    <div>
      <h2>Set Up Security Questions</h2>
      <p>Select 3-5 questions and provide answers:</p>
      
      {questions.map(question => (
        <div key={question.id}>
          <label>
            <input
              type="checkbox"
              checked={selectedQuestions.includes(question.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedQuestions([...selectedQuestions, question.id]);
                } else {
                  setSelectedQuestions(selectedQuestions.filter(id => id !== question.id));
                  delete answers[question.id];
                }
              }}
            />
            {question.question_text}
          </label>
          
          {selectedQuestions.includes(question.id) && (
            <input
              type="text"
              placeholder="Your answer"
              value={answers[question.id] || ''}
              onChange={(e) => setAnswers({
                ...answers,
                [question.id]: e.target.value
              })}
            />
          )}
        </div>
      ))}
      
      <button onClick={handleSetup}>Set Up Security Questions</button>
    </div>
  );
};

export default SecurityQuestionsSetup;
```

## Testing

### Test Cases

1. **Setup Tests**
   - Test setting up 3 questions (minimum)
   - Test setting up 5 questions (maximum)
   - Test validation for duplicate questions
   - Test validation for empty answers

2. **Verification Tests**
   - Test correct answers (should pass)
   - Test incorrect answers (should fail)
   - Test partial correct answers (60% rule)
   - Test case insensitivity

3. **Password Reset Tests**
   - Test complete password reset flow
   - Test token expiration
   - Test invalid tokens

### Sample Test Data

```javascript
// Test user setup
const testQuestions = [
  { questionId: 'question_123', answer: 'Smith' },
  { questionId: 'question_456', answer: 'Fluffy' },
  { questionId: 'question_789', answer: 'New York' }
];

// Test verification
const testAnswers = [
  { questionId: 'question_123', answer: 'smith' }, // Case insensitive
  { questionId: 'question_456', answer: 'Fluffy' }
];
```

## Troubleshooting

### Common Issues

1. **"No security questions set up"**
   - User needs to set up security questions first
   - Check if user completed the setup process

2. **"Incorrect answers provided"**
   - User needs to answer at least 60% correctly
   - Check for typos in answers
   - Verify case insensitivity

3. **"Invalid or expired reset token"**
   - Token expires after 15 minutes
   - User needs to restart the reset process

4. **Database connection errors**
   - Ensure migration was run successfully
   - Check database connection configuration

## Support

For technical support or questions:
- Email: support@example.com
- Documentation: https://docs.example.com/security-questions
- Status Page: https://status.example.com
