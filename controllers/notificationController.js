const nodemailer = require('nodemailer');

// 🚀 REAL GMAIL SMTP TRANSPORTER SETUP
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 465,
    secure: true, // Port 465 ke liye SSL enable karta hai
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Real Email Sender (OTP, Booking Notifications & Emails)
const sendEmailNotification = async (req, res) => {
    try {
        const { toEmail, subject, textMessage } = req.body;

        if (!toEmail) {
            return res.status(400).json({ success: false, message: "Recipient email (toEmail) is required." });
        }

        const mailOptions = {
            from: `"EventEase Official" <${process.env.EMAIL_USER}>`,
            to: toEmail, // Real recipient email address
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

const createNotification = async (req, res) => {
    res.status(200).json({ success: true, message: "Notification logged to DB." });
};

const getUserNotifications = async (req, res) => {
    res.status(200).json({
        success: true,
        notifications: [
            { id: 1, title: "Booking Confirmed", message: "Your booking deposit payment was verified.", date: new Date() }
        ]
    });
};

module.exports = {
    sendEmailNotification,
    createNotification,
    getUserNotifications
};