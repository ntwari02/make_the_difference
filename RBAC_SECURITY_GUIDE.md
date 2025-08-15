# Role-Based Access Control (RBAC) Security System

## Overview

This document describes the comprehensive RBAC security system implemented for the scholarship management application. The system provides secure authentication, authorization, and access control with multiple layers of security.

## Security Features

### 1. Input Validation & Sanitization
- **Client-side validation**: Real-time validation using JavaScript
- **Server-side validation**: Express-validator middleware for all inputs
- **Input sanitization**: XSS prevention through HTML entity encoding
- **SQL injection prevention**: Parameterized queries throughout the application

### 2. Authentication Security
- **JWT tokens**: Secure token-based authentication
- **Password hashing**: bcrypt with high cost factor (12 rounds)
- **Rate limiting**: 5 attempts per 15 minutes for login
- **Session management**: Secure session handling with timeout
- **CSRF protection**: Token-based CSRF prevention

### 3. Role-Based Access Control (RBAC)
- **Role hierarchy**: super_admin > admin > moderator > user
- **Permission-based access**: Granular permissions for different operations
- **Default deny policy**: Access denied unless explicitly granted
- **Least privilege principle**: Users get minimum required permissions

### 4. Security Middleware
- **Helmet**: Security headers
- **Custom XSS protection**: Cross-site scripting prevention using custom middleware
- **HPP protection**: HTTP parameter pollution prevention
- **Rate limiting**: Request throttling per IP

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    status ENUM('active', 'inactive') DEFAULT 'active',
    security_questions_setup BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(255) NULL,
    reset_token_expiry DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    locked_until DATETIME NULL
);
```

### Admin Users Table
```sql
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    admin_level ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Permission System

### Available Permissions
```javascript
const permissions = {
    // User Management
    can_manage_users: true,
    can_view_users: true,
    can_create_users: true,
    can_edit_users: true,
    can_delete_users: true,
    
    // Application Management
    can_manage_applications: true,
    can_view_applications: true,
    can_approve_applications: true,
    can_reject_applications: true,
    
    // Scholarship Management
    can_manage_scholarships: true,
    can_view_scholarships: true,
    can_create_scholarships: true,
    can_edit_scholarships: true,
    can_delete_scholarships: true,
    
    // System Administration
    can_access_dashboard: true,
    can_view_reports: true,
    can_export_data: true,
    can_manage_settings: true,
    
    // Security
    can_view_audit_logs: true,
    can_manage_security: true
};
```

## API Endpoints

### Authentication Endpoints
- `POST /auth/login` - User login with validation
- `POST /auth/register` - User registration
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset

### Admin Endpoints (Protected)
- `GET /admin/dashboard` - Dashboard statistics
- `GET /admin/users` - List users (requires `can_manage_users`)
- `POST /admin/users` - Create user (requires `can_manage_users`)
- `PUT /admin/users/:id` - Update user (requires `can_manage_users`)
- `DELETE /admin/users/:id` - Delete user (requires `can_manage_users`)
- `GET /admin/applications` - List applications (requires `can_view_applications`)
- `PUT /admin/applications/:id/status` - Update application status (requires `can_manage_applications`)
- `GET /admin/audit-log` - View audit logs (requires super_admin)
- `GET /admin/security-settings` - View security settings (requires super_admin)
- `GET /admin/health` - Health check

## Security Best Practices

### 1. Password Policy
- Minimum 8 characters
- Must contain uppercase, lowercase, and numbers
- Optional special characters
- Regular password rotation recommended

### 2. Session Management
- JWT tokens with 24-hour expiration
- Automatic session timeout after 30 minutes of inactivity
- Secure token storage in localStorage
- CSRF token validation

### 3. Input Validation Rules
```javascript
// Email validation
body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')

// Password validation
body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and numbers')

// Name validation
body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces')
```

### 4. File Upload Security
- File type validation (images, PDFs, documents only)
- File size limits (5MB maximum)
- Secure file naming with timestamps
- Sanitized file paths

### 5. Error Handling
- Generic error messages (no sensitive information)
- Structured error responses with codes
- Comprehensive logging for security events
- Rate limiting on error endpoints

## Frontend Security

### 1. Input Sanitization
```javascript
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    return input.trim()
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/[&]/g, '&amp;') // Escape ampersands
        .replace(/["]/g, '&quot;') // Escape quotes
        .replace(/[']/g, '&#x27;') // Escape apostrophes
        .replace(/[/]/g, '&#x2F;'); // Escape forward slashes
};
```

### 2. Rate Limiting
```javascript
const rateLimit = {
    attempts: 0,
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    
    check: function() {
        // Implementation for rate limiting
    }
};
```

### 3. Session Management
```javascript
const session = {
    create: function(userData, token) {
        // Create secure session
    },
    
    isValid: function() {
        // Check session validity
    },
    
    destroy: function() {
        // Clean up session data
    }
};
```

## Security Monitoring

### 1. Audit Logging
- All admin actions are logged
- Failed login attempts are tracked
- Permission violations are recorded
- File access is monitored

### 2. Security Headers
```javascript
// Helmet configuration
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
```

### 3. Error Monitoring
- Structured error logging
- Security event alerts
- Performance monitoring
- Database query logging

## Deployment Security

### 1. Environment Variables
```bash
# Required environment variables
JWT_SECRET=your-super-secure-jwt-secret
DB_HOST=localhost
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
NODE_ENV=production
```

### 2. Production Checklist
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Error logging configured
- [ ] Database backups scheduled
- [ ] SSL certificates valid
- [ ] Firewall rules configured

### 3. Regular Security Audits
- Monthly permission reviews
- Quarterly security assessments
- Annual penetration testing
- Continuous vulnerability scanning

## Troubleshooting

### Common Issues

1. **Login Rate Limiting**
   - Clear browser localStorage
   - Wait 15 minutes for lockout to expire
   - Check network connectivity

2. **Permission Denied Errors**
   - Verify user has required permissions
   - Check admin level hierarchy
   - Review role assignments

3. **Session Expired**
   - Re-authenticate user
   - Check token expiration
   - Verify session storage

### Security Incident Response

1. **Immediate Actions**
   - Isolate affected systems
   - Preserve evidence
   - Notify security team

2. **Investigation**
   - Review audit logs
   - Analyze security events
   - Identify root cause

3. **Recovery**
   - Apply security patches
   - Reset compromised accounts
   - Update security policies

## Conclusion

This RBAC security system provides comprehensive protection for the scholarship management application. Regular updates and security audits are essential to maintain the security posture of the system.

For additional security questions or concerns, please contact the development team.
