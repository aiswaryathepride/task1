import React, { useState, useRef } from 'react';
import './LoginPage.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import FilmStripFrame from '../components/Filmstrip';
const OTPLogin = () => {
  useEffect(() => {
  const sessionId = sessionStorage.getItem('loggedInUser');
  if (sessionId) {
    navigate('/home');
    return; // 👈 early exit to avoid running rest
  }

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
  const [showLoginToast, setShowLoginToast] = useState(false);

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
if (res.data.message === 'You are already logged in.') {
  // ✅ Store session and redirect to home directly
  sessionStorage.setItem('loggedInUser', res.data.sessionId);
  sessionStorage.setItem('loggedInPhone', res.data.phone);
  alert('You were already logged in on this device. Redirecting to Home.');
  navigate('/home');
  return;
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
        setShowLoginToast(true);
      },2000);
   setTimeout(() => {
  navigate('/home'); //navigate('/homepage').
}, 4000);
    } catch (err) {
      setOtpSuccess(false);
      alert(err.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="login-container">
      <FilmStripFrame>
      <div className="login-box">
        <div
        >
          <h1 className="filmroll-title">🎬FILMROLL</h1>
          <h2 className="login-heading">Login</h2>
          </div>
        {/* Phone Number Field */}
        <div style={{ marginBottom: '16px', width: '100%' }}>
  <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontWeight: 500 }}>
    Phone Number
  </label>
  <div style={{
    display: 'flex',
    alignItems: 'center',
    height: '46px'
  }}>
    <div style={{
      backgroundColor: '#fff',
      color: '#000',
      border: '1px solid #ccc',
      borderRight: 'none',
      borderTopLeftRadius: '8px',
      borderBottomLeftRadius: '8px',
      padding: '0 12px',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      fontWeight: 'bold'
    }}>
      +91
    </div>
    <input
      type="tel"
      placeholder="Enter 10-digit number"
      value={phone}
      onChange={(e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
          setPhone(value);
          if (value.length === 10) {
            checkPhoneExists(value);
          } else {
            setPhoneError('');
            setIsPhoneValid(false);
          }
        }
      }}
      maxLength={10}
      style={{
        flex: 1,
        backgroundColor: '#fff',
        color: '#111',
        borderLeft: 'none',
        borderTopRightRadius: '8px',
        borderBottomRightRadius: '8px',
        padding: '0 11px',
        height: '104%',
        fontSize: '1.2rem',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box'
      }}
    />
  </div>
  {phoneError && (
    <span style={{ color: 'red', fontSize: '1rem', marginTop: '15px',
    marginLeft: '20px',
     display: 'block' }}>
      {phoneError}
    </span>
  )}
</div>



        {/* OTP Section */}
        {blocked ? (
  <p className="resend-timer" style={{ color: 'red', textAlign: 'center' }}>
    🚫 Too many attempts. Try again in {blockTimer}s
  </p>
) : otpSent ? (
  <>
    <label style={{position:'relative',top:'13px'}}>Enter OTP</label>
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
        <p className="resend-timer below-timer">Expires in {resendTimer}s</p>
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
  className={`send-otp-btn ${!/^\d{10}$/.test(phone) || !isPhoneValid ? 'disabled-btn' : ''}`}>
  Send OTP
</button>


)}
{showLoginToast && (
  <div className="login-toast">
    ✅ Logged in successfully!
  </div>
)}


      </div>
 </FilmStripFrame>
      <p className="signup-text">
        Don't have an account? <Link className="link-text" to="/signup">Sign Up</Link>
      </p>
      
    </div>
   
  );
};

export default OTPLogin;
