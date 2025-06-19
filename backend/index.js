const express = require('express');
const cors = require('cors');
const { sendOTPViaWhatsApp } = require('./utils/sendSMS');
const app = express();
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // adjust path if needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(express.json());

const otpStore = {}; // { 'phoneNumber': 'OTP' }

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP
app.post('/register', async (req, res) => {
  let { phone } = req.body;

  if (!phone.startsWith('+')) {
    phone = '+91' + phone;
  }

  const otp = generateOTP();
  otpStore[phone] = otp;

  try {
    await sendOTPViaWhatsApp(phone, otp); // simulated
    console.log(`OTP for ${phone} is: ${otp}`); // 👈 Show OTP in terminal
res.json({ message: 'OTP sent successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
});

// Verify OTP
app.post('/verify', (req, res) => {
  let { phone, otp } = req.body;

  if (!phone.startsWith('+')) {
    phone = '+91' + phone;
  }

  if (otpStore[phone] === otp) {
    delete otpStore[phone];
    return res.json({ message: 'OTP verified successfully.' });
  }
  return res.status(400).json({ message: 'Invalid OTP.' });
});
// Check if phone exists in DB (simulate using Firebase or any data source)
app.get('/check-phone', async (req, res) => {
  const { phone } = req.query;

  if (!phone || phone.length < 10) {
    return res.status(400).json({ message: 'Phone number is invalid' });
  }

  try {
    const formatted = `91${phone.replace('+91', '')}`;
    const phoneDoc = await admin.firestore().collection('usernames')
     .where('phone', '==',formatted) // ✅ Fix
      .limit(1)
      .get();

    if (phoneDoc.empty) {
      return res.status(404).json({ message: 'Phone number not registered' });
    } else {
      return res.status(200).json({ message: 'Phone number exists' });
    }
  } catch (err) {
    console.error('Phone check failed:', err);
    return res.status(500).json({ message: 'Error checking phone' });
  }
});

// Resend OTP
app.post('/resend-otp', async (req, res) => {
  let { phone } = req.body;

  if (!phone.startsWith('+')) {
    phone = '+91' + phone;
  }

  const otp = generateOTP();
  otpStore[phone] = otp;

  try {
    console.log(`Resent OTP for ${phone} is: ${otp}`); // 👈 Show in terminal
res.json({ message: 'OTP resent successfully.' }); // No OTP in frontend

  } catch (err) {
    res.status(500).json({ message: 'Failed to resend OTP.' });
  }
});

app.listen(3001, () => {
  console.log('Backend running on http://localhost:3001');
});
