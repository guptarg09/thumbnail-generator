import React from 'react';
import { Sliders, Monitor, Layers } from 'lucide-react';

export default function GenerationSettings({ numThumbnails, onChange, disabled }) {
  const options = [1, 2, 3];

  return (
    <div className="settings-panel">
      <div className="settings-panel-header">
        <Sliders size={16} className="settings-icon" />
        <h3 className="settings-title">Generation Settings</h3>
      </div>

      <div className="setting-item">
        <div className="setting-label-row">
          <label className="field-label" id="variations-label">
            Number of thumbnails
          </label>
          <span className="setting-current-value">
            {numThumbnails} {numThumbnails === 1 ? 'variation' : 'variations'}
          </span>
        </div>

        {/* Segmented control */}
        <div 
          className="segmented-control" 
          role="radiogroup" 
          aria-labelledby="variations-label"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={numThumbnails === option}
              disabled={disabled}
              className={`segmented-button ${numThumbnails === option ? 'segmented-button--active' : ''}`}
              onClick={() => onChange(option)}
            >
              <span className="segmented-number">{option}</span>
              <span className="segmented-label">{option === 1 ? 'Concept' : 'Concepts'}</span>
            </button>
          ))}
        </div>

        <p className="setting-hint">
          Generate multiple variations to explore different concepts and visual hooks.
        </p>
      </div>

      {/* Preset specifications */}
      <div className="specs-card">
        <div className="spec-row">
          <div className="spec-item">
            <Monitor size={14} className="spec-icon" />
            <span className="spec-key">Output Format</span>
          </div>
          <span className="spec-val">16:9 (1280 × 720 HD)</span>
        </div>
        <div className="spec-row">
          <div className="spec-item">
            <Layers size={14} className="spec-icon" />
            <span className="spec-key">Style Diversity</span>
          </div>
          <span className="spec-val">Auto-varied AI styles</span>
        </div>
      </div>
    </div>
  );
}
