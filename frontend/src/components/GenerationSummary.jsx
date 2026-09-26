import React from 'react';
import { FileText, User, Sparkles, Clock } from 'lucide-react';

export default function GenerationSummary({ prompt, headshot, numThumbnails }) {
  const truncatedPrompt = prompt.trim() 
    ? (prompt.trim().length > 60 ? `${prompt.trim().slice(0, 58)}...` : prompt.trim()) 
    : 'No topic brief provided';

  const headshotName = headshot 
    ? headshot.name 
    : 'No image uploaded';

  return (
    <div className="summary-panel">
      <div className="summary-panel-header">
        <h4 className="summary-title">Generation Summary</h4>
        <div className="summary-badge">
          <Clock size={12} />
          <span>~15-30s est.</span>
        </div>
      </div>

      <div className="summary-list">
        <div className="summary-item">
          <div className="summary-item-label">
            <FileText size={14} className="summary-item-icon" />
            <span>Topic:</span>
          </div>
          <span className={`summary-item-val ${!prompt.trim() ? 'summary-item-val--empty' : ''}`} title={prompt}>
            {truncatedPrompt}
          </span>
        </div>

        <div className="summary-item">
          <div className="summary-item-label">
            <User size={14} className="summary-item-icon" />
            <span>Headshot:</span>
          </div>
          <span className={`summary-item-val ${!headshot ? 'summary-item-val--empty' : ''}`} title={headshot?.name}>
            {headshotName}
          </span>
        </div>

        <div className="summary-item">
          <div className="summary-item-label">
            <Sparkles size={14} className="summary-item-icon" />
            <span>Variations:</span>
          </div>
          <span className="summary-item-val summary-item-val--highlight">
            {numThumbnails} {numThumbnails === 1 ? 'thumbnail' : 'thumbnails'}
          </span>
        </div>
      </div>
    </div>
  );
}
