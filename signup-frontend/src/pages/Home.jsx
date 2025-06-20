import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
   const loggedInUser = sessionStorage.getItem('loggedInUser');

    if (!loggedInUser) {
      navigate('/login');
      return;
    }

      const deviceId = localStorage.getItem('deviceId');
axios.post('http://localhost:3001/session/validate', {
  sessionId: loggedInUser,
  deviceId
})

      .then(res => {
        console.log('Session valid:', res.data);
      })
      .catch(() => {
        sessionStorage.removeItem('loggedInUser');
        navigate('/login');
      });
  }, [navigate]);

  const handleLogout = async () => {
  const sessionId = sessionStorage.getItem('loggedInUser');

  if (sessionId) {
   await axios.post('http://localhost:3001/logout', {
  sessionId,
  deviceId: localStorage.getItem('deviceId')
});
  }

  sessionStorage.removeItem('loggedInUser');
  navigate('/login');
};
  const handleBack = () => {
    navigate('/');
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
      <button
        onClick={handleBack}
        style={{
          marginTop: '20px',
          marginLeft: '10px',
          padding: '10px 20px',
          background: '#f5c518',
          color: '#000',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Back
      </button>
    </div>
  );
};

export default HomePage;
