// utils/sendSMS.js

// Fake function for development (no SMS sent)
function sendOTPViaWhatsApp(phone, otp) {
  return new Promise((resolve) => {
    console.log(`🔐 OTP for ${phone} is: ${otp}`);
    resolve(); // simulate success
  });
}

module.exports = { sendOTPViaWhatsApp };
