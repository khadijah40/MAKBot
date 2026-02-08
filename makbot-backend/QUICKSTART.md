# 🚀 Quick Start Guide - MAKBot Backend

## Installation in 5 Minutes

### 1️⃣ Install Node.js
- Download from: https://nodejs.org/
- Choose LTS version
- Install with default settings

### 2️⃣ Install MongoDB
**Easy Option - MongoDB Atlas (Cloud, Free):**
1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create a cluster (choose free tier)
4. Create a database user
5. Get connection string from "Connect" button

**Local Option:**
- Download from: https://www.mongodb.com/try/download/community
- Install and run

### 3️⃣ Setup Backend

Open terminal/command prompt in the backend folder:

```bash
# Install dependencies
npm install

# Start the server
npm run dev
```

### 4️⃣ Test It

Open browser and go to: http://localhost:5000

You should see: `{"message":"MAKBot API is running!"}`

## ✅ Checklist

- [ ] Node.js installed
- [ ] MongoDB setup (Atlas or Local)
- [ ] Updated `.env` file with MongoDB connection
- [ ] Changed `JWT_SECRET` in `.env`
- [ ] Ran `npm install`
- [ ] Server running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can register and login users

## 🆘 Common Issues

**"Cannot find module"**
```bash
npm install
```

**"Port 5000 already in use"**
- Change PORT in `.env` to 5001

**"MongoDB connection error"**
- Check if MongoDB is running
- Verify connection string in `.env`

**Frontend can't connect**
- Make sure backend is running on port 5000
- Check CORS is enabled (it is by default)

## 📞 Need Help?

1. Check README.md for detailed instructions
2. Verify all files are in place
3. Make sure .env is configured correctly
