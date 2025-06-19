// src/pages/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('loggedInUser'); // 🔐 Clear session
    navigate('/login');
  };

  return (
    <div style={{ textAlign: 'center', paddingTop: '50px' }}>
      <h1>🎉 Welcome to FilmRoll</h1>
      <p>You have successfully logged in.</p>
      <button
        onClick={handleLogout}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          background: '#f5c518',
          color: '#000',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default HomePage;
