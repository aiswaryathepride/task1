const express = require('express');
const router = express.Router();
const { generateOTP, otpStore } = require('../utils/otp');

// Temporary store for registration data
const tempUsers = {};

// Send OTP on registration
router.post('/register', (req, res) => {
  const { username, fullName, phone } = req.body;

  if (!username || !fullName || !phone) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const otp = generateOTP();

  // Save OTP and user temporarily
  otpStore[phone] = { otp, expiresAt: Date.now() + 300000 }; // 5 min expiry
  tempUsers[phone] = { username, fullName, phone };

  console.log(`Sending OTP to ${phone}: ${otp}`); // replace with SMS API

  res.json({ message: 'OTP sent successfully' });
});

// Export router
module.exports = router;
