# 🚗 Dealer Dashboard Access Guide

## 📍 **Dashboard URLs**

### **Main Dashboard:**
```
http://localhost:5173/dealer
http://localhost:5173/dealer/dashboard
```

Both URLs lead to the same dealer dashboard page.

---

## 🚀 **How to Access the Dashboard**

### **Step 1: Start the Development Server**

```bash
# Navigate to client directory
cd client

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

The app will start at: `http://localhost:5173`

---

### **Step 2: Login as a Dealer**

#### **Option A: Register a New Dealer Account**
1. Go to: `http://localhost:5173/auth/register`
2. Fill in the registration form:
   - **Email**: Your email
   - **Password**: Strong password (min 8 chars, uppercase, lowercase, number, special char)
   - **First Name**: Your first name
   - **Last Name**: Your last name
   - **Role**: Select **"dealer"** from dropdown
3. Click **Register**
4. You'll be redirected to login

#### **Option B: Login with Existing Dealer Account**
1. Go to: `http://localhost:5173/auth/login`
2. Enter your dealer credentials
3. Click **Login**

---

### **Step 3: Navigate to Dashboard**

After successful login, you have multiple ways to access the dashboard:

#### **Method 1: Direct URL**
- Simply navigate to: `http://localhost:5173/dealer/dashboard`

#### **Method 2: From Sidebar (if on any dealer page)**
- Click on **Dashboard** icon in the left sidebar

#### **Method 3: Programmatic Navigation**
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/dealer/dashboard');
```

---

## 🔐 **Access Requirements**

### **Role-Based Access Control:**
The dealer dashboard is **protected** and only accessible to users with:
- ✅ **Role: `dealer`** - Full dealer functionality
- ✅ **Role: `admin`** - Admin access to all features

### **Authentication:**
- Must be logged in with valid JWT token
- Token is stored in `localStorage` as `access_token`
- Protected by `ProtectedRoute` component

---

## 📱 **Available Routes**

Currently implemented:
```typescript
/dealer                    → Dealer Dashboard
/dealer/dashboard          → Dealer Dashboard (same as above)
```

Coming soon:
```typescript
/dealer/vehicles           → Vehicle Listing Page
/dealer/vehicles/add       → Add New Vehicle
/dealer/analytics          → Analytics Page
/dealer/messages           → Messages & Inquiries
/dealer/reviews            → Customer Reviews
/dealer/team               → Team Management
/dealer/payments           → Payment Dashboard
/dealer/profile            → Dealer Profile
/dealer/settings           → Settings Page
```

---

## 🧪 **Testing the Dashboard**

### **Create a Test Dealer Account:**

#### **Using Backend API (if server is running):**

1. **Start backend server:**
```bash
cd server
npm start
```

2. **Register via API:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dealer@example.com",
    "password": "Dealer@123",
    "first_name": "Test",
    "last_name": "Dealer",
    "role": "dealer"
  }'
```

3. **Login via API:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "dealer@example.com",
    "password": "Dealer@123"
  }'
```

This will return an access token you can use.

---

## 🎨 **Dashboard Features**

Once you access the dashboard at `/dealer/dashboard`, you'll see:

### **Header:**
- 🍞 Breadcrumb navigation
- 🔍 Search icon
- 🌙 Dark/Light theme toggle
- 🔔 Notifications center (with badge)
- 👤 User profile menu

### **Sidebar:**
- 📊 Dashboard
- 🚗 Vehicles
- ➕ Add Vehicle
- 📈 Analytics
- 💬 Messages (with badge showing unread count)
- ⭐ Reviews
- 👥 Team
- 💰 Payments
- 👤 Profile
- ⚙️ Settings

### **Dashboard Content:**
- **4 Stats Cards:**
  - Total Listings
  - Active Vehicles
  - Total Sales
  - Total Favorites
- **Sales Overview Chart** (Bar chart)
- **Weekly Views Chart** (Line chart)
- **Recent Activity Timeline**
- **Quick Actions Panel**
- **Performance Badges**

---

## 🐛 **Troubleshooting**

### **Issue: "Not allowed by CORS"**
**Solution:** Make sure backend CORS is configured to allow `http://localhost:5173`

### **Issue: "Authentication required"**
**Solution:** 
1. Check if you're logged in
2. Verify token exists: `localStorage.getItem('access_token')`
3. Re-login if token expired

### **Issue: "Forbidden: insufficient role"**
**Solution:** Your user account needs `dealer` or `admin` role. Register with correct role or update via admin.

### **Issue: 404 Page Not Found**
**Solution:** 
1. Ensure development server is running
2. Check the URL is correct: `/dealer/dashboard`
3. Clear browser cache and reload

### **Issue: Dashboard is blank**
**Solution:** 
1. Open browser console (F12) for errors
2. Check Redux DevTools for state
3. Verify all components are imported correctly

---

## 📝 **Quick Start Commands**

```bash
# Full setup from scratch
cd client
npm install
npm run dev

# Then navigate to:
# http://localhost:5173/auth/register
# Register as dealer → Login → Go to /dealer/dashboard
```

---

## 🔗 **Useful Links**

- **Landing Page:** `http://localhost:5173/`
- **Login:** `http://localhost:5173/auth/login`
- **Register:** `http://localhost:5173/auth/register`
- **Dealer Dashboard:** `http://localhost:5173/dealer/dashboard`

---

## 💡 **Pro Tips**

1. **Bookmark the dashboard** after first login for quick access
2. **Use Redux DevTools** to inspect dealer state
3. **Enable React Query DevTools** for API debugging
4. **Check browser console** for any errors
5. **Use the theme toggle** to switch between dark/light modes

---

## 🎯 **Next Steps**

After accessing the dashboard, you can:
1. ✅ Explore the dashboard interface
2. ✅ Check all sidebar navigation items
3. ✅ Toggle dark/light theme
4. ✅ View notifications
5. ✅ Access profile menu
6. ⏳ Wait for vehicle management pages (coming next!)

---

**Need Help?** 
- Check browser console for errors
- Verify backend is running at `http://localhost:3001`
- Ensure you have valid dealer credentials

Happy dealing! 🚀🚗

