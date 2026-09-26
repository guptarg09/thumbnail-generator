import React from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function GenerateButton({ onClick, loading, disabled, disabledReason }) {
  return (
    <div className="generate-btn-container">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className={`generate-btn ${loading ? 'generate-btn--loading' : ''} ${disabled && !loading ? 'generate-btn--disabled' : ''}`}
        aria-busy={loading}
      >
        <span className="generate-btn-content">
          {loading ? (
            <>
              <Loader2 size={18} className="spinner-icon" />
              <span>Generating Thumbnails...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} className="sparkle-icon" />
              <span>Generate Thumbnails</span>
              <ArrowRight size={16} className="arrow-icon" />
            </>
          )}
        </span>
      </button>

      {disabled && !loading && disabledReason && (
        <p className="generate-disabled-reason">
          {disabledReason}
        </p>
      )}
    </div>
  );
}
