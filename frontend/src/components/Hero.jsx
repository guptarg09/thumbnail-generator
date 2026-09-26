import React from 'react';
import { Sparkles, Layers, Sliders, Check } from 'lucide-react';

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-eyebrow">
        <Sparkles size={14} className="hero-eyebrow-icon" />
        <span>AI CREATIVE STUDIO</span>
      </div>
      <h1 className="hero-heading">
        Create thumbnails that get attention.
      </h1>
      <p className="hero-subheading">
        Generate professional YouTube thumbnails with consistent visual quality in seconds.
      </p>

      <div className="hero-features">
        <div className="hero-feature-item">
          <Check size={14} className="hero-feature-icon" />
          <span>16:9 Standard YouTube HD</span>
        </div>
        <div className="hero-feature-item">
          <Check size={14} className="hero-feature-icon" />
          <span>Face-matched headshot blending</span>
        </div>
        <div className="hero-feature-item">
          <Check size={14} className="hero-feature-icon" />
          <span>Multiple creative style variations</span>
        </div>
      </div>
    </section>
  );
}
