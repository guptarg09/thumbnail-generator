import React, { useState } from 'react';
import { Eye, Download, Copy, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ThumbnailCard({ 
  thumbnail, 
  index, 
  onPreview, 
  onToast 
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const imageUrl = thumbnail.imagekit_url || thumbnail.url;
  const styleName = thumbnail.style_name || 'Standard Style';
  const status = thumbnail.status || 'uploaded';
  const thumbnailId = thumbnail.thumbnail_id || thumbnail.id || index + 1;

  // Handle direct client-side download without inventing non-existent backend APIs
  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!imageUrl || downloading) return;

    try {
      setDownloading(true);
      // Fetch image as blob for direct download
      const response = await fetch(imageUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `thumbforge-${styleName.toLowerCase().replace(/\s+/g, '-')}-${thumbnailId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      if (onToast) {
        onToast({ type: 'success', message: 'Thumbnail downloaded successfully!' });
      }
    } catch (err) {
      console.warn('Direct blob download failed, falling back to window open:', err);
      // Fallback: open image in new tab if CORS prevents direct blob fetch
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
      if (onToast) {
        onToast({ type: 'info', message: 'Opening full resolution thumbnail in new tab...' });
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    if (!imageUrl) return;

    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onToast) {
        onToast({ type: 'success', message: 'Image link copied to clipboard!' });
      }
    } catch {
      if (onToast) {
        onToast({ type: 'error', message: 'Failed to copy image link' });
      }
    }
  };

  return (
    <div 
      className="thumbnail-card"
      onClick={() => onPreview && onPreview(thumbnail)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPreview && onPreview(thumbnail);
        }
      }}
      aria-label={`View thumbnail variation ${index + 1}: ${styleName}`}
    >
      <div className="thumbnail-card-media">
        {/* Shimmer skeleton before image is fully loaded */}
        {!imageLoaded && !imageError && (
          <div className="media-skeleton shimmer" />
        )}

        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={`YouTube thumbnail concept: ${styleName}`}
            className={`thumbnail-card-img ${imageLoaded ? 'thumbnail-card-img--loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        ) : (
          <div className="media-error-state">
            <AlertCircle size={28} className="media-error-icon" />
            <p className="media-error-text">Image preview unavailable</p>
          </div>
        )}

        {/* Top Badges */}
        <div className="thumbnail-card-top-badges">
          <span className="variation-pill">
            #{index + 1}
          </span>
          <StatusBadge status={status} />
        </div>

        {/* Hover overlay with action buttons */}
        <div className="thumbnail-card-overlay">
          <div className="overlay-actions">
            <button
              type="button"
              className="overlay-btn overlay-btn--primary"
              onClick={(e) => {
                e.stopPropagation();
                onPreview && onPreview(thumbnail);
              }}
              title="Expand preview"
            >
              <Eye size={15} />
              <span>Preview</span>
            </button>

            {imageUrl && (
              <button
                type="button"
                className="overlay-btn"
                onClick={handleDownload}
                disabled={downloading}
                title="Download image"
              >
                <Download size={15} />
                <span>{downloading ? 'Saving...' : 'Download'}</span>
              </button>
            )}

            {imageUrl && (
              <button
                type="button"
                className="overlay-btn overlay-btn--icon-only"
                onClick={handleCopyLink}
                title="Copy Image URL"
              >
                {copied ? <Check size={15} className="copied-icon" /> : <Copy size={15} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Info footer */}
      <div className="thumbnail-card-info">
        <div className="thumbnail-card-style">
          <span className="style-label">Style Concept</span>
          <h4 className="style-name" title={styleName}>{styleName}</h4>
        </div>
        <div className="thumbnail-card-meta">
          <span className="aspect-ratio-pill">16:9 HD</span>
        </div>
      </div>
    </div>
  );
}
