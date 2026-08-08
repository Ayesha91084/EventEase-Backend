const nodemailer = require('nodemailer');
const Notification = require('../models/Notification'); // Mongoose Model Import

// 1. Database me Notification Store karne ki API (NEW)
const createNotification = async (req, res) => {
    try {
        const { userId, title, message, type } = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({ success: false, message: "userId, title, and message are required." });
        }

        const newNotification = new Notification({
            userId,
            title,
            message,
            type: type || 'general'
        });

        await newNotification.save();

        return res.status(201).json({
            success: true,
            message: "Notification created & saved in DB successfully!",
            data: newNotification
        });
    } catch (error) {
        console.error("Create Notification Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. User ki sari Notifications Database se Mangwane ki API (NEW)
const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        console.error("Get Notifications Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Send Email Notification (Tumhara Existing Function)
const sendEmailNotification = async (req, res) => {
    try {
        const { to, subject, text } = req.body;

        if (!to || !subject || !text) {
            return res.status(400).json({ success: false, message: "Please provide to, subject, and text fields." });
        }

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: '"EventEase System" <no-reply@eventease.com>',
            to: to,
            subject: subject,
            text: text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email captured by Mailtrap: ", info.response);

        return res.status(200).json({
            success: true,
            message: "Notification Email Sent Successfully (Captured by Mailtrap)!",
            messageId: info.messageId
        });

    } catch (error) {
        console.error("Nodemailer Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    createNotification, 
    getUserNotifications, 
    sendEmailNotification 
};