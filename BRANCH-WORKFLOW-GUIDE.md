# 🌿 Branch-Based Development Workflow Guide

## Your Current Workflow (Fixed!)

### ❌ **OLD WAY** (Caused EADDRINUSE errors):
```cmd
git checkout Tyler
git pull origin Tyler
git checkout "sam's"
git merge Tyler
# Then try to start server → ERROR!
```

### ✅ **NEW WAY** (No more errors!):
```cmd
# Use this ONE command instead:
merge-tyler-changes.bat
```

## 🚀 **YOUR NEW WORKFLOW**

### **When Tyler has new changes:**
```cmd
# Instead of the 4 commands above, just run:
merge-tyler-changes.bat
```

This single command will:
1. ✅ Stop any running server
2. ✅ Save your uncommitted changes
3. ✅ Switch to Tyler branch
4. ✅ Pull latest Tyler changes
5. ✅ Switch back to "sam's" branch
6. ✅ Merge Tyler changes
7. ✅ Restore your changes
8. ✅ Ask if you want to restart the server

### **Quick Branch Switching:**
```cmd
# Switch to Tyler branch:
switch-to-tyler.bat

# Switch back to your branch:
switch-to-sam.bat
```

## 🛠️ **Available Scripts for Your Workflow**

### **Main Scripts:**
- `merge-tyler-changes.bat` - **MAIN SCRIPT** - Complete Tyler merge workflow
- `switch-to-tyler.bat` - Just switch to Tyler branch
- `switch-to-sam.bat` - Switch back to your branch

### **Server Management:**
- `server/start-server.bat` - Start server (kills conflicts first)
- `server/start-dev.bat` - Start in development mode
- `server/kill-server.bat` - Kill any server using port 3001

## 📋 **Daily Workflow Examples**

### **Scenario 1: Tyler has new changes**
```cmd
# Run this:
merge-tyler-changes.bat
# Choose option 1 or 2 to start server
```

### **Scenario 2: You want to work on Tyler's branch**
```cmd
# Run this:
switch-to-tyler.bat
# Then: cd server && npm start
```

### **Scenario 3: You want to go back to your branch**
```cmd
# Run this:
switch-to-sam.bat
# Then: cd server && npm start
```

### **Scenario 4: You just want to start coding**
```cmd
cd server
npm run dev  # This auto-restarts when you save files
```

## 🔧 **What Each Script Does**

### **merge-tyler-changes.bat:**
1. 🛑 Stops any running server
2. 💾 Saves your uncommitted changes
3. 🔄 Switches to Tyler branch
4. 📥 Pulls latest Tyler changes
5. 🔄 Switches back to "sam's" branch
6. 🔀 Merges Tyler changes
7. 🔄 Restores your changes
8. 🚀 Offers to start server

### **switch-to-tyler.bat:**
1. 🛑 Stops server
2. 💾 Saves your changes
3. 🔄 Switches to Tyler
4. 📥 Pulls Tyler changes

### **switch-to-sam.bat:**
1. 🛑 Stops server
2. 🔄 Switches to "sam's"
3. 🔄 Restores your changes

## 🚨 **Emergency Commands**

If you still get the EADDRINUSE error:
```cmd
cd server
kill-server.bat
npm start
```

## 🎯 **Pro Tips for Your Workflow**

1. **Always use the scripts** - They handle server management automatically
2. **Use `npm run dev`** - Auto-restart saves time during development
3. **Commit before switching** - The scripts stash changes, but committing is safer
4. **Check git status** - Run `git status` to see what's happening

## 🔍 **Troubleshooting**

### **Merge conflicts?**
1. The script will tell you
2. Edit the conflicted files
3. Run `git add .`
4. Run `git commit`
5. Run the script again

### **Can't switch branches?**
1. Make sure you're in the project root
2. Check if you have uncommitted changes
3. Use `git status` to see what's happening

### **Server won't start?**
1. Run `cd server && kill-server.bat`
2. Wait 5 seconds
3. Run `npm start`

## 🎉 **Summary**

**Before**: 4 manual commands + EADDRINUSE error
**After**: 1 script command + zero errors

Your workflow is now:
1. Run `merge-tyler-changes.bat`
2. Choose to start server
3. Start coding!

**The EADDRINUSE error will NEVER happen again!** 🚀
