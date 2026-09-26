import React, { useEffect } from 'react';
import { X, CheckCircle2, Lightbulb, Camera, Zap } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-content--help" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-eyebrow">CREATOR PLAYBOOK</span>
            <h3 className="modal-title">Thumbnail Best Practices</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close help">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body help-body">
          <div className="help-section">
            <div className="help-section-header">
              <Camera size={18} className="help-icon" />
              <h4>Headshot Optimization</h4>
            </div>
            <ul className="help-list">
              <li>
                <CheckCircle2 size={15} className="help-check" />
                <span><strong>Front-facing lighting:</strong> Ensure your face is evenly lit with sharp focus and minimal motion blur.</span>
              </li>
              <li>
                <CheckCircle2 size={15} className="help-check" />
                <span><strong>Expressive emotion:</strong> YouTube viewers respond to intense expressions: curiosity, shock, excitement, or focus.</span>
              </li>
              <li>
                <CheckCircle2 size={15} className="help-check" />
                <span><strong>Clean background:</strong> Solid or simple backgrounds make AI subject extraction and blending significantly cleaner.</span>
              </li>
            </ul>
          </div>

          <div className="help-section">
            <div className="help-section-header">
              <Lightbulb size={18} className="help-icon" />
              <h4>Effective Brief Writing</h4>
            </div>
            <ul className="help-list">
              <li>
                <CheckCircle2 size={15} className="help-check" />
                <span><strong>Visual hooks:</strong> Specify dramatic elements like "neon blue glow", "versus split screen", or "cash explosion".</span>
              </li>
              <li>
                <CheckCircle2 size={15} className="help-check" />
                <span><strong>Keep text minimal:</strong> The best thumbnails contain 3–5 words at most for fast smartphone comprehension.</span>
              </li>
              <li>
                <CheckCircle2 size={15} className="help-check" />
                <span><strong>High contrast:</strong> YouTube dark mode requires bright saturated accents that pop against dark backgrounds.</span>
              </li>
            </ul>
          </div>

          <div className="help-section">
            <div className="help-section-header">
              <Zap size={18} className="help-icon" />
              <h4>Workflow & Output</h4>
            </div>
            <ul className="help-list">
              <li>
                <CheckCircle2 size={15} className="help-check" />
                <span>All outputs are exported in native 16:9 1280×720 HD format ready for YouTube Studio.</span>
              </li>
              <li>
                <CheckCircle2 size={15} className="help-check" />
                <span>Click any thumbnail in your gallery to inspect high-resolution details or export alternative aspect ratios.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="modal-btn modal-btn--primary" onClick={onClose}>
            Got it, let's create
          </button>
        </div>
      </div>
    </div>
  );
}
