import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import Register from './Register';
import OTPLogin from './pages/LoginPage';
import HomePage from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Register />} />
       <Route path="/login" element={<OTPLogin/>} />
       <Route path="/home" element={<HomePage/>} />
      </Routes>
    </Router>
  );
}

export default App;
