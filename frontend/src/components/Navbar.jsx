import { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Menu, 
  X, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Clock, 
  ChevronDown
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useAuth } from '../hooks/useAuth';

export default function Navbar({ 
  activeTab = 'generator',
  onNavigate,
  onOpenAuth,
  onOpenHelp, 
  thumbnailCount = 0 
}) {
  const { user, signOut, loading: authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNavClick = (tab) => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Extract user display info
  const userEmail = user?.email || '';
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || (userEmail ? userEmail.split('@')[0] : 'Creator');
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const initials = userName.substring(0, 2).toUpperCase() || 'CR';

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div 
          className="navbar-brand" 
          onClick={() => handleNavClick('generator')} 
          role="button" 
          tabIndex={0}
        >
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
            className={`nav-link ${activeTab === 'generator' ? 'nav-link--active' : ''}`}
            onClick={() => handleNavClick('generator')}
          >
            <Sparkles size={15} className="nav-icon" />
            <span>Generate</span>
            {thumbnailCount > 0 && (
              <span className="nav-count-badge">{thumbnailCount}</span>
            )}
          </button>

          {user && (
            <button 
              type="button" 
              className={`nav-link ${activeTab === 'history' ? 'nav-link--active' : ''}`}
              onClick={() => handleNavClick('history')}
            >
              <Clock size={15} className="nav-icon" />
              <span>History</span>
            </button>
          )}

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

        {/* Right Status & Auth/Avatar */}
        <div className="navbar-right">
          <div className="navbar-status-wrapper">
            <StatusBadge status="operational" label="Operational" pulsing={false} />
          </div>

          {!authLoading && (
            user ? (
              /* Authenticated User Menu */
              <div className="navbar-user-dropdown-container">
                <div 
                  className="user-profile navbar-profile-btn" 
                  title={`Signed in as ${userEmail}`}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="user-avatar" aria-label="User Avatar">
                    {userAvatar ? (
                      <img 
                        src={userAvatar} 
                        alt={userName} 
                        className="user-avatar-img"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{userName}</span>
                    <span className="user-plan">{userEmail ? userEmail.split('@')[0] : 'Creator'}</span>
                  </div>
                  <ChevronDown size={14} className="user-dropdown-arrow" />
                </div>

                {userDropdownOpen && (
                  <div className="user-menu-dropdown" role="menu">
                    <div className="user-menu-header">
                      <p className="user-menu-signed">Signed in as</p>
                      <p className="user-menu-email">{userEmail}</p>
                    </div>

                    <button
                      type="button"
                      className="user-menu-item"
                      onClick={() => handleNavClick('history')}
                    >
                      <Clock size={15} />
                      <span>Generation History</span>
                    </button>

                    <button
                      type="button"
                      className="user-menu-item user-menu-item--danger"
                      onClick={handleSignOut}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Unauthenticated Actions */
              <div className="navbar-auth-actions">
                <button
                  type="button"
                  className="nav-auth-btn nav-auth-btn--login"
                  onClick={() => onOpenAuth && onOpenAuth('login')}
                >
                  <LogIn size={15} />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  className="nav-auth-btn nav-auth-btn--register"
                  onClick={() => onOpenAuth && onOpenAuth('register')}
                >
                  <UserPlus size={15} />
                  <span>Sign Up</span>
                </button>
              </div>
            )
          )}

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
            className={`mobile-nav-link ${activeTab === 'generator' ? 'mobile-nav-link--active' : ''}`}
            onClick={() => handleNavClick('generator')}
          >
            <Sparkles size={16} />
            <span>Generate Thumbnails</span>
          </button>

          {user && (
            <button 
              type="button" 
              className={`mobile-nav-link ${activeTab === 'history' ? 'mobile-nav-link--active' : ''}`}
              onClick={() => handleNavClick('history')}
            >
              <Clock size={16} />
              <span>Generation History</span>
            </button>
          )}

          <button 
            type="button" 
            className="mobile-nav-link"
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenHelp) onOpenHelp();
            }}
          >
            <HelpCircle size={16} />
            <span>Best Practices & Help</span>
          </button>

          <div className="mobile-menu-auth-section">
            {user ? (
              <div className="mobile-menu-user-row">
                <div className="mobile-user-details">
                  <span className="mobile-user-name">{userName}</span>
                  <span className="mobile-user-email">{userEmail}</span>
                </div>
                <button
                  type="button"
                  className="mobile-auth-btn mobile-auth-btn--logout"
                  onClick={handleSignOut}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="mobile-menu-buttons">
                <button
                  type="button"
                  className="mobile-auth-btn mobile-auth-btn--login"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth && onOpenAuth('login');
                  }}
                >
                  <LogIn size={16} />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  className="mobile-auth-btn mobile-auth-btn--register"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth && onOpenAuth('register');
                  }}
                >
                  <UserPlus size={16} />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
