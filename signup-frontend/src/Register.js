import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { color, motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import FilmStripFrame from './components/Filmstrip';
// --- Username format validation function ---
const validateUsername = (inputUsername) => {
  const trimmed = (inputUsername || '').trim();

  if (/\s/.test(trimmed)) return 'Username cannot contain spaces.';
  if (trimmed.length < 3) return 'Username must be at least 3 characters long.';
  if (trimmed.length > 15) return 'Username cannot exceed 15 characters.';
  if (!/^[a-zA-Z0-9]/.test(trimmed)) return 'Username must start with a letter or a digit.';
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) return 'Username can only contain letters, digits, and underscores.';

  return '';
};
const deviceId = localStorage.getItem('deviceId') || 'browser-default'; // fallback

function Register() {
 const navigate = useNavigate();
 
  useEffect(() => {
   document.body.style.overflow = 'hidden';
   document.documentElement.style.overflow = 'hidden'; // for <html>
 
   return () => {
     document.body.style.overflow = 'auto';
     document.documentElement.style.overflow = 'auto';
   };
 }, []);

   // Initialize formData from sessionStorage or use default empty values
   const [formData, setFormData] = useState(() => {
     const returningFromTnC = sessionStorage.getItem('returningFromTnC') === 'true';
     if (returningFromTnC) {
       const saved = sessionStorage.getItem('registerFormData');
       return saved ? JSON.parse(saved) : {
         username: '',
         phone: '',
         termsAccepted: false
       };
     }
     // Clear any stale data if not returning from T&C
     sessionStorage.removeItem('registerFormData');
     return {
       username: '',
       fullname: '',
       phone: '',
       termsAccepted: false
     };
   });
   useEffect(() => {
     sessionStorage.removeItem('returningFromTnC');
   }, []);

  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
const [otpRefs] = useState(() => Array(6).fill().map(() => React.createRef()));
const [otpSuccess, setOtpSuccess] = useState(false);
const [otpExpired, setOtpExpired] = useState(false);
const [otpErrorMsg, setOtpErrorMsg] = useState('');
const [showTakenMessage, setShowTakenMessage] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [resendTimer, setResendTimer] = useState(60);
  const [availability, setAvailability] = useState({
    usernameExists: false,
    phoneExists: false
  });
const [focusedIndex, setFocusedIndex] = useState(null); // New line
const [manualResend, setManualResend] = useState(false);


    // Save formData to sessionStorage when the component unmounts or before navigation
    useEffect(() => {
      const handleBeforeUnload = () => {
        sessionStorage.setItem('registerFormData', JSON.stringify(formData));
      };
  
      window.addEventListener('beforeunload', handleBeforeUnload);
  
      // This cleanup runs when the component unmounts (e.g., navigating away)
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        // Save data before unmounting, unless OTP has been sent
        if (!otpSent) {
          sessionStorage.setItem('registerFormData', JSON.stringify(formData));
        } else {
          // If OTP is sent, clear the stored data as the form state has progressed
          sessionStorage.removeItem('registerFormData');
        }
      };
    }, [formData, otpSent]); 
  // Timer countdown
 useEffect(() => {
  if (otpSent && resendTimer > 0) {
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setOtpExpired(true); // ✅ This line is crucial
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }
}, [otpSent, resendTimer]);


  // Input validation
  const validate = () => {
    const newErrors = {};
    const usernameError = validateUsername(formData.username);
    if (usernameError) newErrors.username = usernameError;
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Enter a valid 10-digit Phone number.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Input change handler
  const handleChange = e => {
  const { name, value, type, checked } = e.target;

  // Sanitize input
  const inputValue = type === 'checkbox' ? checked : (name === 'phone' ? value.replace(/\D/g, '') : value);

  // Enforce max length on username input
  if (name === 'username' && inputValue.length > 15) {
    setErrors(prev => ({ ...prev, username: "Username cannot exceed 15 characters." }));
    return; // Prevent update
  }

  setFormData(prev => ({ ...prev, [name]: inputValue }));

  // Set errors (optional: only for username)
  setErrors(prev => ({
    ...prev,
    [name]: name === 'username' ? validateUsername(inputValue) : ''
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
        setShowTakenMessage(true);
        setSuggestions([]); // hide suggestions initially
      
        // Wait 2 seconds then show suggestions
        setTimeout(async () => {
          const suggRes = await axios.get(`http://localhost:3001/suggest-usernames`, {
            params: { partialUsername: formData.username }
          });
          setSuggestions(suggRes.data.suggestions || []);
          setShowTakenMessage(false);
        }, 2000);
      } else {
        setSuggestions([]);
        setShowTakenMessage(false);
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
useEffect(() => {
  if (!localStorage.getItem('deviceId')) {
    const newDeviceId = crypto.randomUUID();
    localStorage.setItem('deviceId', newDeviceId);
  }
}, []);

  // Verify OTP
 const handleVerifyOtp = async () => {
  setLoading(true);
  const joinedOtp = otpArray.join('');
  const formattedPhone = formData.phone.startsWith('+') ? formData.phone : '+91' + formData.phone;
  const deviceId = localStorage.getItem('deviceId'); // or generate if not present

  try {
    const res = await axios.post('http://localhost:3001/verify-register', {
      phone: formattedPhone,
      otp: joinedOtp,
      deviceId
    });

    setMessage(res.data.message);

    if (res.data.sessionId) {
      // ✅ Session success, create user & redirect
      await axios.post('http://localhost:3001/signup', {
        username: formData.username,
        phone: formattedPhone
      });

      // ✅ Save session in sessionStorage
      localStorage.setItem('loggedInUser', res.data.sessionId);
      localStorage.setItem('loggedInPhone', res.data.phone);

      setToastMsg('✅ Account created! Redirecting to home...');
      setTimeout(() => navigate('/home'), 3000);
    } else {
      setOtpSuccess(false);
      setOtpErrorMsg("Invalid OTP or session error.");
    }
  } catch {
    setOtpSuccess(false);
    setOtpErrorMsg("Invalid OTP. Try again.");
  } finally {
    setLoading(false);
  }
};

const handleOTPChange = (e, index) => {
  const value = e.target.value;
  if (!/^\d?$/.test(value)) return;

  const leftFilled = otpArray.slice(0, index).every((digit) => digit !== '');
  if (!leftFilled && value) return;

  const updated = [...otpArray];
  updated[index] = value;
  setOtpArray(updated);
  setOtpErrorMsg('');

  if (value && index < 5) {
    otpRefs[index + 1].current?.focus();
  }
};
const handleOTPKeyDown = (e, index) => {
  if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
    otpRefs[index - 1].current?.focus();
  }
};

const handleResendOtp = async () => {
  setLoading(true);
  try {
    await axios.post('http://localhost:3001/resend-otp', { phone: '+91' + formData.phone });
    setOtpArray(['', '', '', '', '', '']);
    setOtpExpired(false);
    setOtpSuccess(false);
    setResendTimer(60);
    setManualResend(true); // ✅ Only this!
    otpRefs[0].current?.focus();
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
        <FilmStripFrame>
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
              maxLength='15'
            />
          
<div style={{ minHeight: '40px', marginTop: '-36px', marginBottom: '6px' }}>
 {!errors.username && availability.usernameExists && (
  showTakenMessage ? (
    <span style={{ color: '#ff6b6b', fontSize: '0.95rem' ,position:'absolute',
      marginTop:'15px'
    }}>Username exists</span>
  ) : (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      lineHeight: '1.2',
      fontSize: '0.95rem',
      color: '#ffcc00',
      height: '32px',
      overflow: 'visible',
      maxHeight: '2.4em',
      marginTop: '15px',
      cursor:'pointer',
      textAlign:'center',
      position:'absolute'
    }}>
      {suggestions.map((sugg, index) => (
        <span key={index}
        onClick={() => {
        setFormData(prev => ({ ...prev, username: sugg }));
        setSuggestions([]);
        setErrors(prev => ({ ...prev, username: '' }));
      }}>
        {sugg}{index !==suggestions.length-1 && ' , '}</span>
      ))}
    </div>
  )
)}

</div>



            {errors.phone && (
  <span style={{ color: '#ff6b6b', fontSize: '0.95rem' }}>{errors.phone}</span>
)}



            <div style={{ marginBottom: '20px', width: '100%' }}>
  <label>Phone <span style={{ color: 'red' }}>*</span></label>
  <div style={{
    display: 'flex',
    alignItems: 'center',
    marginTop: '6px',
    height: '46px'  // 👈 Match height
  }}>
    <div style={{
      backgroundColor: '#151716',
        color: '#fff',
        border:' 1px solid yellow',
      borderRight: 'none',
      borderTopLeftRadius: '8px',
      borderBottomLeftRadius: '8px',
      padding: '0px 11px',
      maxHeight:'47px',
      height: '99%',               // 👈 Match height
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
    outline: 'none',
    fontSize: '1rem'
  }}
/>


  </div>
 <div style={{ height: '16px', marginTop: '-8px' }}>
     {errors.phone && (
       <span style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>{errors.phone}</span>
     )}
   </div>


{/* Tightened space for duplicate phone message */}
  <div style={{ height: '16px', marginTop: '2px' }}>
    {!errors.phone && /^\d{10}$/.test(formData.phone) && availability.phoneExists && (
     <span style={{ color: '#ff6b6b', fontSize: '0.95rem' }}>Number already registered</span>

    )}
  </div>

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
                I accept the <Link to="/terms" 
                onClick={()=>sessionStorage.setItem('returningFromTnC','true')}
                style={{ color: '#f5c518', textDecoration: 'none' }}>Terms & Conditions</Link>
              </label>
            </div>
            {touched && !formData.termsAccepted && (
              <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '-12px' }}>
                Accept the terms and conditions to continue
              </p>
            )}

            <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  type="submit"
  disabled={
    loading ||
    availability.usernameExists ||
    availability.phoneExists ||
    !formData.termsAccepted ||
   !(formData.username || '').trim() ||
    validateUsername(formData.username) !== '' ||
    !/^\d{10}$/.test(formData.phone)
  }
  style={{
    ...submitButton,
    backgroundColor:
      loading ||
      availability.usernameExists ||
      availability.phoneExists ||
      !formData.termsAccepted ||
    !(formData.username || '').trim() ||
      validateUsername(formData.username) !== '' ||
      !/^\d{10}$/.test(formData.phone)
        ? '#ccc'
        : '#f5c518',
    cursor:
      loading ||
      availability.usernameExists ||
      availability.phoneExists ||
      !formData.termsAccepted ||
     !(formData.username || '').trim()||
      validateUsername(formData.username) !== '' ||
      !/^\d{10}$/.test(formData.phone)
        ? 'not-allowed'
        : 'pointer'
  }}
>Send OTP
 
</motion.button>
{loading && (
  <div style={{ fontColor:'Yellow',marginTop: '8px', fontSize: '0.85rem', color: '#888',textAlign:'center' }}>
    Sending OTP...
  </div>
)}
          </form>
        ) : (
          <>
  <label style={{ position: 'relative', top: '11px',
    textAlign:'center',marginLeft:'100px',fontColor:'yellow',fontSize:'1rem'
   }}>Enter OTP</label>
<div style={otpBoxContainer}>
  {otpArray.map((digit, index) => (
  <input
  key={index}
  type="text"
  maxLength="1"
  value={digit}
  onChange={(e) => handleOTPChange(e, index)}
  onKeyDown={(e) => handleOTPKeyDown(e, index)}
  ref={(el) => (otpRefs[index].current = el)}
  disabled={otpExpired}
  style={{
    ...otpInputStyle,
    ...(focusedIndex === index && {
      borderColor: '#f5c518',
      boxShadow: '0 0 6px rgba(245, 197, 24, 0.3)',
      transform: 'scale(1.1)',
      transition: 'all 0.3s ease'
    })
  }}
  onFocus={() => setFocusedIndex(index)}
  onBlur={() => setFocusedIndex(null)}
/>

  ))}
</div>


  {!otpSuccess && otpErrorMsg &&(
    <p className="error-message" style={{
      color: 'red',
      marginTop: '10px',
      marginBottom: '10px',
      fontSize: '1.1rem',
      width: '100%',
      fontWeight: 'bold',
      textAlign: 'center'
    }}>
      {otpErrorMsg}
    </p>
  )}

  <div className="otp-actions" style={{ textAlign: 'center' }}>
    {!otpExpired ? (
  <>
    <button
      onClick={handleVerifyOtp}
      disabled={otpArray.some((digit) => digit === '')}
      style={
        otpArray.some((digit) => digit === '')
          ? disabledButton
          : otpActionButton
      }
    >
      Verify OTP
    </button>
    {!otpSuccess && (
      <p style={resendTimerText}>
        Expires in {resendTimer}s
      </p>
    )}
  </>
) : (
  <button
    onClick={() => {
      setOtpArray(['', '', '', '', '', '']);
      setOtpExpired(false);
      handleResendOtp();
    }}
    style={otpActionButton}
  >
    Resend OTP
  </button>
)}
</div>
  {otpSuccess && (
    <p className="success-message" style={{ textAlign: 'center', color: 'lightgreen' }}>
      ✅ OTP Verified Successfully!
    </p>
  )}
</>

        )}

        {message && (
          <p style={{ marginTop: '20px', color: '#f5c518', textAlign: 'center' }}>{message}</p>
        )}
        <p style={{ marginTop: '50px', fontSize: '0.9rem', color: '#ccc', textAlign: 'center' }}>
  Already have an account ?{' '}
  <Link to="/login" style={{ color: '#f5c518', fontWeight: 'bold', textDecoration: 'none' }}>
    Login
  </Link>
