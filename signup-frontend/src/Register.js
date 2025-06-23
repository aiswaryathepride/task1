import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

// --- Username format validation function ---
const validateUsername = (inputUsername) => {
  if (!inputUsername.trim()) return 'Username is required.';
  const trimmed = inputUsername.trim();

  if (/\s/.test(trimmed)) return 'Username cannot contain spaces.';
  if (trimmed.length < 3) return 'Username must be at least 3 characters long.';
  if (trimmed.length > 15) return 'Username cannot exceed 15 characters.';
  if (!/^[a-zA-Z0-9]/.test(trimmed)) return 'Username must start with a letter or a digit.';
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) return 'Username can only contain letters, digits, and underscores.';

  return '';
};
const deviceId = localStorage.getItem('deviceId') || 'browser-default'; // fallback

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    phone: '',
    termsAccepted: false
  });

  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [resendTimer, setResendTimer] = useState(60);
  const [availability, setAvailability] = useState({
    usernameExists: false,
    phoneExists: false
  });

  const navigate = useNavigate();

  // Timer countdown
  useEffect(() => {
    if (otpSent && resendTimer > 0) {
      const timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [otpSent, resendTimer]);

  // Input validation
  const validate = () => {
    const newErrors = {};
    const usernameError = validateUsername(formData.username);
    if (usernameError) newErrors.username = usernameError;
    if (!formData.fullname.trim()) newErrors.fullname = "Full name is required.";
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Enter a valid 10-digit Indian phone number.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Input change handler
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : (name === 'phone' ? value.replace(/\D/g, '') : value);
    setFormData(prev => ({ ...prev, [name]: inputValue }));
    setErrors(prev => ({
      ...prev,
      [name]: name === 'username' ? validateUsername(value) : ''
    }));
  };

  // Username availability check
  useEffect(() => {
  const checkUsername = async () => {
    const usernameError = validateUsername(formData.username);
    if (!formData.username.trim() || usernameError) {
      setAvailability(prev => ({ ...prev, usernameExists: false }));
      setSuggestions([]); // 🧹 clear suggestions
      return;
    }

    try {
      const res = await axios.post('http://localhost:3001/check-availability', {
        username: formData.username, phone: ''
      });
      const isTaken = res.data.usernameExists;
      setAvailability(prev => ({ ...prev, usernameExists: isTaken }));

      // 🧠 If taken, fetch suggestions
      if (isTaken) {
        const suggRes = await axios.get(`http://localhost:3001/suggest-usernames`, {
          params: { partialUsername: formData.username }
        });
        setSuggestions(suggRes.data.suggestions || []);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Username check error:', error);
      setSuggestions([]);
    }
  };

  const delay = setTimeout(checkUsername, 500);
  return () => clearTimeout(delay);
}, [formData.username]);


  // Phone availability check
  useEffect(() => {
    if (!/^\d{10}$/.test(formData.phone)) {
      setAvailability(prev => ({ ...prev, phoneExists: false }));
      return;
    }

    const checkPhone = async () => {
      try {
        const res = await axios.post('http://localhost:3001/check-availability', {
          username: '', phone: '+91' + formData.phone
        });
        setAvailability(prev => ({ ...prev, phoneExists: res.data.phoneExists }));
      } catch (error) {
        console.error('Phone check error:', error);
      }
    };

    const delay = setTimeout(checkPhone, 500);
    return () => clearTimeout(delay);
  }, [formData.phone]);

  // Send OTP
  const handleRegister = async e => {
    e.preventDefault();
    setTouched(true);
    if (!validate()) return;
    if (!formData.termsAccepted) {
      setMessage("You must accept the terms and conditions.");
      return;
    }

    if (availability.usernameExists || availability.phoneExists) {
      setMessage("Username or phone already used.");
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(
  'http://localhost:3001/register',
  { phone: '+91' + formData.phone },
  { headers: { 'x-device-id': deviceId } }
);
     setMessage(res.data.message);
      setOtpSent(true);
      setResendTimer(60);
    } catch {
      setMessage("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    setLoading(true);
    const formattedPhone = formData.phone.startsWith('+') ? formData.phone : '+91' + formData.phone;
    try {
      const res = await axios.post('http://localhost:3001/verify-register', {
        phone: formattedPhone, otp
      });
      setMessage(res.data.message);
      if (res.data.message === 'OTP verified successfully.')
       setToastMsg('✅ Account created! Redirecting to login...');
        setTimeout(() => {navigate('/login');}, 3500);
      await axios.post('http://localhost:3001/signup', {
  fullName: formData.fullname,
  username: formData.username,
  phone: formattedPhone
});

    } catch {
      setMessage("Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
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

  const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // Auto close after 3s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      background: '#323232',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      zIndex: 9999,
      fontSize: '0.95rem',
      transform: 'translateX(-50%)'
    }}>
      {message}
    </div>
  );
};

  return (
    <div style={containerStyle}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={formCardStyle}
      >
        <h2 style={titleStyle}>🎬 FILMROLL Sign Up</h2>

        {!otpSent ? (
          <form onSubmit={handleRegister}>
            <InputField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="Enter Username"
            />
            {!errors.username && formData.username && (
              availability.usernameExists
                ? <p style={{ color: 'red', marginTop: '-12px' }}>❌ Username already taken</p>
                
                : <p style={{ color: 'lightgreen', marginTop: '-12px' }}>✅ Username available</p>
            )}
            {availability.usernameExists && suggestions.length > 0 && (
  <div style={{ marginTop: '-5px', marginBottom: '15px' }}>
    <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#ccc' }}>Available suggestions:</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {suggestions.map((sugg, index) => (
        <span
          key={index}
          onClick={() => setFormData(prev => ({ ...prev, username: sugg }))}
          style={{
            cursor: 'pointer',
            color: '#61dafb',
            fontSize: '0.9em',
            whiteSpace: 'nowrap'
          }}
        >
          {sugg}
        </span>
      ))}
    </div>
  </div>
)}


            {errors.phone && (
  <span style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>{errors.phone}</span>
)}




            <InputField
              label="Full Name"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              error={errors.fullname}
              placeholder="Enter Full Name"
            />

            <div style={{ marginBottom: '16px', width: '100%' }}>
  <label>Phone</label>
  <div style={{
    display: 'flex',
    alignItems: 'center',
    marginTop: '6px',
    height: '46px'  // 👈 Match height
  }}>
    <div style={{
      backgroundColor: '#fff',
      color: '#000',
      border: '1px solid #ccc',
      borderRight: 'none',
      borderTopLeftRadius: '8px',
      borderBottomLeftRadius: '8px',
      padding: '0 12px',
      height: '100%',               // 👈 Match height
      display: 'flex',
      alignItems: 'center'
    }}>
      +91
    </div>
    <input
  type="tel"
  name="phone"
  value={formData.phone}
  onChange={handleChange}
  maxLength="10"
  placeholder="10-digit number"
  onPaste={(e) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted.startsWith('+91')) e.preventDefault();
  }}
  style={{
    ...inputStyle,
    flex: 1,
    height: '47px', // 👈 Fix the height here explicitly
    padding: '10px 12px',
    marginTop: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeft: 'none',
    boxSizing: 'border-box',
    fontSize: '1rem'
  }}
/>


  </div>
  {errors.phone && (
  <span style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>{errors.phone}</span>
)}


{!errors.phone && /^\d{10}$/.test(formData.phone) && (
  availability.phoneExists ? (
    <p style={{ color: 'red', marginTop: '2px' }}>❌ Phone already registered</p>
  ) : (
    <p style={{ color: 'lightgreen', marginTop: '2px' }}>✅ Phone available</p>
  )
)}

  {/* Availability/Error messages stay the same */}
</div>

            {/* Terms & Conditions */}
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="termsAccepted"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                style={{ marginRight: '10px' }}
              />
              <label htmlFor="termsAccepted" style={{ color: '#fff', fontSize: '0.95rem' }}>
                I accept the <Link to="/terms" style={{ color: '#f5c518', textDecoration: 'underline' }}>terms and conditions</Link>.
              </label>
            </div>
            {touched && !formData.termsAccepted && (
              <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '-12px' }}>
                You must accept the terms and conditions to continue.
              </p>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={
                loading || availability.usernameExists || availability.phoneExists || !formData.termsAccepted
              }
              style={{
                ...submitButton,
                backgroundColor:
                  availability.usernameExists || availability.phoneExists || !formData.termsAccepted
                    ? '#ccc'
                    : '#f5c518',
                cursor:
                  availability.usernameExists || availability.phoneExists || !formData.termsAccepted
                    ? 'not-allowed'
                    : 'pointer'
              }}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </motion.button>
          </form>
        ) : (
          <>
            <InputField
              label="Enter OTP"
              name="otp"
              value={otp}
              onChange={e => setOtp(e.target.value)}
            />
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
              <button onClick={handleResendOtp} disabled={loading} style={resendButton}>
                Resend OTP
              </button>
            ) : (
              <p style={{ marginTop: '10px', color: '#aaa' }}>
                Resend available in {resendTimer}s
              </p>
            )}
          </>
        )}

        {message && (
          <p style={{ marginTop: '20px', color: '#f5c518', textAlign: 'center' }}>{message}</p>
        )}
        <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#ccc', textAlign: 'center' }}>
  Already have an account ?{' '}
  <Link to="/login" style={{ color: '#f5c518', fontWeight: 'bold', textDecoration: 'underline' }}>
    Login here
  </Link>
</p>

      </motion.div>
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}
    </div>
  );
}

// Input Component
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