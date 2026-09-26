import React from 'react';
import { Sparkles, Layers, Sliders, ArrowUpCircle } from 'lucide-react';

export default function EmptyState({ onFocusPrompt }) {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon-container">
        <Sparkles size={28} className="empty-state-icon" />
      </div>

      <h3 className="empty-state-title">
        Your creative workspace is ready.
      </h3>

      <p className="empty-state-subtitle">
        Enter a prompt and upload a headshot above to generate your first high-converting thumbnail variations.
      </p>

      <div className="empty-state-steps">
        <div className="step-pill">
          <span className="step-num">1</span>
          <span>Describe your video concept</span>
        </div>
        <div className="step-divider" />
        <div className="step-pill">
          <span className="step-num">2</span>
          <span>Upload your creator headshot</span>
        </div>
        <div className="step-divider" />
        <div className="step-pill">
          <span className="step-num">3</span>
          <span>Receive styled 16:9 concepts</span>
        </div>
      </div>
    </div>
  );
}
