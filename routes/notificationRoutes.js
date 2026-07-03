const express = require('express');
const router = express.Router();
const { sendEmailNotification } = require('../controllers/notificationController');
// #swagger.tags = ['Notifications']
router.post('/send-email', sendEmailNotification);
router.post('/send-email', sendEmailNotification);

module.exports = router;