import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function HeadshotUploader({ headshot, onHeadshotChange, disabled, error }) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Generate preview blob URL safely
  useEffect(() => {
    if (!headshot) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(headshot);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [headshot]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    // Check mime type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, or WEBP).');
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('The file is too large. Maximum size is 10MB.');
      return;
    }

    onHeadshotChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (disabled) return;
    onHeadshotChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerUpload = () => {
    if (disabled) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="headshot-uploader-group">
      <div className="uploader-header">
        <label className="field-label" htmlFor="headshot-file-input">
          Your Headshot
          <span className="field-required">*</span>
        </label>
        <span className="uploader-badge">High Resolution Recommended</span>
      </div>

      <input
        ref={fileInputRef}
        id="headshot-file-input"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={handleFileInput}
        disabled={disabled}
        className="visually-hidden"
        aria-describedby="headshot-error"
      />

      {!headshot ? (
        // Empty Upload Zone
        <div
          className={`dropzone ${isDragging ? 'dropzone--active' : ''} ${error ? 'dropzone--error' : ''} ${disabled ? 'dropzone--disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleTriggerUpload}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTriggerUpload();
            }
          }}
          aria-label="Upload your headshot image"
        >
          <div className="dropzone-icon-container">
            <UploadCloud className="dropzone-icon" size={26} />
          </div>
          <div className="dropzone-text">
            <p className="dropzone-title">
              <span className="dropzone-cta">Click to upload</span> or drag and drop
            </p>
            <p className="dropzone-hint">
              PNG, JPG or WEBP • Max 10MB
            </p>
          </div>
          <div className="dropzone-tip">
            <span>Tip: Clear front-facing lighting gives best results</span>
          </div>
        </div>
      ) : (
        // Preview State
        <div className={`uploaded-file-card ${disabled ? 'uploaded-file-card--disabled' : ''}`}>
          <div className="uploaded-preview-container">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Headshot preview" 
                className="uploaded-preview-img" 
              />
            ) : (
              <ImageIcon size={24} className="preview-fallback-icon" />
            )}
            <div className="uploaded-badge-check" title="Headshot ready">
              <CheckCircle size={14} />
            </div>
          </div>

          <div className="uploaded-file-details">
            <div className="uploaded-file-name" title={headshot.name}>
              {headshot.name}
            </div>
            <div className="uploaded-file-meta">
              <span>{formatFileSize(headshot.size)}</span>
              <span className="meta-separator">•</span>
              <span className="meta-ready">Ready for generation</span>
            </div>
          </div>

          <div className="uploaded-actions">
            <button
              type="button"
              onClick={handleTriggerUpload}
              disabled={disabled}
              className="action-btn action-btn--secondary"
              title="Replace image"
            >
              <RefreshCw size={14} />
              <span>Replace</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="action-btn action-btn--danger"
              title="Remove image"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div id="headshot-error" className="field-error-message">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
