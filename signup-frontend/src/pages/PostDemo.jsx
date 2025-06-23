import React, { useState } from 'react';
import CaptionEditor from '../components/CaptionEditor.jsx';
import '../components/CaptionEditor.css';
import './ProfilePage.css';


export default function PostDemo() {
  const [tempCaptions, setTempCaptions] = useState({});
  const [posts, setPosts] = useState([
    {
      id: 1,
      caption: '<b>This is bold text</b> — FilmRoll is <i>here</i> to <u>shine</u>!',
      type: 'image',
      mediaUrl: 'https://via.placeholder.com/400x250.png?text=Actor+Headshot',
      isEditing: false
    },
    {
      id: 2,
      caption: 'Keep it <b>raw</b>. Keep it <i>real</i>.',
      type: 'video',
      mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      isEditing: false
    },
    {
      id: 3,
      caption: '<i>Dream it. Do it.</i> 🎬',
      type: null,
      mediaUrl: '',
      isEditing: false
    }
  ]);
  const handleCancel = (id) => {
  setTempCaptions((prev) => {
    const updated = { ...prev };
    delete updated[id];
    return updated;
  });
  toggleEdit(id);
};


const updateCaption = (id, newCaption) => {
  setPosts(posts.map(p =>
    p.id === id ? { ...p, caption: newCaption, isEditing: false } : p
  ));
  setTempCaptions((prev) => ({ ...prev, [id]: newCaption }));
};


  const handleDelete = (id) => {
    setPosts(posts.filter((p) => p.id !== id));
  };

  const toggleEdit = (id) => {
  setPosts(posts.map(p =>
    p.id === id ? { ...p, isEditing: !p.isEditing } : p
  ));

  // Initialize tempCaptions when entering edit mode
  if (!posts.find(p => p.id === id).isEditing) {
    setTempCaptions((prev) => ({
      ...prev,
      [id]: posts.find(p => p.id === id).caption
    }));
  }
};


  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">🎬 Post Preview Demo</h2>

        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="caption-display">
              {post.mediaUrl && post.type === 'image' && (
                <img
                  src={post.mediaUrl}
                  alt="post media"
                  style={{ width: '100%', borderRadius: '10px', marginBottom: '12px' }}
                />
              )}
              {post.mediaUrl && post.type === 'video' && (
                <video
                  src={post.mediaUrl}
                  controls
                  style={{ width: '100%', borderRadius: '10px', marginBottom: '12px' }}
                />
              )}

              {post.isEditing ? (
                <CaptionEditor
  caption={tempCaptions[post.id] || post.caption}
  setCaption={(newCaption) =>
    setTempCaptions((prev) => ({ ...prev, [post.id]: newCaption }))
  }
/>

              ) : (
                <div
                  dangerouslySetInnerHTML={{ __html: post.caption }}
                  style={{ marginBottom: '8px' }}
                />
              )}

             <div className="caption-actions">
  {post.isEditing ? (
    <div className="left-buttons">
      <button className="btn btn-edit" onClick={() => handleCancel(post.id)}>
        Cancel
      </button>
      <button
        className="btn btn-save"
        onClick={() => updateCaption(post.id, tempCaptions[post.id])}
      >
        Save
      </button>
    </div>
  ) : (
    <button className="btn btn-edit" onClick={() => toggleEdit(post.id)}>
      Edit
    </button>
  )}

  <button
    className="btn btn-cancel"
    onClick={() => handleDelete(post.id)}
  >
    Delete
  </button>
</div>



            </div>
          ))
        ) : (
          <p style={{ color: '#888' }}>No posts to show.</p>
        )}
      </div>
    </div>
  );
}
