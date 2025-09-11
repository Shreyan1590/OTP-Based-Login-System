# 🔐 OTP-Based Secure Login System

A modern OTP (One-Time Password) based secure login system with a sleek, animated frontend and a simple mock backend.

---

## 🚀 Project Overview

This project demonstrates a secure login flow using email-based OTP verification. It features:

- **Email-based OTP verification**
- **Real-time server status display**
- **Secure dashboard access after OTP verification**
- **Resend OTP and timer mechanism**
- **Persistent session management via localStorage**

---

## 🧱 Key Features

- Responsive and animated UI design
- Secure OTP verification flow
- Server health status indicator
- Timer countdown for OTP expiry
- Resend OTP support
- Simple session management (via localStorage)
- Logout functionality
- Easy extensibility for backend integrations

---

## ⚡ Demo Preview

*Add screenshots or GIFs here if available.*

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) installed (for mock backend)
- Modern web browser
- Internet connection (for Font Awesome icons)

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/otp-login-system.git
cd otp-login-system
```

### 2️⃣ Backend Setup (Mock Node.js Server)

This system uses a simple mock backend with the following endpoints:

- `POST /send-otp` → Accepts `{ email }` and returns `{ message, otp }`
- `POST /verify-otp` → Accepts `{ email, otp }` and returns `{ message }`
- `GET /health` → Returns `{ emailConfigured: true, emailConnected: true }`

**Example Simple Mock Server:**

Create a file `server.js`:

```js
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const otps = {}; // Store OTPs in memory

app.get('/health', (req, res) => {
    res.json({ emailConfigured: false, emailConnected: false });
});

app.post('/send-otp', (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otps[email] = otp;

    console.log(`Generated OTP for ${email}: ${otp}`);
    res.json({ message: 'OTP generated', method: 'display', otp });
});

app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (otps[email] === otp) {
        delete otps[email];
        res.json({ message: 'OTP verified successfully' });
    } else {
        res.json({ error: 'Invalid OTP' });
    }
});

app.listen(3000, () => {
    console.log('Mock OTP Server running on http://localhost:3000');
});
```

**Install dependencies & run:**

```bash
npm init -y
npm install express cors
node server.js
```

### 3️⃣ Frontend Setup

No build tools required – Pure HTML + JS + CSS.

- Open `index.html` in your browser (e.g., Chrome, Firefox)
- Ensure the backend is running at [http://localhost:3000](http://localhost:3000)

### 4️⃣ Usage Flow

1. User enters email → Clicks **Send Verification Code**
2. OTP is generated and displayed (or emailed if integrated in production)
3. User enters the 4-digit OTP → Click **Verify & Continue**
4. Upon success → Redirect to secure `dashboard.html`
5. Dashboard requires authenticated session to stay open
6. Logout clears session and returns to login

---

## 📁 Project Structure

```
├── index.html           # Login page
├── dashboard.html       # Protected dashboard
├── server.js            # Mock backend server
├── README.md            # Project documentation
├── styles.css (optional) # External CSS file if needed
└── assets/              # Images/icons (optional)
```

---

## ⚠️ Important Notes

This project is intended for demonstration purposes.

**Do NOT use in production without securing backend properly:**

- Implement rate-limiting
- Store OTPs in a database
- Use HTTPS
- Add proper session management (JWT, cookies, etc.)
- Avoid storing sensitive info in localStorage

---

## 💡 Future Enhancements

- Integrate real email service (e.g., SendGrid, Mailgun)
- Add multi-factor authentication (MFA)
- Persist sessions in cookies with expiration
- Store users in a database
- Improve security with HTTPS + environment variables

---

## 📜 License

MIT License

---

## 👤 Author

Shreyan S – [shreyanofficial25@gmail.com]

[🔗 GitHub](https://github.com/Shreyan1590/otp-login-system)
