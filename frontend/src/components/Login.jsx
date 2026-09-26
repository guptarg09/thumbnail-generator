import { useState } from 'react';
import { Mail, Lock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login({ onSwitchToRegister, onSwitchToForgot, onSuccess }) {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await signIn({ email: email.trim(), password });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Sign in error:', err);
      if (err.message?.toLowerCase().includes('invalid login credentials')) {
        setError('Invalid email or password.');
      } else if (err.message?.toLowerCase().includes('email not confirmed')) {
        setError('Please verify your email address before signing in.');
      } else if (err.message?.toLowerCase().includes('failed to fetch')) {
        setError('Unable to connect to the authentication server. Please try again.');
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign in error:', err);
      setError(err.message || 'Unable to connect to Google. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper">
      <div className="auth-form-header">
        <h3 className="auth-title">Welcome Back</h3>
        <p className="auth-subtitle">Sign in to your account to generate and manage YouTube thumbnails</p>
      </div>

      {error && (
        <div className="auth-error-banner" role="alert">
          <AlertCircle size={16} className="auth-error-icon" />
          <span>{error}</span>
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        className="auth-google-btn"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
      >
        {googleLoading ? (
          <>
            <Loader2 size={18} className="spin-icon" />
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      <div className="auth-divider">
        <span>or sign in with email</span>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="auth-field-group">
          <label className="auth-label" htmlFor="login-email">Email Address</label>
          <div className="auth-input-wrapper">
            <Mail size={16} className="auth-input-icon" />
            <input
              id="login-email"
              type="email"
              className="auth-input"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || googleLoading}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="auth-field-group">
          <div className="auth-label-row">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <button
              type="button"
              className="auth-text-link"
              onClick={onSwitchToForgot}
              tabIndex={0}
            >
              Forgot password?
            </button>
          </div>
          <div className="auth-input-wrapper">
            <Lock size={16} className="auth-input-icon" />
            <input
              id="login-password"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || googleLoading}
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={loading || googleLoading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="spin-icon" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="auth-footer-prompt">
        <span>Don't have an account yet?</span>{' '}
        <button
          type="button"
          className="auth-action-link"
          onClick={onSwitchToRegister}
        >
          Create an account
        </button>
      </div>
    </div>
  );
}
