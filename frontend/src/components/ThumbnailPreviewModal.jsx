import React, { useEffect, useState } from 'react';
import { X, Download, Copy, ExternalLink, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ThumbnailPreviewModal({ thumbnail, onClose, onToast }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState('original');

  const imageUrl = thumbnail?.imagekit_url || thumbnail?.url;
  const styleName = thumbnail?.style_name || 'YouTube Thumbnail';
  const status = thumbnail?.status || 'uploaded';
  const variants = thumbnail?.variants || null;

  // Determine current active URL based on variant selection
  const activeUrl = variants && variants[selectedVariant] 
    ? variants[selectedVariant] 
    : imageUrl;

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!thumbnail) return null;

  const handleDownload = async () => {
    if (!activeUrl || downloading) return;
    try {
      setDownloading(true);
      const response = await fetch(activeUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const cleanName = styleName.toLowerCase().replace(/\s+/g, '-');
      link.download = `thumbforge-${cleanName}-${selectedVariant}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      if (onToast) {
        onToast({ type: 'success', message: 'Thumbnail downloaded successfully!' });
      }
    } catch {
      window.open(activeUrl, '_blank', 'noopener,noreferrer');
      if (onToast) {
        onToast({ type: 'info', message: 'Opening image in new tab...' });
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!activeUrl) return;
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onToast) {
        onToast({ type: 'success', message: 'Image link copied to clipboard!' });
      }
    } catch {
      if (onToast) {
        onToast({ type: 'error', message: 'Failed to copy URL' });
      }
    }
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose}
      role="dialog" 
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-badge-row">
              <span className="modal-eyebrow">PREVIEW MODE</span>
              <StatusBadge status={status} />
            </div>
            <h3 id="modal-title" className="modal-title">{styleName}</h3>
          </div>

          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Image View */}
        <div className="modal-body">
          <div className="modal-image-wrapper">
            {activeUrl ? (
              <img 
                src={activeUrl} 
                alt={`Full preview of ${styleName}`} 
                className="modal-image"
              />
            ) : (
              <div className="modal-image-fallback">
                <ImageIcon size={48} />
                <p>Thumbnail preview is not available</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="modal-footer">
          {/* Variants Selector if available */}
          {variants && (
            <div className="modal-variants-picker">
              <span className="variants-label">Format:</span>
              <div className="variants-options">
                <button
                  type="button"
                  className={`variant-chip ${selectedVariant === 'original' ? 'variant-chip--active' : ''}`}
                  onClick={() => setSelectedVariant('original')}
                >
                  Original HD
                </button>
                {variants.small && (
                  <button
                    type="button"
                    className={`variant-chip ${selectedVariant === 'small' ? 'variant-chip--active' : ''}`}
                    onClick={() => setSelectedVariant('small')}
                  >
                    1280×720 (16:9)
                  </button>
                )}
                {variants.medium && (
                  <button
                    type="button"
                    className={`variant-chip ${selectedVariant === 'medium' ? 'variant-chip--active' : ''}`}
                    onClick={() => setSelectedVariant('medium')}
                  >
                    Shorts (9:16)
                  </button>
                )}
                {variants.large && (
                  <button
                    type="button"
                    className={`variant-chip ${selectedVariant === 'large' ? 'variant-chip--active' : ''}`}
                    onClick={() => setSelectedVariant('large')}
                  >
                    Square (1:1)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="modal-actions">
            <button
              type="button"
              className="modal-btn modal-btn--secondary"
              onClick={handleCopy}
              title="Copy URL"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              type="button"
              className="modal-btn modal-btn--secondary"
              onClick={() => window.open(activeUrl, '_blank', 'noopener,noreferrer')}
              title="Open full size in new tab"
            >
              <ExternalLink size={16} />
              <span>Open Tab</span>
            </button>

            <button
              type="button"
              className="modal-btn modal-btn--primary"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download size={16} />
              <span>{downloading ? 'Downloading...' : 'Download Image'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
