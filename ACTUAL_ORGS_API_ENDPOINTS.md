# Actual Organizations API Endpoints

## ✅ **Real API Base URL**
```
http://localhost:3001/api/orgs
```

## 📋 **Available Endpoints** (Based on Actual Code)

### 1. **Create Organization**
- **POST** `/api/orgs`
- **Authorization:** Admin or Instructor
- **Controller:** `ctrl.createOrg`

### 2. **List My Organizations**
- **GET** `/api/orgs/me`
- **Authorization:** Any authenticated user
- **Controller:** `ctrl.listMyOrgs`

### 3. **List All Organizations**
- **GET** `/api/orgs`
- **Authorization:** Any authenticated user
- **Controller:** `ctrl.listOrgs`

### 4. **Add Member to Organization**
- **POST** `/api/orgs/:orgId/members`
- **Authorization:** Admin, Instructor, or Student
- **Controller:** `ctrl.addMember`

### 5. **Get Organization Members**
- **GET** `/api/orgs/:orgId/members`
- **Authorization:** Any authenticated user
- **Controller:** `ctrl.getMembers`

### 6. **Remove Member from Organization**
- **DELETE** `/api/orgs/:orgId/members/:userId`
- **Authorization:** Admin or Instructor
- **Controller:** `ctrl.removeMember`

### 7. **Join Organization**
- **POST** `/api/orgs/:orgId/join`
- **Authorization:** Any authenticated user
- **Controller:** `ctrl.addMeToOrg`

## 🔍 **Key Differences from Documentation**

The actual implementation has **fewer endpoints** than the documentation suggests:

### ❌ **Not Implemented** (In Documentation but Not in Code)
- `GET /api/orgs/:orgId` - Get organization details
- `PUT /api/orgs/:orgId` - Update organization
- `PATCH /api/orgs/:orgId/deactivate` - Deactivate organization
- `GET /api/orgs/:orgId/stats` - Get organization statistics
- `POST /api/orgs/:orgId/members/bulk` - Bulk add members
- `PATCH /api/orgs/:orgId/members/:userId/role` - Update member role
- `GET /api/orgs/:orgId/courses` - Get organization courses
- `POST /api/orgs/:orgId/invitations` - Send invitations

### ✅ **Actually Implemented**
- Basic CRUD operations for organizations
- Member management (add, remove, list)
- Self-registration (join organization)
- Role-based access control

## 🎯 **Student Role - Actual Available APIs**

Based on the real implementation, students can access:

1. **GET** `/api/orgs` - List all organizations
2. **GET** `/api/orgs/me` - List my organizations  
3. **POST** `/api/orgs/:orgId/join` - Join organization
4. **GET** `/api/orgs/:orgId/members` - View organization members
5. **POST** `/api/orgs/:orgId/members` - Add other users as students

## 📝 **Note**
The documentation appears to be more comprehensive than the current implementation. The actual API is simpler and focuses on core organization and member management functionality.
