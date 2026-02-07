# Quick Start Guide

## 1️⃣ Install Dependencies

```bash
npm install
```

## 2️⃣ Setup Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/auth-db
JWT_SECRET=my_super_secret_key_at_least_32_characters_long
```

## 3️⃣ Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

**Option C: MongoDB Atlas (Cloud)**
- Go to https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string
- Update MONGODB_URI in .env

## 4️⃣ Run Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running in development mode on port 5000
```

## 5️⃣ Test the API

### Using cURL:

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

Save the token from response!

**Get User (replace TOKEN):**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman:

1. Import `postman_collection.json`
2. Set `base_url` to `http://localhost:5000`
3. After login, copy token to `token` variable
4. Test all endpoints!

## 🎉 You're Ready!

Your authentication backend is now running with:
- ✅ User registration
- ✅ User login
- ✅ JWT authentication
- ✅ Protected routes
- ✅ Profile management
- ✅ Password change
- ✅ Account deletion

## Next Steps

1. Connect your frontend (React, Vue, etc.)
2. Add email verification
3. Add password reset
4. Add OAuth (Google, GitHub)
5. Deploy to production

Check `README.md` for detailed documentation!
