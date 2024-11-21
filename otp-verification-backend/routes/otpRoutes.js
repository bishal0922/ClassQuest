// routes/otpRoutes.js
const express = require('express');
const otpController = require('../controllers/otpController');
const router = express.Router();
router.post('/send-otp', otpController.sendOTP);
module.exports = router;