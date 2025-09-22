# 🧪 Postman Testing Guide - Authentication Endpoints

## 🚀 **Server Status Check**
Your server is running on: `http://localhost:3001`

## 📋 **Complete Endpoint Testing Guide**

### **1. Health Check**
- **Method:** `GET`
- **URL:** `http://localhost:3001/health`
- **Headers:** None
- **Expected Response:**
```json
{
  "status": "ok"
}
```

---

### **2. User Registration**
- **Method:** `POST`
- **URL:** `http://localhost:3001/api/auth/register`
- **Headers:** 
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "StrongPassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```
- **Expected Response (201):**
```json
{
  "id": 1,
  "email": "test@example.com",
  "is_verified": false
}
```
- **Error Cases:**
  - **400:** Invalid email, weak password, missing names
  - **409:** Email already registered

---

### **3. User Login**
- **Method:** `POST`
- **URL:** `http://localhost:3001/api/auth/login`
- **Headers:** 
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "identifier": "test@example.com",
  "password": "StrongPassword123!"
}
```
- **Expected Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access_expires_in": 900,
  "refresh_token": "a1b2c3d4e5f6...",
  "refresh_expires_in": 2592000,
  "user": {
    "id": 1,
    "email": "test@example.com",
    "role": "user"
  }
}
```
- **Error Cases:**
  - **400:** Missing identifier or password
  - **401:** Invalid credentials

---

### **4. Get User Profile** (Requires Authentication)
- **Method:** `GET`
- **URL:** `http://localhost:3001/api/auth/profile`
- **Headers:** 
  - `Authorization: Bearer YOUR_ACCESS_TOKEN`
- **Body:** None
- **Expected Response (200):**
```json
{
  "id": 1,
  "email": "test@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "role": "user",
  "is_verified": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```
- **Error Cases:**
  - **401:** Missing or invalid token

---

### **5. Update User Profile** (Requires Authentication)
- **Method:** `PUT`
- **URL:** `http://localhost:3001/api/auth/profile`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_ACCESS_TOKEN`
- **Body (JSON):**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+0987654321"
}
```
- **Expected Response (200):**
```json
{
  "id": 1,
  "email": "test@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+0987654321",
  "role": "user",
  "is_verified": false,
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```
- **Error Cases:**
  - **400:** No valid fields to update
  - **401:** Missing or invalid token

---

### **6. Refresh Access Token**
- **Method:** `POST`
- **URL:** `http://localhost:3001/api/auth/refresh`
- **Headers:** 
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "refresh_token": "a1b2c3d4e5f6..."
}
```
- **Expected Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access_expires_in": 900,
  "refresh_token": "b2c3d4e5f6g7...",
  "refresh_expires_in": 2592000
}
```
- **Error Cases:**
  - **400:** Missing refresh_token
  - **401:** Invalid or expired refresh token

---

### **7. User Logout**
- **Method:** `POST`
- **URL:** `http://localhost:3001/api/auth/logout`
- **Headers:** 
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "refresh_token": "a1b2c3d4e5f6..."
}
```
- **Expected Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 🔄 **Complete Testing Workflow**

### **Step 1: Test Health Check**
1. Create new request in Postman
2. Set method to `GET`
3. Set URL to `http://localhost:3001/health`
4. Send request
5. Verify response: `{"status": "ok"}`

### **Step 2: Test Registration**
1. Create new request
2. Set method to `POST`
3. Set URL to `http://localhost:3001/api/auth/register`
4. Add header: `Content-Type: application/json`
5. Add body with test user data
6. Send request
7. Save the `id` from response

### **Step 3: Test Login**
1. Create new request
2. Set method to `POST`
3. Set URL to `http://localhost:3001/api/auth/login`
4. Add header: `Content-Type: application/json`
5. Add body with login credentials
6. Send request
7. **IMPORTANT:** Save the `access_token` and `refresh_token`

### **Step 4: Test Get Profile**
1. Create new request
2. Set method to `GET`
3. Set URL to `http://localhost:3001/api/auth/profile`
4. Add header: `Authorization: Bearer YOUR_ACCESS_TOKEN`
5. Send request
6. Verify user profile data

### **Step 5: Test Update Profile**
1. Create new request
2. Set method to `PUT`
3. Set URL to `http://localhost:3001/api/auth/profile`
4. Add headers: 
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_ACCESS_TOKEN`
5. Add body with updated data
6. Send request
7. Verify updated profile

### **Step 6: Test Refresh Token**
1. Create new request
2. Set method to `POST`
3. Set URL to `http://localhost:3001/api/auth/refresh`
4. Add header: `Content-Type: application/json`
5. Add body with refresh token
6. Send request
7. Save new tokens

### **Step 7: Test Logout**
1. Create new request
2. Set method to `POST`
3. Set URL to `http://localhost:3001/api/auth/logout`
4. Add header: `Content-Type: application/json`
5. Add body with refresh token
6. Send request

---

## 🚨 **Common Issues & Solutions**

### **Issue: 401 Unauthorized**
- **Cause:** Missing or invalid access token
- **Solution:** Make sure you're using the correct `access_token` from login response

### **Issue: 400 Bad Request**
- **Cause:** Invalid request body or missing required fields
- **Solution:** Check JSON format and required fields

### **Issue: 500 Internal Server Error**
- **Cause:** Server-side error
- **Solution:** Check server console for error details

### **Issue: Connection Refused**
- **Cause:** Server not running
- **Solution:** Start server with `cd server && npm start`

---

## ✅ **Success Criteria**

All endpoints should return:
- ✅ Correct HTTP status codes
- ✅ Proper JSON responses
- ✅ No server errors in console
- ✅ Authentication working for protected routes
- ✅ Token refresh working
- ✅ Profile update working

---

## 🎯 **Quick Test Checklist**

- [ ] Health check returns `{"status": "ok"}`
- [ ] Registration creates new user
- [ ] Login returns tokens
- [ ] Get profile works with valid token
- [ ] Update profile works with valid token
- [ ] Refresh token works
- [ ] Logout works
- [ ] Invalid token returns 401
- [ ] Missing fields return 400

**Your authentication system is now fully functional!** 🚀
