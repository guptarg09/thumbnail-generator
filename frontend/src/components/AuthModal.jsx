import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import { useAuth } from '../hooks/useAuth';

export default function AuthModal({ isOpen, onClose, initialView = 'login' }) {
  const [view, setView] = useState(initialView);
  const { isPasswordRecovery, setIsPasswordRecovery } = useAuth();

  useEffect(() => {
    if (isPasswordRecovery) {
      setView('reset_password');
    } else {
      setView(initialView);
    }
  }, [initialView, isPasswordRecovery, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isPasswordRecovery) {
      setIsPasswordRecovery(false);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div 
        className="modal-content modal-content--auth" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-modal-header">
          <div className="auth-brand-badge">
            <div className="brand-logo-icon brand-logo-icon--sm">
              <Sparkles size={14} strokeWidth={2.5} />
            </div>
            <span className="brand-name">ThumbForge</span>
          </div>

          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={handleClose} 
            aria-label="Close authentication dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* View Switcher Tabs (Only when not in forgot or reset mode) */}
        {(view === 'login' || view === 'register') && (
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'login'}
              className={`auth-tab ${view === 'login' ? 'auth-tab--active' : ''}`}
              onClick={() => setView('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'register'}
              className={`auth-tab ${view === 'register' ? 'auth-tab--active' : ''}`}
              onClick={() => setView('register')}
            >
              Create Account
            </button>
          </div>
        )}

        <div className="auth-modal-body">
          {view === 'login' && (
            <Login
              onSwitchToRegister={() => setView('register')}
              onSwitchToForgot={() => setView('forgot_password')}
              onSuccess={handleClose}
            />
          )}

          {view === 'register' && (
            <Register
              onSwitchToLogin={() => setView('login')}
              onSuccess={handleClose}
            />
          )}

          {view === 'forgot_password' && (
            <ForgotPassword
              onSwitchToLogin={() => setView('login')}
              isRecovery={false}
              onSuccess={handleClose}
            />
          )}

          {view === 'reset_password' && (
            <ForgotPassword
              onSwitchToLogin={() => setView('login')}
              isRecovery={true}
              onSuccess={() => {
                setIsPasswordRecovery(false);
                handleClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
