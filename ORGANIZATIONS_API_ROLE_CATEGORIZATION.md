# Organizations API - Role-Based Categorization

## Base URL
```
http://localhost:3001/api/orgs
```

**⚠️ Important:** The actual API uses `/api/orgs`, not `/api/organizations` as shown in some documentation.

## Overview
This document categorizes all Organizations API endpoints based on user roles and permissions. The roles are:
- **Student** - Can enroll in courses and access basic organization features
- **Instructor** - Can create and manage courses
- **Moderator** - Can moderate content
- **Organization Admin** - Full administrative access to organization
- **Platform Admin** - System-wide administrative access

---

## 🎓 STUDENT ROLE APIs

Students have limited access focused on joining organizations, viewing content, and basic interactions.

### ✅ **Available to Students**

#### 1. **Organization Discovery & Information**
- **GET** `/api/orgs` - List all organizations
- **GET** `/api/orgs/me` - List my organizations

#### 2. **Organization Membership**
- **POST** `/api/orgs/:orgId/join` - Join organization (self-registration)
- **GET** `/api/orgs/:orgId/members` - View organization members

#### 3. **Member Management** (Limited)
- **POST** `/api/orgs/:orgId/members` - Add other users as students
  - Can only add users with `student` role
  - Cannot promote users to higher roles

### ❌ **Restricted for Students**

Students **CANNOT**:
- Create new organizations
- Update organization settings
- Deactivate organizations
- View organization statistics
- Remove members from organization
- Update member roles
- Send invitations
- Perform bulk member operations
- Access administrative features

---

## 👨‍🏫 INSTRUCTOR ROLE APIs

Instructors have expanded permissions for course management and some organizational oversight.

### ✅ **Available to Instructors**

#### 1. **All Student Permissions** (Inherited)
- All APIs listed under Student role

#### 2. **Enhanced Member Management**
- **POST** `/api/orgs/:orgId/members` - Add members with any role
- **DELETE** `/api/orgs/:orgId/members/:userId` - Remove members

### ❌ **Restricted for Instructors**

Instructors **CANNOT**:
- Create new organizations
- Update organization settings (name, logo, settings)
- Deactivate organizations
- View organization statistics
- Access platform-wide administrative features

---

## 🛡️ MODERATOR ROLE APIs

Moderators focus on content moderation and community management.

### ✅ **Available to Moderators**

#### 1. **All Student Permissions** (Inherited)
- All APIs listed under Student role

#### 2. **Community Management**
- **POST** `/api/orgs/:orgId/members` - Add members
- **DELETE** `/api/orgs/:orgId/members/:userId` - Remove problematic members

### ❌ **Restricted for Moderators**

Moderators **CANNOT**:
- Create new organizations
- Update organization settings
- Deactivate organizations
- View organization statistics
- Send bulk invitations
- Access administrative features

---

## 👑 ORGANIZATION ADMIN ROLE APIs

Organization Admins have full control over their organization.

### ✅ **Available to Organization Admins**

#### 1. **All Previous Role Permissions** (Inherited)
- All APIs from Student, Instructor, and Moderator roles

#### 2. **Organization Management**
- **POST** `/api/orgs` - Create new organizations

#### 3. **Advanced Member Management**
- **POST** `/api/orgs/:orgId/members` - Add members with any role
- **DELETE** `/api/orgs/:orgId/members/:userId` - Remove members

### ❌ **Restricted for Organization Admins**

Organization Admins **CANNOT**:
- Access other organizations' administrative features
- Perform platform-wide operations
- Modify system-level settings

---

## 🔧 PLATFORM ADMIN ROLE APIs

Platform Admins have system-wide administrative access.

### ✅ **Available to Platform Admins**

#### 1. **All Previous Role Permissions** (Inherited)
- All APIs from all previous roles

#### 2. **Platform-Wide Management**
- **GET** `/api/orgs` - Access all organizations

#### 3. **System Administration**
- Cross-organization user management
- Platform-wide analytics
- System configuration management
- Audit logging access

---

## 📊 API Access Matrix

