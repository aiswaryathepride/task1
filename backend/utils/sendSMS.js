



const twilio = require('twilio');
const accountSid = '';
const authToken = '';

const client = twilio(accountSid, authToken);

function sendOTPViaWhatsApp(phone, otp) {
  return client.messages.create({
    from: 'whatsapp:+14155238886', // Twilio Sandbox number
    to: `whatsapp:${phone}`,       // Phone number in international format
    body: `🎬 Your FILMROLL OTP is: ${otp}`
  });
}

module.exports = { sendOTPViaWhatsApp };
