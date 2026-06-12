const nodemailer = require('nodemailer');

// @desc    Send Email Notification
// @route   POST /api/notifications/send-email
const sendEmailNotification = async (req, res) => {
    try {
        const { to, subject, text } = req.body;

        if (!to || !subject || !text) {
            return res.status(400).json({ success: false, message: "Please provide to, subject, and text fields." });
        }

        // 1. Nodemailer Transporter Setup using your App Password
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // 2. Email Details
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: text
        };

        // 3. Send Email
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully: ", info.response);

        return res.status(200).json({
            success: true,
            message: "Notification Email Sent Successfully!",
            messageId: info.messageId
        });

    } catch (error) {
        console.error("Nodemailer Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { sendEmailNotification };