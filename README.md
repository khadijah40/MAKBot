<div align="center">

# MAKBot 🤖

### An intelligent, full-stack AI chatbot that answers questions, assists with tasks, and delivers natural, engaging conversations

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-mak--bot.vercel.app-000000?style=for-the-badge)](https://mak-bot-5gi7.vercel.app)
&nbsp;
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

<br/>


---

## 📖 About

**MAKBot** is a full-stack chatbot application built entirely in JavaScript. It features a clean, interactive chat UI on the frontend and a Node.js/Express API on the backend that processes user messages and returns intelligent responses.

The project was built to explore conversational AI concepts, practice full-stack JavaScript development, and create a real-world interactive application from scratch.

---

## ✨ Features

| Feature | Description |
|---|---|
| 💬 Conversational AI | Responds to user inputs in a natural, context-aware way |
| ⚡ Real-Time Chat UI | Smooth, interactive chat interface with message history |
| 🔧 Task Assistance | Helps users with guidance, questions, and simple task automation |
| 🧩 Customizable Commands | Easily extendable with new response logic and commands |
| 🌐 Cross-Platform | Works on all modern browsers and devices |
| 🔗 REST API Backend | Clean Express API separating frontend and bot logic |
| 🚀 Deployed on Vercel | Live and accessible at any time |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| AI / Bot Logic | JavaScript (custom response engine) |
| Deployment | Vercel |
| Version Control | Git, GitHub |

---

## 🗂️ Project Structure

```
MAKBot/
│
├── frontend/                  # Client-side chat interface
│   ├── index.html             # Main chat UI page
│   ├── style.css              # Chat interface styling
│   └── script.js              # Handles user input & API communication
│
├── makbot-backend/            # Node.js / Express API server
│   ├── server.js              # App entry point and route setup
│   ├── routes/                # API route definitions
│   │   └── chat.js            # Chat endpoint handler
│   ├── controllers/           # Bot logic and response processing
│   │   └── botController.js
│   └── package.json           # Backend dependencies
│
└── README.md
```

> **Note:** Folder contents are inferred from the project structure. Actual file names may vary slightly.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- npm (bundled with Node.js)

---

### Frontend Setup

The frontend is a static interface — no build step needed.

```bash
# Clone the repository
git clone https://github.com/khadijah40/MAKBot.git
cd MAKBot/frontend

# Open directly in a browser
open index.html
```

---

### Backend Setup

```bash
# Navigate to the backend folder
cd makbot-backend

# Install dependencies
npm install

# Start the server
npm start
```

The API will run at `http://localhost:5000` (or your configured port).

> Make sure to update the API URL in the frontend `script.js` if running locally.

---

## ⚙️ How It Works

```
User types a message
        ↓
Frontend sends a POST request to /api/chat
        ↓
Express backend receives the message
        ↓
Bot controller processes the input
        ↓
Response is returned as JSON
        ↓
Frontend displays the bot's reply in the chat UI
```

---

## 📜 Available Scripts

### Backend (`/makbot-backend`)

| Script | Description |
|---|---|
| `npm start` | Starts the Express server |
| `npm run dev` | Starts with hot reload using nodemon |

---

## 🌐 Deployment

This project is deployed on **Vercel**.

To deploy your own version:

1. Fork this repository
2. Log in to [vercel.com](https://vercel.com) and click **Add New Project**
3. Import your forked repo
4. Set the **root directory** to `makbot-backend` for the backend service
5. Add any required environment variables
6. Deploy — Vercel handles the rest

For the frontend, you can deploy the `frontend/` folder as a separate static site on Vercel or Netlify.

---

## 🧠 What I Learned

- Building a **full-stack JavaScript application** end-to-end
- Designing and consuming a **REST API** with Express.js
- Handling **user input and dynamic responses** in a chat interface
- Structuring a project with **separate frontend and backend** concerns
- **Deploying** a Node.js application to Vercel

---

## 🤝 Contributing

Contributions, ideas, and improvements are very welcome!

1. Fork the repository
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "feat: describe your change"
   ```
4. Push to your fork and open a Pull Request

---

## 👩‍💻 Author

**khadijah40** — [github.com/khadijah40](https://github.com/khadijah40)

---

<div align="center">

⭐ Found MAKBot useful or interesting? Leave a star — it means a lot!

</div>
