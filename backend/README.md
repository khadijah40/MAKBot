# Authentication Backend - Complete Guide

A production-ready authentication backend built with Node.js, Express, MongoDB, and JWT.

## 🚀 Features

- ✅ User Registration & Login
- ✅ JWT Authentication (Bearer Token + HTTP-only Cookies)
- ✅ Password Hashing (bcrypt)
- ✅ Input Validation
- ✅ Rate Limiting
- ✅ Security Headers (Helmet)
- ✅ CORS Configuration
- ✅ Error Handling
- ✅ Profile Management
- ✅ Password Change
- ✅ Account Deletion
- ✅ Role-based Access Control (User/Admin)

## 📁 Project Structure

```
auth-backend/
├── src/
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── controllers/
│   │   └── authController.js   # Authentication logic
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   ├── errorHandler.js     # Error handling
│   │   └── validation.js       # Input validation
│   ├── models/
│   │   └── User.js             # User schema
│   ├── routes/
│   │   └── auth.js             # Auth routes
│   └── server.js               # Express app
├── .env.example
├── .gitignore
└── package.json
```

## 🛠️ Installation

### 1. Clone or Download

```bash
cd auth-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/auth-db
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
CLIENT_URL=http://localhost:3000
```

### 4. Start MongoDB

Make sure MongoDB is running:

```bash
# Using MongoDB locally
mongod

# OR using Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### 5. Run the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Public Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "657abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isEmailVerified": false
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Protected Routes (Require Bearer Token)

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "John Updated",
  "email": "johnupdated@example.com"
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

#### Logout
```http
GET /api/auth/logout
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Delete Account
```http
DELETE /api/auth/account
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile (replace TOKEN with your JWT)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🧪 Testing with Postman

1. **Import Collection**: Create new requests for each endpoint
2. **Set Environment Variable**: 
   - Create `token` variable
   - After login, save the token from response
3. **Use Token**: Add to Authorization → Bearer Token

## 🔒 Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Signed with secret, 7-day expiration
- **HTTP-only Cookies**: XSS protection
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Security headers
- **CORS**: Cross-origin configuration
- **Input Validation**: express-validator
- **Error Handling**: Centralized error middleware

## 🎯 Frontend Integration

### Example with Axios (React)

```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // For cookies
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Register
const register = async (userData) => {
  const response = await API.post('/auth/register', userData);
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// Login
const login = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// Get current user
const getCurrentUser = async () => {
  const response = await API.get('/auth/me');
  return response.data.user;
};

// Logout
const logout = async () => {
  await API.get('/auth/logout');
  localStorage.removeItem('token');
};
```

## 🌐 Deployment

### Deploy to Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

3. Add environment variables in Railway dashboard

### Deploy to Render

1. Push to GitHub
2. Connect to Render
3. Add environment variables
4. Deploy

### Deploy to Heroku

```bash
heroku create your-app-name
git push heroku main
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
```

## 🔧 Advanced Features to Add

- Email verification
- Password reset via email
- OAuth (Google, GitHub)
- Refresh tokens
- Two-factor authentication
- Account lockout after failed attempts
- Email notifications
- User roles and permissions
- API documentation (Swagger)

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | - |
| JWT_SECRET | Secret for JWT signing | - |
| JWT_EXPIRE | Token expiration | 7d |
| JWT_COOKIE_EXPIRE | Cookie expiration (days) | 7 |
| CLIENT_URL | Frontend URL for CORS | http://localhost:3000 |

## 🐛 Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check MONGODB_URI in .env
- For MongoDB Atlas, whitelist your IP

### JWT Token Invalid
- Check JWT_SECRET matches between requests
- Token might be expired (check JWT_EXPIRE)

### CORS Error
- Set correct CLIENT_URL in .env
- Make sure credentials are enabled in frontend

## 📄 License

MIT

## 🤝 Contributing

Pull requests are welcome!
