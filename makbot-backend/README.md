# MAKBot Backend API

A complete Node.js/Express backend for the MAKBot chatbot application with user authentication and chat management.

## 🚀 Features

- **User Authentication** (Register, Login, JWT-based)
- **Google OAuth 2.0** Sign-In integration
- **Chat Management** (Create, Read, Update, Delete conversations)
- **MongoDB Database** for data persistence
- **RESTful API** design
- **Secure password hashing** with bcrypt
- **CORS enabled** for frontend integration
- **Session management** with express-session

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (local or Atlas account)
- npm (comes with Node.js)
- **Google Cloud Account** (for Google OAuth - free, see GOOGLE_OAUTH_SETUP.md)

## 🛠️ Installation

### Step 1: Clone or Download

Save all the backend files in a folder named `makbot-backend`.

### Step 2: Install Dependencies

Open terminal in the `makbot-backend` folder and run:

```bash
npm install
```

This will install all required packages:
- express
- mongoose
- cors
- bcryptjs
- jsonwebtoken
- dotenv

### Step 3: Setup MongoDB

**Option A: Local MongoDB**
1. Install MongoDB Community Edition
2. Start MongoDB service:
   - **Windows**: MongoDB runs as a service automatically
   - **Mac**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

**Option B: MongoDB Atlas (Cloud - Recommended for beginners)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `.env` file with your connection string

### Step 4: Configure Environment Variables

Edit the `.env` file:

```env
PORT=5000

# For Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/makbot

# For MongoDB Atlas (replace with your connection string):
# MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/makbot?retryWrites=true&w=majority

# Change this to a random secure string!
JWT_SECRET=makbot-super-secret-key-2024-change-this

# Google OAuth (Get from Google Cloud Console - see GOOGLE_OAUTH_SETUP.md)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Session Secret
SESSION_SECRET=your-session-secret-change-this

NODE_ENV=development
```

**⚠️ To enable Google Sign-In:** Follow the detailed setup guide in `GOOGLE_OAUTH_SETUP.md`

### Step 5: Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ MongoDB Connected
🚀 Server is running on port 5000
```

## 📡 API Endpoints

### Authentication

#### Register User
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Google OAuth Sign-In (Initiate)
```http
GET http://localhost:5000/api/auth/google
```
This redirects the user to Google's login page. After successful authentication, Google redirects back to your callback URL.

#### Google OAuth Callback
```http
GET http://localhost:5000/api/auth/google/callback
```
This is handled automatically by Google. After successful login, users are redirected to your frontend with a token.

### Chat Management

#### Create New Chat
```http
POST http://localhost:5000/api/chat/create
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "My First Chat"
}
```

#### Get All Chats
```http
GET http://localhost:5000/api/chat/all
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Specific Chat
```http
GET http://localhost:5000/api/chat/:chatId
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Send Message
```http
POST http://localhost:5000/api/chat/:chatId/message
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "text": "Hello, this is my message",
  "sender": "user"
}
```

#### Delete Chat
```http
DELETE http://localhost:5000/api/chat/:chatId
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🔧 Project Structure

```
makbot-backend/
├── config/
│   └── passport.js      # Google OAuth configuration
├── models/
│   ├── User.js          # User schema (with Google OAuth support)
│   └── Chat.js          # Chat schema
├── routes/
│   ├── auth.js          # Authentication routes (including Google OAuth)
│   └── chat.js          # Chat management routes
├── frontend/            # Frontend integration files
│   ├── Signup.jsx       # Updated signup component with Google OAuth
│   ├── GoogleAuthSuccess.jsx  # OAuth callback handler
│   └── INTEGRATION_GUIDE.md   # Frontend setup instructions
├── .env                 # Environment variables
├── .gitignore          # Git ignore file
├── package.json        # Dependencies
├── server.js           # Main server file
├── README.md           # This file
├── QUICKSTART.md       # Quick start guide
└── GOOGLE_OAUTH_SETUP.md  # Google OAuth setup instructions
```

## 🧪 Testing the API

You can test the API using:
1. **Postman** - Download from [postman.com](https://www.postman.com/)
2. **Thunder Client** - VS Code extension
3. **cURL** - Command line tool

### Example Test Flow:

1. **Register a user**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

2. **Login** (save the token)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

3. **Create a chat** (use token from login)
```bash
curl -X POST http://localhost:5000/api/chat/create \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Chat"}'
```

## 🔗 Connecting to Frontend

Your React frontend is already configured to connect to `http://localhost:5000`. Make sure:

1. Backend is running on port 5000
2. Frontend is running on a different port (usually 3000)
3. CORS is enabled (already configured in `server.js`)

## 🐛 Troubleshooting

### MongoDB Connection Failed
- **Local MongoDB**: Check if MongoDB service is running
- **Atlas**: Verify connection string and network access settings

### Port Already in Use
```bash
# Change PORT in .env file to a different number (e.g., 5001)
PORT=5001
```

### JWT Token Errors
- Make sure you're sending the token in the Authorization header
- Format: `Authorization: Bearer YOUR_TOKEN`

## 🔒 Security Notes

⚠️ **Important for Production:**
1. Change `JWT_SECRET` to a strong random string
2. Use environment variables for sensitive data
3. Enable HTTPS
4. Implement rate limiting
5. Add input validation and sanitization
6. Use helmet.js for security headers

## 📝 Next Steps

- [ ] Add AI integration (OpenAI, Anthropic, etc.)
- [ ] Implement real-time chat with Socket.io
- [ ] Add file upload functionality
- [ ] Implement chat search
- [ ] Add user profile updates
- [ ] Implement password reset

## 📄 License

ISC

## 👨‍💻 Support

If you encounter any issues, check:
1. All dependencies are installed (`npm install`)
2. MongoDB is running
3. `.env` file is configured correctly
4. Port 5000 is not being used by another application
