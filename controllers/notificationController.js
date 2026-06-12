const nodemailer = require('nodemailer');

// @desc    Send Email Notification
// @route   POST /api/notifications/send-email
const sendEmailNotification = async (req, res) => {
    try {
        const { to, subject, text } = req.body;

        if (!to || !subject || !text) {
            return res.status(400).json({ success: false, message: "Please provide to, subject, and text fields." });
        }

        // Mailtrap Config (Bina kisi security block ke chalega)
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

module.exports = { sendEmailNotification };