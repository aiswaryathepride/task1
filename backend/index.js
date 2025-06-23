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
  const doc = existing.docs[0];
  const data = doc.data();
  
  // Don't delete valid sessions
  if (data && data.phone === phone && data.deviceId === deviceId) {
    console.log(`✅ Session already exists for ${phone} + ${deviceId}. Keeping it.`);
    return res.status(200).json({
      message: 'You are already logged in.',
      phone,
      sessionId: doc.id
    });
  }
}




  const otp = generateOTP();
  otpStore[phone] = otp;

  try {
    await sendOTPViaWhatsApp(phone, otp); // simulated
    console.log(`OTP for ${phone} is: ${otp}`); // 👈 Show OTP in terminal
res.json({ 
  message: 'OTP sent successfully.', 
  sessionCleared,
  note: sessionCleared ? 'Previous session on this device was cleared' : null 
});
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

app.post('/verify-register', async (req, res) => {
  let { phone, otp } = req.body;

  if (!phone.startsWith('+')) {
    phone = '+91' + phone;
  }

  if (otpStore[phone] === otp) {
    delete otpStore[phone];
    console.log(`✅ Register OTP verified for ${phone}`);
    return res.status(200).json({ message: 'OTP verified successfully.' });
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

const session = doc.data();
if (session.deviceId !== req.body.deviceId) {
  return res.status(403).json({ message: 'Session not valid for this device' });
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
   if (!sessionId || !req.body.deviceId) {
  return res.status(400).json({ message: 'Missing sessionId or deviceId' });
}

const doc = await admin.firestore().collection('sessions').doc(sessionId).get();

if (!doc.exists) {
  return res.status(404).json({ message: 'Session not found' });
}

const session = doc.data();
if (session.deviceId !== req.body.deviceId) {
  return res.status(403).json({ message: 'Device mismatch. Cannot logout this session.' });
}

await admin.firestore().collection('sessions').doc(sessionId).delete();


    return res.json({ message: 'Logged out / session cleared' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Error during logout' });
  }
});

app.post('/signup', async (req, res) => {
  const { fullName, username, phone } = req.body;

  if (!fullName || !username || !phone) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Store in Firestore `usernames` collection
    await admin.firestore().collection('usernames').add({
      name: fullName,
      username: username.toLowerCase(),
      phone: phone.startsWith('+') ? phone.replace('+', '') : phone,
      createdAt: new Date()
    });

    res.status(200).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup failed:', err);
    res.status(500).json({ message: 'Error saving user data' });
  }
});
app.post('/check-availability', async (req, res) => {
  const { username, phone } = req.body;
  const db = admin.firestore();

  const usernameCheck = username
    ? await db.collection('usernames').where('username', '==', username.toLowerCase()).limit(1).get()
    : { empty: true };

  const phoneCheck = phone
    ? await db.collection('usernames').where('phone', '==', phone.replace('+', '')).limit(1).get()
    : { empty: true };

  return res.status(200).json({
    usernameExists: !usernameCheck.empty,
    phoneExists: !phoneCheck.empty
  });
});
// --- SUGGEST USERNAMES ---
app.get('/suggest-usernames', async (req, res) => {
  const db = admin.firestore();
  const { partialUsername } = req.query;

  // Simple validation (reuse your own rules)
  const validate = (uname) => {
    if (!uname) return 'Username is required.';
    if (/\s/.test(uname)) return 'Username cannot contain spaces.';
    if (uname.length < 3) return 'Username too short.';
    if (uname.length > 15) return 'Username too long.';
    if (!/^[a-zA-Z0-9_]+$/.test(uname)) return 'Invalid characters.';
    return '';
  };

  const validationError = validate(partialUsername?.trim());
  if (validationError && partialUsername?.trim()) {
    return res.status(400).json({ message: validationError });
  }

  const base = partialUsername?.trim().toLowerCase() || '';
  const suggestions = [];
  const maxSuggestions = 3;

  try {
    const exactDoc = await db.collection('usernames').where('username', '==', base).limit(1).get();
    if (exactDoc.empty) {
      suggestions.push(base);
    }

    let tries = 0;
    while (suggestions.length < maxSuggestions && tries < 10) {
      tries++;
      const suffix = Math.floor(Math.random() * 900) + 100; // 3-digit
      const suggestion = `${base}${suffix}`;
      if (suggestion.length > 15) continue;
      const isValid = !validate(suggestion);
      const exists = await db.collection('usernames').where('username', '==', suggestion).limit(1).get();
      if (isValid && exists.empty && !suggestions.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    }

    return res.status(200).json({ suggestions });
  } catch (err) {
    console.error('Username suggestion error:', err);
    return res.status(500).json({ message: 'Error generating suggestions.' });
  }
});



app.listen(3001, () => {
  console.log('Backend running on http://localhost:3001');
});
