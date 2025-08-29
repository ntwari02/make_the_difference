# 🗄️ PlanetScale Database Setup Guide

## 🎯 **Why PlanetScale?**

- ✅ **MySQL-compatible** - Easy migration from your current setup
- ✅ **Serverless-friendly** - Perfect for Vercel deployment
- ✅ **Free tier** - 1 database, 1 billion row reads/month
- ✅ **Automatic scaling** - Handles traffic spikes
- ✅ **Branch-based development** - Safe schema changes

## 🚀 **Step 1: Create PlanetScale Account**

1. Go to: `https://planetscale.com/`
2. Click **"Start for free"**
3. Sign up with **GitHub** (recommended) or email
4. Verify your email

## 🗄️ **Step 2: Create Database**

1. **Click "New Database"**
2. **Database name**: `mbappe_scholarship_db`
3. **Region**: Choose closest to your users
4. **Click "Create database"**

## 🔑 **Step 3: Get Connection Details**

1. **Click on your database**
2. **Click "Connect"**
3. **Select "Connect with Prisma"** (shows connection string)
4. **Copy the connection details**

## 📝 **Step 4: Update Environment Variables**

Go back to Vercel and update these variables:

| **Name** | **Value** | **Source** |
|----------|-----------|------------|
| `DB_HOST` | `aws.connect.psdb.cloud` | PlanetScale |
| `DB_USER` | `your-username` | PlanetScale |
| `DB_PASSWORD` | `your-password` | PlanetScale |
| `DB_NAME` | `mbappe_scholarship_db` | PlanetScale |
| `DB_SSL` | `true` | PlanetScale |

## 🔄 **Step 5: Database Schema Migration**

I'll create the migration script for you:

```sql
-- Create tables for Scholarship Management System
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user', 'secretary') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE scholarships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2),
  deadline DATE,
  requirements TEXT,
  status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  scholarship_id INT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  documents JSON,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (scholarship_id) REFERENCES scholarships(id)
);
```

## 🎉 **Benefits of PlanetScale:**

- **Automatic backups** every 24 hours
- **Point-in-time recovery**
- **Branch-based schema changes**
- **Zero-downtime deployments**
- **Built-in connection pooling**

## 🔗 **Connection String Format:**

```
mysql://username:password@aws.connect.psdb.cloud/database_name?sslaccept=strict
```

## 📊 **Free Tier Limits:**

- **1 database**
- **1 billion row reads/month**
- **10 million row writes/month**
- **1GB storage**
- **Perfect for development and small production**

## 🚀 **Next Steps After Setup:**

1. ✅ **Test database connection**
2. ✅ **Migrate existing data** (if any)
3. ✅ **Update application code**
4. ✅ **Test all functionality**
5. ✅ **Deploy to production**

---

**🎯 I'll help you complete this setup step by step!**
