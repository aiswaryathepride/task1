import React, { useState, useRef } from 'react';
import './LoginPage.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
const OTPLogin = () => {
  useEffect(() => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = Math.random().toString(36).substring(2, 10);
    localStorage.setItem('deviceId', deviceId);
  }
}, []);

  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [resendCount, setResendCount] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState(0);
  const navigate = useNavigate();
  const [otpExpired, setOtpExpired] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState('');
const [isPhoneValid, setIsPhoneValid] = useState(false);
 const sessionId = sessionStorage.getItem('loggedInUser');
 const handleSendOTP = async () => {
  const existingSession = sessionStorage.getItem('loggedInUser');
  const loggedInPhone = sessionStorage.getItem('loggedInPhone'); // store this during login

  const fullPhone = phone.startsWith('+91') ? phone : '+91' + phone;

 if (existingSession && loggedInPhone && loggedInPhone !== fullPhone) {
  await axios.post('http://localhost:3001/logout', {
    sessionId: existingSession
  });
  sessionStorage.removeItem('loggedInUser');
  sessionStorage.removeItem('loggedInPhone');
  console.log('Switched user – cleared session on backend too');
}
  else if (existingSession) {
  const confirmKeep = window.confirm(
    'You were already logged in.Continue with that?'
  );

  if (confirmKeep) {
   navigate('/home')
  } else {
    await axios.post('http://localhost:3001/logout', {
      sessionId: existingSession
    });
    sessionStorage.clear();
    alert('Session cleared. You can now login again.');
  }

  return;
}


  // 🚫 Rate limit check
  if (resendCount >= 3) {
    setOtpSent(false);
    setBlocked(true);
    setBlockTimer(30);
    const blockInterval = setInterval(() => {
      setBlockTimer((prev) => {
        if (prev <= 1) {
          clearInterval(blockInterval);
          setBlocked(false);
          setResendCount(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return;
  }

  try {
    const deviceId = window.localStorage.getItem('deviceId');
const res = await axios.post(
  'http://localhost:3001/register',
  { phone },
  { headers: { 'x-device-id': deviceId } }
);

    if (res.data.sessionCleared) {
  alert('⚠️ Previous session was cleared for security.');
}


    if (res.data.message === 'OTP sent successfully.') {
      setOtpExpired(false);
      setOtpSuccess(false);
      setOtpSent(true);
      setResendCount(prev => prev + 1);
      setOtpArray(['', '', '', '', '', '']);

      setTimeout(() => {
        if (otpRefs.current[0]) otpRefs.current[0].focus();
      }, 50);

      setResendTimer(60);
      const countdown = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setOtpExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  } catch (err) {
   const msg = err.response?.data?.message;
  if (msg === 'You are already logged in.') {
     alert('You were already logged in. Session will now be cleared.');

  // ⛔️ Clear session on backend and frontend
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    await axios.post('http://localhost:3001/logout', {
  sessionId: sessionStorage.getItem('loggedInUser')
});

  sessionStorage.clear();
setOtpSent(false);           // Reset frontend state
setOtpArray(['', '', '', '', '', '']);
setOtpSuccess(false);


  alert('Session cleared. You can now request a new OTP.');
  await handleSendOTP();
  return;
  }

  alert(msg || 'Error sending OTP');
  }
};


  const handleOTPChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;

    const leftFilled = otpArray.slice(0, index).every((digit) => digit !== '');
    if (!leftFilled && value) return;

    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOTPKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };
  const checkPhoneExists = async (num) => {
  try {
    const res = await axios.get(`http://localhost:3001/check-phone?phone=${num}`);
    setPhoneError('');
    setIsPhoneValid(true);
  } catch (err) {
    setPhoneError('❌ Not registered. Please Sign Up');
    setIsPhoneValid(false);
  }
};


  const handleVerifyOTP = async () => {
    const otp = otpArray.join('');
  
    try {
      const deviceId = localStorage.getItem('deviceId');
      const res = await axios.post('http://localhost:3001/verify', {
        phone,
        otp,
        deviceId
      });
// ✅THIS LINE to store session
      sessionStorage.setItem('loggedInUser', res.data.sessionId);
sessionStorage.setItem('loggedInPhone', res.data.phone);
      setOtpSuccess(true);
   setTimeout(() => {
  navigate('/home'); //navigate('/homepage').
}, 2000);
    } catch (err) {
      setOtpSuccess(false);
      alert(err.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="login-container">
      <h1 className="filmroll-title">🎬 FILMROLL</h1>
      <h2 className="login-heading">Login</h2>

      <div className="login-box">
        {/* Phone Number Field */}
        <div className="floating-phone-group">
  <span className="fixed-code">+91</span>
  <div className="floating-wrapper">
    <input
      type="text"
      id="phone"
      value={phone}
      onChange={(e) => {
  const value = e.target.value;
  if (/^\d*$/.test(value)) {
    setPhone(value);
    if (value.length === 10) {
      checkPhoneExists(value); // 🔍
    } else {
      setPhoneError('');
      setIsPhoneValid(false);
    }
  }
}}

      required
    />
    <label htmlFor="phone" className={phone ? 'float' : ''}>Phone Number</label>
   {phoneError && <p className="error-text">{phoneError}</p>}
  </div>
</div>


        {/* OTP Section */}
        {blocked ? (
  <p className="resend-timer" style={{ color: 'red', textAlign: 'center' }}>
    🚫 Too many attempts. Try again in {blockTimer}s
  </p>
) : otpSent ? (
  <>
    <label>Enter OTP</label>
    <div className="otp-boxes">
      {otpArray.map((digit, index) => (
        <input
          key={index}
          type="text"
          maxLength="1"
          className="otp-input"
          value={digit}
          onChange={(e) => handleOTPChange(e, index)}
          onKeyDown={(e) => handleOTPKeyDown(e, index)}
          ref={(el) => (otpRefs.current[index] = el)}
          disabled={otpExpired}
        />
      ))}
    </div>

    <div className="otp-actions">
      {!otpExpired ? (
        <>
          <button
            onClick={handleVerifyOTP}
            disabled={otpArray.some((digit) => digit === '')}
            className={otpArray.some((digit) => digit === '') ? 'disabled-btn' : ''}
          >
            Verify OTP
          </button>
         {!otpSuccess && (
  <p className="resend-timer">Expires in {resendTimer}s</p>
)}
        </>
      ) : (
        <button className="resend-btn" onClick={handleSendOTP}>
          Resend OTP
        </button>
      )}
    </div>

    {otpSuccess && (
      <p className="success-message">✅ OTP Verified Successfully!</p>
    )}
  </>
) : (
 <button
  onClick={handleSendOTP}
  disabled={!/^\d{10}$/.test(phone) || !isPhoneValid}
  className={!/^\d{10}$/.test(phone) || !isPhoneValid ? 'disabled-btn' : ''}
>
  Send OTP
</button>

)}

      </div>

      <p className="signup-text">
        Don't have an account? <Link className="link-text" to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default OTPLogin;
