import React, { useState, useRef } from 'react';
import './LoginPage.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const OTPLogin = () => {
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


  const handleSendOTP = async () => {
  // block resend if limit reached
  if (resendCount >= 3) {
    setOtpSent(false);        // back to phone screen
    setBlocked(true);         // show "blocked" UI
    setBlockTimer(30);        // 30s block
    const blockInterval = setInterval(() => {
      setBlockTimer((prev) => {
        if (prev <= 1) {
          clearInterval(blockInterval);
          setBlocked(false);
          setResendCount(0); // reset tries
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return;
  }

  try {
   const res = await axios.post('http://localhost:3001/register', { phone });
    alert(res.data.message);
    setOtpExpired(false);
    setOtpSuccess(false);
    setOtpSent(true);
    setResendCount(prev => prev + 1); // count resend
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
  } catch (err) {
    alert(err.response?.data?.message || 'Error sending OTP');
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
      const res = await axios.post('http://localhost:3001/verify', {
        phone,
        otp,
      });

      setOtpSuccess(true);
   setTimeout(() => {
  navigate('/home'); // or navigate('/homepage') etc.
}, 2000);
    } catch (err) {
      setOtpSuccess(false);
      alert(err.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="login-container">
      <h1 className="filmroll-title">FilmRoll</h1>
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
