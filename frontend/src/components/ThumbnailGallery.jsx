import React from 'react';
import { Layers, Sparkles, Download, RefreshCw, Trash2 } from 'lucide-react';
import ThumbnailCard from './ThumbnailCard';

export default function ThumbnailGallery({ 
  thumbnails, 
  loading, 
  targetCount, 
  onPreview, 
  onClear, 
  onToast 
}) {
  const pendingCount = loading ? Math.max(0, targetCount - thumbnails.length) : 0;

  // Download all thumbnails sequentially
  const handleDownloadAll = async () => {
    if (!thumbnails.length) return;
    
    if (onToast) {
      onToast({ type: 'info', message: `Downloading ${thumbnails.length} thumbnails...` });
    }

    for (let i = 0; i < thumbnails.length; i++) {
      const thumb = thumbnails[i];
      const url = thumb.imagekit_url || thumb.url;
      if (!url) continue;

      try {
        const response = await fetch(url, { mode: 'cors' });
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        const style = (thumb.style_name || 'variation').toLowerCase().replace(/\s+/g, '-');
        link.download = `thumbforge-${style}-${i + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        // Small delay between downloads
        await new Promise((res) => setTimeout(res, 350));
      } catch {
        window.open(url, '_blank');
      }
    }
  };

  return (
    <section className="gallery-section" id="gallery" aria-labelledby="gallery-heading">
      <div className="gallery-header">
        <div className="gallery-header-text">
          <div className="gallery-eyebrow">
            <Layers size={14} />
            <span>AI OUTPUTS</span>
          </div>
          <h2 id="gallery-heading" className="gallery-title">Your Thumbnails</h2>
          <p className="gallery-subtitle">
            Generated variations from your creative brief.
          </p>
        </div>

        <div className="gallery-actions">
          {thumbnails.length > 1 && (
            <button
              type="button"
              className="gallery-btn gallery-btn--primary"
              onClick={handleDownloadAll}
              title="Download all generated thumbnails"
            >
              <Download size={14} />
              <span>Download All ({thumbnails.length})</span>
            </button>
          )}

          {thumbnails.length > 0 && !loading && (
            <button
              type="button"
              className="gallery-btn gallery-btn--secondary"
              onClick={onClear}
              title="Clear results and start fresh"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="thumbnail-grid">
        {/* Rendered ready thumbnails */}
        {thumbnails.map((thumbnail, index) => (
          <ThumbnailCard
            key={thumbnail.thumbnail_id || thumbnail.id || index}
            thumbnail={thumbnail}
            index={index}
            onPreview={onPreview}
            onToast={onToast}
          />
        ))}

        {/* Skeleton cards for in-progress variations */}
        {Array.from({ length: pendingCount }).map((_, i) => (
          <div 
            key={`skeleton-${i}`} 
            className="thumbnail-card thumbnail-card--skeleton"
            aria-label="Generating variation placeholder"
          >
            <div className="thumbnail-card-media">
              <div className="media-skeleton shimmer">
                <div className="skeleton-spinner-wrap">
                  <div className="skeleton-pulse-dot" />
                  <span className="skeleton-text">Synthesizing variation #{thumbnails.length + i + 1}...</span>
                </div>
              </div>
            </div>
            <div className="thumbnail-card-info">
              <div className="skeleton-line skeleton-line--title shimmer" />
              <div className="skeleton-line skeleton-line--meta shimmer" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
