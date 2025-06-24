import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import Register from './Register';
import OTPLogin from './pages/LoginPage';
import HomePage from './pages/Home';
import ProfilePage from './pages/ProfilePage';
import PostDemo from './pages/PostDemo';
import TermsPage from './TermsPage';
import FilmStripFrame from './components/Filmstrip';


function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/login" element={<OTPLogin/>} />
      <Route path="/home" element={<HomePage/>} />
      <Route path="/edit-profile" element={<ProfilePage />} />
      <Route path="/demo" element={<PostDemo/>} />
      <Route path ="/terms" element={<TermsPage />} />
      <Route path="*" element={<FilmStripFrame/>} />
      </Routes>
    </Router>
  );
}

export default App;
