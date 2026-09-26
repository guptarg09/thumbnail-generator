import { useState } from 'react';
import { Mail, AlertCircle, ArrowLeft, ArrowRight, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function ForgotPassword({ onSwitchToLogin, isRecovery = false, onSuccess }) {
  const { resetPassword, updatePassword } = useAuth();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Handle Requesting Reset Link
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      console.error('Password reset error:', err);
      if (err.message?.toLowerCase().includes('failed to fetch')) {
        setError('Unable to connect to the authentication server. Please try again.');
      } else {
        setError(err.message || 'Failed to send reset link. Please verify your email.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Setting New Password (after recovery link clicked)
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      setSubmitted(true);
      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (err) {
      console.error('Update password error:', err);
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isRecovery) {
    return (
      <div className="auth-form-wrapper">
        <div className="auth-form-header">
          <h3 className="auth-title">Update Your Password</h3>
          <p className="auth-subtitle">Enter a new secure password for your account</p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={16} className="auth-error-icon" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="auth-success-state">
            <div className="auth-success-circle">
              <CheckCircle2 size={32} className="auth-success-large-icon" />
            </div>
            <h4>Password Updated!</h4>
            <p>Your password has been changed successfully. You can now access your studio.</p>
            <button
              type="button"
              className="auth-submit-btn"
              onClick={onSuccess || onSwitchToLogin}
            >
              <span>Continue to Studio</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="auth-form" noValidate>
            <div className="auth-field-group">
              <label className="auth-label" htmlFor="new-password">New Password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="new-password"
                  type="password"
                  className="auth-input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="auth-field-group">
              <label className="auth-label" htmlFor="confirm-new-password">Confirm New Password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="confirm-new-password"
                  type="password"
                  className="auth-input"
                  placeholder="Repeat your new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="auth-form-wrapper">
      <div className="auth-form-header">
        <h3 className="auth-title">Reset Your Password</h3>
        <p className="auth-subtitle">We will send a password reset link to your email address</p>
      </div>

      {error && (
        <div className="auth-error-banner" role="alert">
          <AlertCircle size={16} className="auth-error-icon" />
          <span>{error}</span>
        </div>
      )}

      {submitted ? (
        <div className="auth-success-state">
          <div className="auth-success-circle">
            <CheckCircle2 size={32} className="auth-success-large-icon" />
          </div>
          <h4>Check Your Email</h4>
          <p>
            We have dispatched a password recovery link to <strong>{email}</strong>. 
            Click the link in the email to set a new password.
          </p>
          <button
            type="button"
            className="auth-submit-btn auth-submit-btn--secondary"
            onClick={onSwitchToLogin}
          >
            <ArrowLeft size={16} />
            <span>Return to Sign In</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleRequestReset} className="auth-form" noValidate>
          <div className="auth-field-group">
            <label className="auth-label" htmlFor="forgot-email">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="forgot-email"
                type="email"
                className="auth-input"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <button
            type="button"
            className="auth-back-btn"
            onClick={onSwitchToLogin}
            disabled={loading}
          >
            <ArrowLeft size={15} />
            <span>Back to Sign In</span>
          </button>
        </form>
      )}
    </div>
  );
}
