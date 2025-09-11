const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// In-memory storage for OTPs
const otpStorage = new Map();

// Email configuration
const emailConfig = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};

let transporter;
let emailEnabled = false;

// Initialize email transporter
function initEmailTransporter() {
    try {
        transporter = nodemailer.createTransport(emailConfig);

        // Test connection with timeout
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout')), 5000)
        );

        Promise.race([transporter.verify(), timeoutPromise])
            .then(() => {
                console.log('✓ Email server is ready to send messages');
                emailEnabled = true;
            })
            .catch(error => {
                console.log('✗ Email connection failed:', error.message);
                console.log('✓ OTPs will be displayed on screen instead');
                emailEnabled = false;
            });

        return transporter;
    } catch (error) {
        console.log('Failed to initialize email transporter:', error.message);
        emailEnabled = false;
        return null;
    }
}

// Initialize email on server start
initEmailTransporter();

// Generate a 4-digit OTP
function generateOTP() {
    return crypto.randomInt(1000, 9999).toString();
}

// Send OTP endpoint
app.post('/send-otp', async(req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const otp = generateOTP();

        // Store OTP with expiration (5 minutes)
        otpStorage.set(email, {
            otp,
            expires: Date.now() + 5 * 60 * 1000
        });

        console.log(`Generated OTP for ${email}: ${otp}`);

        // Try to send email if transporter is available and enabled
        if (emailEnabled && transporter) {
            try {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Your OTP for Login',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                            <h2 style="color: #333;">Your One-Time Password (OTP)</h2>
                            <p>Use the following OTP to complete your login:</p>
                            <div style="text-align: center; margin: 20px 0;">
                                <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; 
                                             background-color: #f5f5f5; padding: 10px 15px; 
                                             border-radius: 5px;">${otp}</span>
                            </div>
                            <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="color: #777; font-size: 12px;">
                                If you didn't request this OTP, please ignore this email.
                            </p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                return res.json({
                    message: 'OTP sent successfully to your email',
                    method: 'email'
                });
            } catch (emailError) {
                console.log('Email delivery failed, falling back to screen display');
                emailEnabled = false; // Disable email for future requests
            }
        }

        // If email is disabled or failed, return OTP in response
        res.json({
            message: 'OTP generated successfully',
            method: 'display',
            otp: otp
        });

    } catch (error) {
        console.error('Error in send-otp:', error);
        res.status(500).json({
            error: 'Failed to process OTP request'
        });
    }
});

// Verify OTP endpoint
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const storedData = otpStorage.get(email);

    if (!storedData) {
        return res.status(400).json({ error: 'OTP not found or expired' });
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expires) {
        otpStorage.delete(email);
        return res.status(400).json({ error: 'OTP has expired' });
    }

    // Check if OTP matches
    if (storedData.otp === otp) {
        otpStorage.delete(email);
        return res.json({ message: 'OTP verified successfully' });
    } else {
        return res.status(400).json({ error: 'Invalid OTP' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        emailConfigured: !!process.env.EMAIL_USER,
        emailConnected: emailEnabled
    });
});

// Serve the frontend
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Open http://localhost:${port} in your browser`);
    console.log('Health check: http://localhost:3000/health');

    if (!process.env.EMAIL_USER) {
        console.log('Warning: EMAIL_USER not set in .env file');
    }
    if (!process.env.EMAIL_PASS) {
        console.log('Warning: EMAIL_PASS not set in .env file');
    }
});