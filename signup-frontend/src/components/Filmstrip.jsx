import React from 'react';
import './Filmstrip.css';

const FilmStripFrame = ({ children }) => {
  return (
    <div className="film-container">
      <div className="film-top-line">
      </div>
      <div className="film-middle">
        <div className="sprocket-vertical"></div>
        <div style={{ flex: 1,backgroundColor:'black',
          minWidth: '10px',
         }}></div>
        <div className="film-content">{children}</div>
        <div style={{ flex: 1,backgroundColor:'black',
          minWidth: '10px',
         }}></div>
        <div className="sprocket-vertical"></div>
      </div>
      <div className="film-bottom-line"></div>
    </div>
  );
};

export default FilmStripFrame;