</p>

      </motion.div>
      </FilmStripFrame>
    </div>
  
  );
}

// Input Component
const InputField = ({ label, name, value, onChange, error, placeholder }) => (
  <div style={{ marginBottom: '16px' }}>
    <label>{label} <span style={{ color: 'red' }}>*</span></label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={inputStyle}
    />
    <div style={{ height: '16px', marginTop: '2px' }}>
    {error && <span style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>{error}</span>}</div>
  </div>
);

// Styles
const containerStyle = {
  height: '100dvh',
  minWidth:'150dvh', // ✅ handles mobile + desktop
  maxHeight: '200dvh', // ✅ ensures full height
  overflow: 'hidden', // ✅ removes scroll
  backgroundColor: '#151716',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Poppins, sans-serif',
  padding: '20px',
  boxSizing: 'border-box'
};

const formCardStyle = {
  backgroundColor: '#2d2f2e',
  padding: '40px',
  borderRadius: 'none',
  width: '90%',
  maxWidth: '400px', // ✅ wider than 400px
  backdropFilter: 'blur(8px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  color: '#fff',
  boxSizing: 'border-box',
  maxHeight:'565px',
  height:'565px'
};


const inputStyle = {
  width: '100%',
  height: '47px',
  padding: '10px 12px',
  marginTop: '6px',
  borderRadius: '8px',
  fontSize: '1rem',
  outline: 'none',
  backgroundColor: '#151716',
  border:' 1px solid yellow',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  color: '#fff',
};

