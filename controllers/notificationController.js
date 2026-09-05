const nodemailer = require('nodemailer');
const Notification = require('../models/Notification'); // DB Persistence Schema

// 🚀 REAL GMAIL SMTP TRANSPORTER SETUP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 465,
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER || "fyp20222026@gmail.com",
        pass: process.env.EMAIL_PASS
    }
});

// ==========================================
// 1. REAL EMAIL SENDER (OTP & Booking Notifications)
// ==========================================
const sendEmailNotification = async (req, res) => {
    try {
        const { toEmail, subject, textMessage } = req.body;

        if (!toEmail) {
            return res.status(400).json({ success: false, message: "Recipient email (toEmail) is required." });
        }

        const senderEmail = process.env.EMAIL_USER || "fyp20222026@gmail.com";

        const mailOptions = {
            from: `"EventEase Official" <${senderEmail}>`,
            to: toEmail,
            subject: subject || "EventEase Real-Time Notification",
            text: textMessage || "Aap ki EventEase booking/account activity ki notification.",
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                     <h2 style="color: #4CAF50;">EventEase Notification</h2>
                     <p style="font-size: 16px;">${textMessage || "Aap ki activity EventEase platform par update ho chuki hai."}</p>
                     <br/>
                     <p style="font-size: 12px; color: #777;">Regards,<br/>EventEase Team</p>
                   </div>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Real Email Inbox Delivery Success! Message ID:", info.messageId);

        return res.status(200).json({
            success: true,
            message: `Real email sent to ${toEmail} successfully!`,
            messageId: info.messageId
        });

    } catch (error) {
        console.error("Real Email SMTP Error:", error);
        return res.status(500).json({ success: false, message: "Email delivery failed", error: error.message });
    }
};

// ==========================================
// 2. CREATE IN-APP NOTIFICATION (DB Save)
// ==========================================
const createNotification = async (req, res) => {
    try {
        const { userId, title, message, type } = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({ success: false, message: "Missing required fields for notification." });
        }

        const newNotification = new Notification({
            userId,
            title,
            message,
            type: type || 'general',
            createdAt: new Date()
        });

        await newNotification.save();

        res.status(201).json({ success: true, message: "Notification logged to DB.", notification: newNotification });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ==========================================
// 3. GET USER IN-APP NOTIFICATIONS
// ==========================================
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user ? (req.user.id || req.user._id) : req.params.userId;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }

        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    sendEmailNotification,
    createNotification,
    getUserNotifications
};