| API Endpoint | Student | Instructor | Moderator | Org Admin | Platform Admin |
|--------------|---------|------------|-----------|-----------|----------------|
| **Organization Discovery** |
| `GET /api/orgs` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/orgs/me` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Organization Management** |
| `POST /api/orgs` | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Membership Management** |
| `POST /api/orgs/:orgId/join` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/orgs/:orgId/members` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /api/orgs/:orgId/members` | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| `DELETE /api/orgs/:orgId/members/:userId` | ❌ | ✅ | ✅ | ✅ | ✅ |

**Legend:**
- ✅ **Full Access** - Can perform the action
- ⚠️ **Limited Access** - Can perform with restrictions
- ❌ **No Access** - Cannot perform the action

---

## 🔐 Permission Notes

### Student Role Restrictions
- Can only add users as `student` role
- Cannot access administrative features
- Limited to viewing and basic interactions

### Instructor Role Capabilities
- Can manage courses within organization
- Can add/remove members
- Can send invitations
- Cannot modify organization settings

### Moderator Role Focus
- Primarily for content moderation
- Can manage member roles
- Cannot create courses or modify organization settings

### Organization Admin Privileges
- Full control over organization
- Can modify organization settings
- Can access analytics and statistics
- Can deactivate organization

### Platform Admin Powers
- System-wide access
- Can manage any organization
- Can access platform analytics
- Can perform administrative operations across organizations

---

## 🧪 **Postman Test Samples**

### **Authentication Setup**
First, get your JWT token by logging in:
```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Add to Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### **🏢 Organization Management CRUD**

#### **1. Create Organization**
```bash
POST http://localhost:3001/api/orgs
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Tech University",
  "slug": "tech-university",
  "logo": "https://example.com/logo.png",
  "settings": {
    "theme": "blue",
    "features": ["courses", "certificates"],
    "max_students": 1000,
    "allow_self_registration": true,
    "require_approval": false
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "org-123",
    "name": "Tech University",
    "slug": "tech-university",
    "logo": "https://example.com/logo.png",
    "settings": {
      "theme": "blue",
      "features": ["courses", "certificates"],
      "max_students": 1000,
      "allow_self_registration": true,
      "require_approval": false
    },
    "is_active": 1,
    "created_at": "2025-01-27T10:30:00.000Z",
    "updated_at": "2025-01-27T10:30:00.000Z"
  }
}
```

#### **2. List All Organizations**
```bash
GET http://localhost:3001/api/orgs
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "org-123",
      "name": "Tech University",
      "slug": "tech-university",
      "logo": "https://example.com/logo.png",
      "settings": {
        "theme": "blue",
        "features": ["courses", "certificates"]
      },
      "is_active": 1,
      "created_at": "2025-01-27T10:30:00.000Z",
      "updated_at": "2025-01-27T10:30:00.000Z"
    },
    {
      "id": "org-456",
      "name": "Business Academy",
      "slug": "business-academy",
      "logo": "https://example.com/business-logo.png",
      "settings": {
        "theme": "green",
        "features": ["courses", "workshops"]
      },
      "is_active": 1,
      "created_at": "2025-01-26T15:20:00.000Z",
      "updated_at": "2025-01-26T15:20:00.000Z"
    }
  ]
}
```

#### **3. List My Organizations**
```bash
GET http://localhost:3001/api/orgs/me
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "org-123",
      "name": "Tech University",
      "slug": "tech-university",
      "logo": "https://example.com/logo.png",
      "settings": {
        "theme": "blue",
        "features": ["courses", "certificates"]
      },
      "is_active": 1,
      "created_at": "2025-01-27T10:30:00.000Z",
      "updated_at": "2025-01-27T10:30:00.000Z"
    }
  ]
}
```

---

### **👥 Member Management CRUD**

#### **1. Add Member to Organization**
```bash
POST http://localhost:3001/api/orgs/org-123/members
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "user_id": "user-456",
  "role": "student"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Member added successfully",
  "data": {
    "id": "member-789",
    "organization_id": "org-123",
    "user_id": "user-456",
    "role": "student",
    "created_at": "2025-01-27T11:00:00.000Z"
  }
}
```

