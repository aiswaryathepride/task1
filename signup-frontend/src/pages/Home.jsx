import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';

const HomePage = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser'); // ✅ localStorage
    const deviceId = localStorage.getItem('deviceId');

    if (!loggedInUser) {
      navigate('/login');
      return;
    }

    axios.post('http://localhost:3001/session/validate', {
      sessionId: loggedInUser,
      deviceId
    })
      .then(res => console.log('Session valid:', res.data))
      .catch(() => {
        localStorage.removeItem('loggedInUser'); // ✅ clear localStorage
        localStorage.removeItem('loggedInPhone');
        navigate('/login');
      });
  }, [navigate]);

  const handleLogout = async () => {
    const sessionId = localStorage.getItem('loggedInUser');
    if (sessionId) {
      await axios.post('http://localhost:3001/logout', {
        sessionId,
        deviceId: localStorage.getItem('deviceId')
      });
    }
    localStorage.removeItem('loggedInUser'); // ✅ logout cleanup
    localStorage.removeItem('loggedInPhone');
    setShowLogoutPrompt(false);
    setShowSuccess(true);
    setTimeout(() => navigate('/login'), 2000);
  };

  const handleBack = () => navigate('/');

  return (
    <div className="home-container">
      {/* 👤 Profile Icon */}
      <div className="profile-icon-container" style={{ position: 'absolute' }}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
          alt="Default Profile"
          className="profile-icon"
          onClick={() => setShowDropdown(prev => !prev)}
          title="Profile Menu"
        />

        {showDropdown && (
          <div className="dropdown-menu">
            <div onClick={() => navigate('/profile')} className="dropdown-item">👤 View Profile</div>
            <div onClick={() => navigate('/edit-profile')} className="dropdown-item">✏️ Edit Profile</div>
            <div onClick={() => navigate('/home')} className="dropdown-item">🏠 Home</div>
            <div className="dropdown-item">⭐</div>
            <div onClick={() => setShowLogoutPrompt(true)} className="dropdown-item">🚪 Logout</div>
          </div>
        )}
      </div>

      <h1 className="home-title">🎉 Welcome to FilmRoll</h1>
      <p className="home-subtitle">You have successfully logged in.</p>

      {/* 🔐 Logout Confirmation Modal */}
      {showLogoutPrompt && (
        <div className="logout-overlay">
          <div className="logout-box">
            <h2>Are you sure you want to log out?</h2>
            <div className="logout-actions">
              <button className="red-btn" onClick={handleLogout}>Yes, Logout</button>
              <button className="blue-btn" onClick={() => setShowLogoutPrompt(false)}>No, Stay Here</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Success Toast */}
      {showSuccess && (
        <div className="logout-toast">
          ✅ Logout successful!
        </div>
      )}
    </div>
  );
};

export default HomePage;
