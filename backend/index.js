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
  const deviceId = req.headers['x-device-id'];

const existing = await admin.firestore().collection('sessions')
  .where('phone', '==', phone)
  .where('deviceId', '==', deviceId)
  .limit(1)
  .get();
let sessionCleared = false;
if (!existing.empty) {
  await existing.docs[0].ref.delete();
  console.log(`🔥 Existing session for ${phone} + ${deviceId} wiped`);
  sessionCleared = true;
}



  const otp = generateOTP();
  otpStore[phone] = otp;

  try {
    await sendOTPViaWhatsApp(phone, otp); // simulated
    console.log(`OTP for ${phone} is: ${otp}`); // 👈 Show OTP in terminal
res.json({ message: 'OTP sent successfully.',sessionCleared });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
});

// Verify OTP
app.post('/verify', async (req, res) => {
  let { phone, otp, deviceId } = req.body;


  if (!phone.startsWith('+')) {
    phone = '+91' + phone;
  }
  
  if (otpStore[phone] === otp) {
  delete otpStore[phone];
// Before generating a new sessionId
const existing = await admin.firestore().collection('sessions')
  .where('phone', '==', phone)
  .where('deviceId', '==', deviceId)
  .limit(1)
  .get();

if (!existing.empty) {
  const existingSession = existing.docs[0];
  return res.json({
    message: 'Already logged in on this device',
    phone,
    sessionId: existingSession.id
  });
}

  const sessionId = Math.random().toString(36).substring(2, 15);// 👈 we'll send this from frontend

await admin.firestore().collection('sessions').doc(sessionId).set({
  phone,
  deviceId,
  createdAt: new Date(),
});


  console.log(`✅ Session created for ${phone} → ID: ${sessionId}`);
  return res.json({
    message: 'OTP verified successfully.',
    phone,
    sessionId //this line
  });
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
// Validate session
app.post('/session/validate', async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: 'Missing sessionId' });
  }

  try {
    const doc = await admin.firestore().collection('sessions').doc(sessionId).get();

    if (!doc.exists) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    return res.status(200).json({ message: 'Session valid', data: doc.data() });
  } catch (err) {
    console.error('Session check failed:', err);
    return res.status(500).json({ message: 'Session validation failed' });
  }
});
app.post('/logout', async (req, res) => {
  const { sessionId, phone } = req.body;

  try {
    if (sessionId) {
      await admin.firestore().collection('sessions').doc(sessionId).delete();
    } else if (phone) {
      const existing = await admin.firestore().collection('sessions')
        .where('phone', '==', phone)
        .limit(1)
        .get();

      if (!existing.empty) {
        await existing.docs[0].ref.delete();
      }
    }

    return res.json({ message: 'Logged out / session cleared' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Error during logout' });
  }
});


app.listen(3001, () => {
  console.log('Backend running on http://localhost:3001');
});