const submitButton = {
  marginTop: '10px',
  width: '40%',             // 🔹 same width
  padding: '10px 12px',     // 🔹 same height and spacing
  borderRadius: '8px',
  backgroundColor: '#f5c518',
  border: 'none',
  color: '#000',
  fontWeight: '600',
  fontSize: '0.95rem',
  cursor: 'pointer',
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto'
};

const resendButton = {
  ...submitButton,                 // 🔁 inherit base style
  backgroundColor: 'transparent', // ✨ optional: if you want it different
  color: '#f5c518',
  textDecoration: 'underline',
  fontWeight: '500',
  border: '1px solid #f5c518'   // optional: give it a border
};
const titleStyle = {
  marginBottom: '20px 0',
  color: '#f5c518',
  textAlign: 'center'
};
const otpBoxContainer = {
  display: 'flex',
  justifyContent: 'center',
  gap: '10px',
  margin: '20px 0',
};

const otpInputStyle = {
  width: '40px',
  height: '50px',
  fontSize: '1.5rem',
  textAlign: 'center',
  borderRadius: '8px',
  border: '1px solid yellow',
  backgroundColor: '#151716',
  color: '#fff',
  outline: 'none',
};

const otpInputFocusStyle = {
  borderColor: '#fff000',
};

const otpActionButton = {
  backgroundColor: 'yellow',
  fontSize:'1rem',
  color: 'black',
  width:'50%',
  height:'45px',
  fontWeight: 'bold',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  marginTop: '12px',
};

const disabledButton = {
  ...otpActionButton,
  backgroundColor: '#555',
  cursor: 'not-allowed',
  opacity: 0.6,
};

const resendTimerText = {
  color: '#ffcc00',
  marginTop: '10px',
  textAlign: 'center',
};

export default Register;