#### **2. Get Organization Members**
```bash
GET http://localhost:3001/api/orgs/org-123/members
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "member-789",
      "role": "org_admin",
      "joined_at": "2025-01-27T10:30:00.000Z",
      "user_id": "user-123",
      "email": "admin@techuniversity.edu",
      "first_name": "John",
      "last_name": "Doe",
      "profile_image": "https://example.com/profile.jpg"
    },
    {
      "id": "member-790",
      "role": "student",
      "joined_at": "2025-01-27T11:00:00.000Z",
      "user_id": "user-456",
      "email": "student@techuniversity.edu",
      "first_name": "Jane",
      "last_name": "Smith",
      "profile_image": null
    }
  ]
}
```

#### **3. Remove Member from Organization**
```bash
DELETE http://localhost:3001/api/orgs/org-123/members/user-456
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Member removed from organization"
}
```

#### **4. Join Organization (Self-Registration)**
```bash
POST http://localhost:3001/api/orgs/org-123/join
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "role": "student"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Added to organization",
  "data": {
    "id": "member-791",
    "organization_id": "org-123",
    "user_id": "user-789",
    "role": "student",
    "created_at": "2025-01-27T11:15:00.000Z"
  }
}
```

---

### **🔍 Organization Discovery**

#### **1. Search Organizations**
```bash
GET http://localhost:3001/api/orgs?search=tech&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **2. Filter Organizations by Status**
```bash
GET http://localhost:3001/api/orgs?status=active&limit=20
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### **🔧 Error Handling Examples**

#### **400 Bad Request**
```json
{
  "errors": [
    {
      "field": "name",
      "message": "Name is required and must be at least 2 characters"
    },
    {
      "field": "slug",
      "message": "Slug must be unique and URL-friendly"
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
  "message": "Admin role required for this action"
}
```

#### **404 Not Found**
```json
{
  "error": "Organization not found",
  "message": "The requested organization does not exist"
}
```

#### **409 Conflict**
```json
{
  "error": "Already a member",
  "message": "User is already a member of this organization"
}
```

---

### **🎯 Role-Specific Test Scenarios**

#### **Student Role Tests**
```bash
# 1. Join organization as student
POST http://localhost:3001/api/orgs/org-123/join
Authorization: Bearer STUDENT_JWT_TOKEN
Content-Type: application/json
{
  "role": "student"
}

# 2. View organization members
GET http://localhost:3001/api/orgs/org-123/members
Authorization: Bearer STUDENT_JWT_TOKEN

# 3. Add another student (limited permission)
POST http://localhost:3001/api/orgs/org-123/members
Authorization: Bearer STUDENT_JWT_TOKEN
Content-Type: application/json
{
  "user_id": "user-999",
  "role": "student"
}
```

#### **Instructor Role Tests**
```bash
# 1. Add members with any role
POST http://localhost:3001/api/orgs/org-123/members
Authorization: Bearer INSTRUCTOR_JWT_TOKEN
Content-Type: application/json
{
  "user_id": "user-888",
  "role": "instructor"
}

# 2. Remove members
DELETE http://localhost:3001/api/orgs/org-123/members/user-999
Authorization: Bearer INSTRUCTOR_JWT_TOKEN
```

#### **Admin Role Tests**
```bash
# 1. Create organization
POST http://localhost:3001/api/orgs
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
{
  "name": "New Academy",
  "slug": "new-academy",
  "settings": {
    "theme": "purple",
    "features": ["courses", "certificates", "workshops"]
  }
}
```

---

## 🚀 Implementation Recommendations

1. **Role-Based Middleware**: Implement middleware to check user roles before API access
2. **Permission Matrix**: Use the above matrix for frontend UI/UX decisions
3. **Audit Logging**: Track all administrative actions by role
4. **Role Inheritance**: Ensure higher roles inherit permissions from lower roles
5. **Dynamic Permissions**: Consider implementing dynamic permissions based on organization settings
