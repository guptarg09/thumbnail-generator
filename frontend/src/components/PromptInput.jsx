import React from 'react';
import { Lightbulb, XCircle } from 'lucide-react';

const SUGGESTIONS = [
  "Learn Python in 30 Days: Zero to Hero tutorial",
  "How I Scaled My SaaS to $10k/mo with AI",
  "Top 5 Minimalist Desk Setups for Productivity",
  "Don't Make These 7 Crypto Investing Mistakes"
];

export default function PromptInput({ prompt, onChange, disabled, error }) {
  const maxLength = 500;
  const currentLength = (prompt || '').length;

  const handleSuggestionClick = (text) => {
    if (disabled) return;
    onChange(text);
  };

  const handleClear = () => {
    if (disabled) return;
    onChange('');
  };

  return (
    <div className="prompt-input-group">
      <div className="prompt-input-header">
        <label htmlFor="thumbnail-prompt" className="field-label">
          What should your thumbnail be about?
          <span className="field-required">*</span>
        </label>
        {prompt && !disabled && (
          <button 
            type="button" 
            onClick={handleClear} 
            className="clear-text-btn"
            title="Clear prompt"
          >
            Clear
          </button>
        )}
      </div>

      <div className={`textarea-wrapper ${error ? 'textarea-wrapper--error' : ''} ${disabled ? 'textarea-wrapper--disabled' : ''}`}>
        <textarea
          id="thumbnail-prompt"
          value={prompt}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Example: A YouTube thumbnail about learning Python in 30 days with bold typography, expressive facial expression, glowing tech background..."
          rows={4}
          maxLength={maxLength}
          disabled={disabled}
          className="prompt-textarea"
          aria-invalid={!!error}
          aria-describedby="prompt-helper prompt-counter"
        />
      </div>

      <div className="prompt-meta-row">
        <p id="prompt-helper" className={`prompt-helper-text ${error ? 'prompt-helper-text--error' : ''}`}>
          {error || "Describe the topic, mood, visual style, and important elements."}
        </p>
        <span 
          id="prompt-counter" 
          className={`prompt-counter ${currentLength >= maxLength ? 'prompt-counter--max' : ''}`}
        >
          {currentLength} / {maxLength}
        </span>
      </div>

      {/* Quick suggestions pills */}
      <div className="prompt-suggestions">
        <div className="suggestions-label">
          <Lightbulb size={13} className="suggestions-icon" />
          <span>Quick ideas:</span>
        </div>
        <div className="suggestions-list">
          {SUGGESTIONS.map((item, index) => (
            <button
              key={index}
              type="button"
              className="suggestion-chip"
              onClick={() => handleSuggestionClick(item)}
              disabled={disabled}
              title={`Use idea: "${item}"`}
            >
              {item.length > 32 ? `${item.slice(0, 30)}...` : item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
