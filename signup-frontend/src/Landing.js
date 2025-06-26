import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import clapAnimation from '../src/animations/filmClap.json' // ⬅️ make sure the path matches

export default function Landing() {
  const navigate = useNavigate();
    const [showLanding, setShowLanding] = useState(false);
const [isChecking, setIsChecking] = useState(true); // NEW
const [isSessionChecked, setIsSessionChecked] = useState(false); // Controls rendering

  // Generate deviceId if not already stored
  useEffect(() => {
    if (!localStorage.getItem('deviceId')) {
      const newDeviceId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('deviceId', newDeviceId);
    }
  }, []);

  // ✅ Validate session on page load using localStorage now
 useEffect(() => {
  const sessionId = localStorage.getItem('loggedInUser');
  const deviceId = localStorage.getItem('deviceId');

  if (sessionId && deviceId) {
    fetch('https://testing-one-3rk1.onrender.com/session/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, deviceId }),
    })
      .then(res => res.json())
      .then(data => {
       if (data.message === 'Session valid') {
  setTimeout(() => {
    navigate('/home');
    setIsSessionChecked(true); // ✅ move it here
  }, 2400); // match animation duration
} else {
  localStorage.removeItem('loggedInUser');
  localStorage.removeItem('loggedInPhone');
  setShowLanding(true);
  setIsSessionChecked(true); // ✅ allow rendering landing
}


      })
      .catch(err => {
  localStorage.removeItem('loggedInUser');
  localStorage.removeItem('loggedInPhone');
  setShowLanding(true);
  setIsSessionChecked(true); // ✅ allow landing
})


      .finally(() => setIsChecking(false)); // Done checking
  } else {
    setShowLanding(true);
    setIsSessionChecked(true);
  }
}, []);


  // Lock scroll on this page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

if (!isSessionChecked) {
  return (
    <div style={{ 
      height: '100vh', width: '100vw', 
      backgroundColor: '#000', 
      display: 'flex', justifyContent: 'center', alignItems: 'center' ,flexDirection:'column'
    }}><div>
      <Lottie animationData={clapAnimation} style={{ width: 250, height: 250 }} />
    </div>
    <div style={{ fontSize: '3rem',
          letterSpacing: '4px',
          color: '#ffcc00',
          textShadow: '0 0 15px rgba(255, 204, 0, 0.4)',
          zIndex: 1,
          textAlign: 'center',
          display:'flex',
          maxWidth:'500px'
          }}>
     Where cinema meets connection
    </div>
    </div>
  );
}


  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f, #1a1a1a)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Poppins, sans-serif',
      padding: '20px',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, #ffcc00 0%, transparent 70%)',
        top: '-200px',
        left: '-200px',
        opacity: 0.05,
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>

      <motion.h1
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 70, delay: 0.2 }}
        style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          letterSpacing: '4px',
          color: '#ffcc00',
          textShadow: '0 0 15px rgba(255, 204, 0, 0.4)',
          zIndex: 1,
          textAlign: 'center'
        }}
      >
        🎬 FILMROLL
      </motion.h1>

      <motion.p
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          fontSize: '1.1rem',
          maxWidth: '600px',
          color: '#ccc',
          marginTop: '20px',
          textAlign: 'center',
          zIndex: 1
        }}
      >
        Where cinema meets connection. Build your profile, showcase your talent, and roll into the film industry.
      </motion.p>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          marginTop: '50px',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          zIndex: 1
        }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login')}
          style={buttonStyle}
        >
          🎟️ Existing User Login
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/signup')}
          style={buttonStyle}
        >
          🎬 New User Sign Up
        </motion.button>
      </motion.div>
    </div>
  );
}

const buttonStyle = {
  padding: '12px 24px',
  fontSize: '1rem',
  fontWeight: 'bold',
  border: 'none',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #ffcc00, #ffdf80)',
  color: '#000',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 20px rgba(255, 204, 0, 0.3)',
  minWidth: '200px',
  textAlign: 'center'
};
