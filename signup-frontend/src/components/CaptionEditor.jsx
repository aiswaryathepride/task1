import React, { useRef, useState, useEffect } from 'react';
import './CaptionEditor.css';

export default function CaptionEditor({ caption, setCaption }) {
  const editorRef = useRef(null);
  const [charCount, setCharCount] = useState(0);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  const formatText = (command) => {
    editorRef.current.focus();
    document.execCommand(command, false, null);
    updateFormats();
  };

  const updateFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    });
  };

  const updateCaptionFromEditor = () => {
    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText;

    if (text.length <= 200) {
      setCaption(html);
      setCharCount(text.length);
    } else {
      // Trim text without breaking formatting
      const range = document.createRange();
      const sel = window.getSelection();
      editorRef.current.innerText = text.substring(0, 200);
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  useEffect(() => {
  if (editorRef.current) {
    editorRef.current.innerHTML = caption || '';
    setCharCount(editorRef.current.innerText.length);
  }
  // 🔥 Empty dependency array means this runs only once on mount
}, []);


  useEffect(() => {
    const listener = () => updateFormats();
    document.addEventListener('selectionchange', listener);
    return () => document.removeEventListener('selectionchange', listener);
  }, []);

  return (
    <div className="caption-editor">
      <label className="caption-label">Post Caption (max 200 chars)</label>
      <div className="format-buttons">
        <button
          className={activeFormats.bold ? 'active' : ''}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatText('bold')}
        >
          <b>B</b>
        </button>
        <button
          className={activeFormats.italic ? 'active' : ''}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatText('italic')}
        >
          <i>I</i>
        </button>
        <button
          className={activeFormats.underline ? 'active' : ''}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatText('underline')}
        >
          <u>U</u>
        </button>
      </div>

      <div
        className="editor-box"
        contentEditable
        ref={editorRef}
        onInput={updateCaptionFromEditor}
        onClick={updateFormats}
        onKeyUp={updateFormats}
        spellCheck={false}
      />
      <p className="char-count">{charCount}/200</p>
    </div>
  );
}
