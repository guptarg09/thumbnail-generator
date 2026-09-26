import React, { useState } from 'react';
import { Sparkles, HelpCircle, Image as ImageIcon, Menu, X, ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function Navbar({ onScrollToSection, onOpenHelp, thumbnailCount = 0 }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand" onClick={() => handleNavClick('create')} role="button" tabIndex={0}>
          <div className="brand-logo-icon">
            <Sparkles size={18} strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <span className="brand-name">ThumbForge</span>
            <span className="brand-tag">AI</span>
          </div>
        </div>

        {/* Center / Desktop Links */}
        <nav className="navbar-links" aria-label="Main Navigation">
          <button 
            type="button" 
            className="nav-link nav-link--active"
            onClick={() => handleNavClick('create')}
          >
            Create
          </button>
          <button 
            type="button" 
            className="nav-link"
            onClick={() => handleNavClick('gallery')}
          >
            <ImageIcon size={15} className="nav-icon" />
            <span>My Thumbnails</span>
            {thumbnailCount > 0 && (
              <span className="nav-count-badge">{thumbnailCount}</span>
            )}
          </button>
          <button 
            type="button" 
            className="nav-link"
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenHelp) onOpenHelp();
            }}
          >
            <HelpCircle size={15} className="nav-icon" />
            <span>Help</span>
          </button>
        </nav>

        {/* Right Status & Avatar */}
        <div className="navbar-right">
          <div className="navbar-status-wrapper">
            <StatusBadge status="operational" label="System Operational" pulsing={false} />
          </div>

          <div className="user-profile" title="Signed in as Creator">
            <div className="user-avatar" aria-label="User Avatar">
              <span>TF</span>
            </div>
            <div className="user-info">
              <span className="user-name">Creator</span>
              <span className="user-plan">Pro Studio</span>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button 
            type="button" 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu" role="menu">
          <button 
            type="button" 
            className="mobile-nav-link"
            onClick={() => handleNavClick('create')}
          >
            Create New Thumbnail
          </button>
          <button 
            type="button" 
            className="mobile-nav-link"
            onClick={() => handleNavClick('gallery')}
          >
            <span>My Thumbnails</span>
            {thumbnailCount > 0 && (
              <span className="nav-count-badge">{thumbnailCount}</span>
            )}
          </button>
          <button 
            type="button" 
            className="mobile-nav-link"
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenHelp) onOpenHelp();
            }}
          >
            Best Practices & Help
          </button>
          <div className="mobile-menu-footer">
            <StatusBadge status="operational" label="System Operational" />
          </div>
        </div>
      )}
    </header>
  );
}
