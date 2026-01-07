const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the static index.html from root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// SMTP Setup for eclipso.eu
// Assuming you set SMTP_USER and SMTP_PASS in Render env variables
const transporter = nodemailer.createTransport({
    host: 'mail.eclipso.de', // Standard Eclipso SMTP host
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Contact Route
app.post('/send', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Please fill out all fields.' });
    }

    const mailOptions = {
        from: process.env.SMTP_USER, 
        to: 'flownol@proton.me',
        replyTo: email, // This allows you to reply directly to the user's provided email
        subject: `New Message from ${name} via Deliration`,
        text: `From: ${name} (${email})\n\nMessage:\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: 'Message sent successfully!' });
    } catch (error) {
        console.error('SMTP Error:', error);
        res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
