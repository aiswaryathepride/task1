import React, { useState } from 'react';
import CaptionEditor from '../components/CaptionEditor'; // ✅ Importing
import './ProfilePage.css'; // Make sure this exists or create it

export default function ProfilePage() {
  const [bio, setBio] = useState('');
  const [caption, setCaption] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    youtube: '',
    threads: ''
  });

  const [followerCounts, setFollowerCounts] = useState({
    instagram: '',
    youtube: '',
    threads: ''
  });

  const handleBioChange = (e) => {
    const text = e.target.value;
    if (text.length <= 200) {
      setBio(text);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">🎭 User Profile</h2>

        {/* Short Bio */}
        <div className="section">
          <label className="label">Short Bio (max 200 chars)</label>
          <textarea
            value={bio}
            onChange={handleBioChange}
            rows={3}
            className="input textarea"
            placeholder="Write a short intro about yourself..."
          />
          <p className="char-count">{bio.length}/200</p>
        </div>

        {/* ✅ Caption Editor (Integrated Component) */}
        <CaptionEditor caption={caption} setCaption={setCaption} />

        {/* Social Media & Follower Count */}
        <div className="section">
          {['instagram', 'youtube', 'threads'].map((platform) => (
            <div key={platform} className="social-block">
              <label className="label">{platform} Link</label>
              <input
                type="text"
                value={socialLinks[platform]}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, [platform]: e.target.value })
                }
                className="input"
                placeholder={`Enter your ${platform} URL`}
              />

              <label className="label">{platform} Followers Count</label>
              <input
                type="number"
                value={followerCounts[platform]}
                onChange={(e) =>
                  setFollowerCounts({
                    ...followerCounts,
                    [platform]: e.target.value
                  })
                }
                className="input"
                placeholder="Enter follower count"
              />
            </div>
          ))}
        </div>

        <button className="btn btn-submit">Save Changes</button>
      </div>
    </div>
  );
}
