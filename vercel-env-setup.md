# 🔧 Vercel Environment Variables Setup

## 📍 **Where to Set Environment Variables:**

1. Go to: `https://vercel.com/thierry-ntwaris-projects/mbappe-global`
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in left sidebar

## 🌍 **Add These Environment Variables:**

### **Production Environment Variables:**

| **Name** | **Value** | **Environment** |
|----------|-----------|-----------------|
| `NODE_ENV` | `production` | Production |
| `SESSION_SECRET` | `mbappe-global-scholarship-2024-secure-key` | Production |
| `PORT` | `3000` | Production |
| `JWT_SECRET` | `mbappe-jwt-secret-key-2024-production` | Production |
| `JWT_EXPIRES_IN` | `24h` | Production |

### **Database Variables (Will be updated after PlanetScale setup):**
| **Name** | **Value** | **Environment** |
|----------|-----------|-----------------|
| `DB_HOST` | `aws.connect.psdb.cloud` | Production |
| `DB_USER` | `your-planetscale-user` | Production |
| `DB_PASSWORD` | `your-planetscale-password` | Production |
| `DB_NAME` | `mbappe_scholarship_db` | Production |
| `DB_SSL` | `true` | Production |

### **File Storage Variables (Will be updated after Cloudinary setup):**
| **Name** | **Value** | **Environment** |
|----------|-----------|-----------------|
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | Production |
| `CLOUDINARY_API_KEY` | `your-api-key` | Production |
| `CLOUDINARY_API_SECRET` | `your-api-secret` | Production |

## 🎯 **Steps to Add:**

1. **Click "Add New"** for each variable
2. **Copy the Name and Value** from the table above
3. **Select "Production"** environment
4. **Click "Save"**
5. **Repeat** for all variables

## 🚨 **Important Notes:**

- **Don't share** these secret values
- **Production only** - don't add to Preview/Development
- **Redeploy** after adding variables
- **Keep backups** of these values

## 🔄 **After Adding Variables:**

Run this command to redeploy:
```bash
vercel --prod
```

## 📚 **Next Steps:**

After environment variables are set:
1. ✅ Set up PlanetScale database
2. ✅ Configure Cloudinary storage
3. ✅ Update code for serverless
4. ✅ Test all functionality
5. ✅ Deploy final version
