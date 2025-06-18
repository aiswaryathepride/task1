import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function Register() {
  const [formData, setFormData] = useState({ username: '', fullname: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // Timer countdown
  useEffect(() => {
    if (otpSent && resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpSent, resendTimer]);

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    if (!formData.fullname.trim()) newErrors.fullname = "Full name is required.";
   if (!/^\+?\d{10,15}$/.test(formData.phone)) newErrors.phone = "Enter a valid phone number with country code (e.g. +91xxxxxxxxxx).";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleRegister = async e => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('http://localhost:3001/register', formData);
      setMessage(res.data.message);
      setOtpSent(true);
      setResendTimer(60);
    } catch {
      setMessage("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/verify', { phone: formData.phone, otp });
      setMessage(res.data.message);
    } catch {
      setMessage("Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:3001/resend-otp', { phone: formData.phone });
      setMessage("OTP resent!");
      setResendTimer(60);
    } catch {
      setMessage("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={formCardStyle}>
        <h2 style={titleStyle}>🎬 FILMROLL Sign Up</h2>

        {!otpSent ? (
          <form onSubmit={handleRegister}>
            <InputField label="Username" name="username" value={formData.username} onChange={handleChange} error={errors.username} placeholder="imyadu" />
            <InputField label="Full Name" name="fullname" value={formData.fullname} onChange={handleChange} error={errors.fullname} placeholder="Yadukrishnan"/>
            <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} placeholder="10-digit number" />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              style={submitButton}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </motion.button>
          </form>
        ) : (
          <>
            <InputField label="Enter OTP" name="otp" value={otp} onChange={e => setOtp(e.target.value)} />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVerifyOtp}
              disabled={loading}
              style={submitButton}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </motion.button>

            {resendTimer === 0 ? (
              <button onClick={handleResendOtp} disabled={loading} style={resendButton}>Resend OTP</button>
            ) : (
              <p style={{ marginTop: '10px', color: '#aaa' }}>Resend available in {resendTimer}s</p>
            )}
          </>
        )}

        {message && <p style={{ marginTop: '20px', color: '#f5c518', textAlign: 'center' }}>{message}</p>}
      </motion.div>
    </div>
  );
}

const InputField = ({ label, name, value, onChange, error, placeholder }) => (
  <div style={{ marginBottom: '16px' }}>
    <label>{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={inputStyle}
    />
    {error && <span style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>{error}</span>}
  </div>
);

// Styles
const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(to right, #141e30, #243b55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Poppins, sans-serif',
  padding: '20px'
};

const formCardStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '40px',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '400px',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  color: '#fff'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  marginTop: '6px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  backgroundColor: '#fff',
  color: '#000',
  fontFamily: 'inherit'
};

const submitButton = {
  marginTop: '10px',
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  backgroundColor: '#f5c518',
  border: 'none',
  color: '#000',
  fontWeight: '600',
  fontSize: '1rem',
  cursor: 'pointer'
};

const resendButton = {
  marginTop: '10px',
  background: 'none',
  border: 'none',
  color: '#f5c518',
  textDecoration: 'underline',
  cursor: 'pointer'
};

const titleStyle = {
  marginBottom: '30px',
  color: '#f5c518',
  textAlign: 'center'
};

export default Register;
