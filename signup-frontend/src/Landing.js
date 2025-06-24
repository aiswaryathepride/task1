import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
export default function Landing() {
  const navigate = useNavigate();

useEffect(() => {
  const sessionId = sessionStorage.getItem('loggedInUser');
  if (sessionId) {
    navigate('/home');
  }
}, []);
 useEffect(() => {
   document.body.style.overflow = 'hidden';
   document.documentElement.style.overflow = 'hidden'; // for <html>
 
   return () => {
     document.body.style.overflow = 'auto';
     document.documentElement.style.overflow = 'auto';
   };
 }, []);


  return (
    <div style={{
      minHeight: '100vh',
      height: '100vh',
      overflow: 'hidden',
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
          zIndex: 1,
          padding: '0 10px'
        }}
      >
Where cinema meets connection. Build your profile, showcase your talent, and roll into the film industry      </motion.p>

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
                 style={{
                   padding: '12px 24px',
                   fontSize: '1rem',
                   fontWeight: 'bold',
                   border: '2px solid #ffcc00',
                   borderRadius: '12px',
                   background: 'transparent',
                   color: '#ffcc00',
                   cursor: 'pointer',
                   transition: 'all 0.3s ease',
                   backdropFilter: 'blur(8px)',
                   minWidth: '200px',
                   textAlign: 'center'
                 }}
        >
          🎟️ Existing User Login
        </motion.button>

      
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/signup')}
                style={{
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
                }}
              >
          🎬 New User Sign Up
        </motion.button>
      </motion.div>
    </div>
  );
}
