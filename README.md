# 🎓 UniSphere — The Campus Solution

**UniSphere** is an all-in-one campus management platform that brings a university's daily services — live bus tracking, canteen ordering, helpdesk support, and issue reporting — into one connected system for students, drivers, and staff.

---

## ✨ Features

- 🚌 **Live Bus Tracking** — Real-time GPS tracking of campus buses via Socket.IO, with driver-side location broadcasting and a student-side live map/ETA view.
- 🍽️ **Canteen Ordering** — Browse the menu, place food orders, and track order status online — no more waiting in line.
- 💳 **Online Payments** — Secure payments powered by Razorpay.
- 🎫 **Helpdesk / AI Assistant** — A knowledge-base-driven helpdesk (academics, campus info, holidays, rooms, university info) backed by Gemini/OpenRouter AI for instant answers.
- 🛠️ **Issue Reporting** — Students can raise and track campus issues/complaints.
- 🔐 **Authentication** — Secure signup/login with JWT, bcrypt password hashing, and OTP email verification via Gmail.
- 📊 **Reports Dashboard** — A dedicated reporting view for tracking activity across the platform.
- 🚍 **Driver Dashboard** — A separate interface for bus drivers to broadcast live location and status.

---

## 🏗️ Tech Stack

| Layer          | Technology                                              |
|----------------|-----------------------------------------------------------|
| Backend        | Node.js, Express 5, Socket.IO                              |
| Database       | MongoDB (Mongoose)                                         |
| Auth           | JWT, bcrypt.js, OTP via Gmail                               |
| Payments       | Razorpay                                                    |
| AI / Helpdesk  | Google Gemini (`@google/generative-ai`), OpenRouter         |
| Frontend       | Vanilla HTML, CSS, JavaScript (multi-page, role-based)      |
| Deployment     | [Render](https://render.com) (`render.yaml` included)       |

---

## 📁 Project Structure

```
unisphere/
├── backend/
│   ├── config/          # DB connection config
│   ├── middleware/       # Express middleware
│   ├── models/            # Mongoose schemas (User, Bus, Order, Menu, Issue, Otp)
│   ├── routes/            # API routes (auth, bus, payment, order, issue, menu, helpdesk)
│   ├── services/          # Gemini / OpenRouter / knowledge loader services
│   ├── utils/             # Email, Gmail client, Gemini prompt helpers
│   ├── data/knowledge/    # Helpdesk knowledge base (JSON)
│   ├── scripts/           # One-off scripts (e.g. Gmail refresh token)
│   └── server.js          # App entry point
├── frontend/
│   ├── student/            # Student dashboard, bus tracking, helpdesk
│   ├── driver/              # Driver dashboard
│   ├── canteen/             # Canteen ordering UI
│   ├── report/                # Reports UI
│   ├── image/                  # Menu item images
│   └── index.html, config.js, app.js, style.css
├── render.yaml            # Render deployment blueprint
├── DEPLOY.md               # Detailed deployment guide
└── README.md
```

---

## ⚙️ Setup & Run Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+ (v20+ recommended)
- A [MongoDB](https://www.mongodb.com/) database (Atlas or local)
- A Razorpay account (for payments)
- A Gmail account with an **App Password** (for OTP/receipt emails)

### 2. Clone the repository
```bash
git clone https://github.com/Protik733/Unisphere---The-Campus-Solution.git
cd Unisphere---The-Campus-Solution
```

### 3. Install dependencies
```bash
cd backend
npm install
```

### 4. Configure environment variables
Create a `backend/.env` file (this file is git-ignored and never gets pushed):

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
RAZORPAY_KEY=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
JWT_SECRET=your_jwt_secret
CAMPUS_EMAIL=your_gmail_address
CAMPUS_EMAIL_PASSWORD=your_gmail_app_password
OPENROUTER_API_KEY=your_openrouter_api_key
```

> 💡 `CAMPUS_EMAIL_PASSWORD` must be a **Gmail App Password**, not your regular Gmail password. Generate one from Google Account → Security → 2-Step Verification → App Passwords.

### 5. Run the server
```bash
npm start
```
The server starts on `http://localhost:3000` and serves both the API and the frontend from the same origin — no extra config needed.

---

## 🚀 Deployment (Render)

This project is pre-configured for [Render](https://render.com) via `render.yaml`.

- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- Add the environment variables listed above in the Render dashboard.

See [`DEPLOY.md`](./DEPLOY.md) for the full, detailed deployment walkthrough.

---

## 👥 User Roles

| Role     | Access                                                        |
|----------|-----------------------------------------------------------------|
| Student  | Bus tracking, canteen ordering, helpdesk, issue reporting          |
| Driver   | Live location broadcasting, trip status                            |
| Admin    | Reports & activity overview                                          |

---

## 📄 License

This project currently has no explicit license. Add one (e.g. MIT) if you plan to open-source it.

---

## 🙌 Author

Built by [Protik733](https://github.com/Protik733)