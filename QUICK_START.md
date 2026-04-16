# 🚀 Quick Start Guide - 5 Minutes Setup

Get Watchverse running locally in 5 minutes!

## Prerequisites
- Node.js 18+ installed ([Download](https://nodejs.org/))
- Git installed
- A code editor (VS Code recommended)

## Windows Users
👉 **Use `setup.bat` instead of `setup.sh`**

## Linux/Mac Users
👉 **Use `setup.sh` (make it executable first: `chmod +x setup.sh`)**

---

## ⚡ Quick Start (3 Steps)

### Step 1: Clone & Setup (2 minutes)
```bash
# Clone repository
git clone https://github.com/VasuTripathi/Watchverse---Streaming-Aggregator-Platform.git
cd Watchverse

# Run setup script
# Windows:
setup.bat
# then choose option 1

# Linux/Mac:
./setup.sh
# then choose option 1
```

### Step 2: Configure (1 minute)
```bash
# Backend config
cd server
# Edit .env file with your actual values:
# - SUPABASE_URL
# - SUPABASE_KEY
# - JWT_SECRET (run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# - OPENAI_API_KEY
code .env

# Frontend config
cd ../client
# Edit .env.local with your API URL:
# - REACT_APP_API_URL=http://localhost:5000/api
code .env.local
```

### Step 3: Run (2 minutes)
```bash
# Option A: Run both servers with script
./setup.sh          # Choose option 2
# or
setup.bat           # Choose option 2

# Option B: Manual - Terminal 1 (Backend)
cd server
npm run dev

# Option B: Manual - Terminal 2 (Frontend)
cd client
npm start
```

Visit **http://localhost:3000** 🎉

---

## 🌐 Access from Mobile Device

Find your laptop IP:
```bash
# Windows
ipconfig | findstr /R "IPv4"

# Mac/Linux
ifconfig | grep inet
```

Then on mobile:
```
http://YOUR_IP:3000
```

Example: `http://192.168.1.100:3000`

---

## 🐳 Using Docker (Alternative)

```bash
# Requires Docker installed
# https://www.docker.com/products/docker-desktop

# Copy environment file
cp server/.env.example server/.env
# Edit server/.env with your values

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

---

## 🔍 Testing

### Test Frontend
- Open DevTools (F12)
- Check Network tab for API calls
- Test on different screen sizes (Toggle device toolbar: Ctrl+Shift+M)

### Test Backend API
```bash
# Health check
curl http://localhost:5000/health

# API status
curl http://localhost:5000/

# Test auth endpoint (create account first)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## 🐛 Troubleshooting

### "EADDRINUSE: address already in use"
```bash
# Port 5000 or 3000 is already in use
# Either:
# 1. Close other apps using these ports
# 2. Or change port in .env (BACKEND: PORT=5001, FRONTEND: PORT=3001)
```

### "Cannot find module..."
```bash
# Dependencies not installed
cd server && npm install
cd ../client && npm install
```

### "Database connection error"
```bash
# Check .env has correct SUPABASE_URL and SUPABASE_KEY
# Verify Supabase project is created
# Check table "users" exists in Supabase
```

### "CORS error"
```bash
# Make sure frontend API URL is correct in .env.local
# Should be: http://localhost:5000/api
# Not: http://localhost:5000/api/
```

### "Module not found: Can't resolve '@supabase/supabase-js'"
```bash
cd server
npm install
```

---

## 📚 Next Steps

1. ✅ App is running locally
2. 👉 **Read** [MULTI_DEVICE_GUIDE.md](./MULTI_DEVICE_GUIDE.md) - Multi-device support info
3. 👉 **Read** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deploy to production
4. 👉 **Check** [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) - Before going live
5. 👉 **Review** [README.md](./README.md) - Full documentation

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Express Tutorials](https://expressjs.com/en/starter/examples.html)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 💬 Need Help?

### Common Fixes
- Restart the servers (Ctrl+C then re-run)
- Clear browser cache (Ctrl+Shift+Delete)
- Check logs in terminal (scroll up)
- Update npm packages: `npm install`

### Still Stuck?
1. Check error message in terminal/DevTools
2. See "Troubleshooting" section above
3. Search GitHub Issues
4. Create new GitHub Issue with:
   - Error message
   - Steps to reproduce
   - Your OS & Node version

---

## 🎉 You're All Set!

Congrats! You have:
- ✅ Watchverse running locally
- ✅ Backend API working
- ✅ Frontend app running
- ✅ Database connected
- ✅ Multi-device support
- ✅ Multi-user architecture

**Next: Deploy to production!** 🚀

---

**Need Production?** → [Deployment Guide](./DEPLOYMENT_GUIDE.md)

**Multi-Device Issues?** → [Multi-Device Guide](./MULTI_DEVICE_GUIDE.md)

**Before Going Live?** → [Production Checklist](./PRODUCTION_CHECKLIST.md)
