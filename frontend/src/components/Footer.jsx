import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function Footer({ onOpenHelp }) {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-left">
          <div className="footer-brand">
            <Sparkles size={15} className="footer-brand-icon" />
            <span className="footer-brand-name">ThumbForge</span>
          </div>
          <span className="footer-copy">© 2026 ThumbForge AI Inc. All rights reserved.</span>
        </div>

        <div className="footer-center">
          <StatusBadge status="operational" label="All systems operational" />
        </div>

        <div className="footer-right">
          <button type="button" className="footer-link" onClick={onOpenHelp}>
            Playbook
          </button>
          <span className="footer-sep">•</span>
          <a 
            href="#privacy" 
            className="footer-link"
            onClick={(e) => { e.preventDefault(); alert("Privacy Policy: Your uploaded headshots and prompts are processed securely and deleted following generation jobs."); }}
          >
            Privacy
          </a>
          <span className="footer-sep">•</span>
          <a 
            href="#terms" 
            className="footer-link"
            onClick={(e) => { e.preventDefault(); alert("Terms of Service: Full commercial and YouTube ownership rights for all generated outputs."); }}
          >
            Terms
          </a>
          <span className="footer-sep">•</span>
          <button type="button" className="footer-link" onClick={onOpenHelp}>
            Support
          </button>
        </div>
      </div>
    </footer>
  );
}
