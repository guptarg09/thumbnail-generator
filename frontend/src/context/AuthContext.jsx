import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    let mounted = true;

    // 1. Initial session retrieval
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        console.error('Error fetching initial auth session:', error.message);
      }
      setSession(data?.session ?? null);
      setUser(data?.session?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      if (!mounted) return;
      console.error('Unexpected error retrieving session:', err);
      setLoading(false);
    });

    // 2. Real-time auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      } else if (event === 'SIGNED_OUT') {
        setIsPasswordRecovery(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Email / Password Registration
  const signUp = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    return data;
  };

  // Email / Password Sign In
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    return data;
  };

  // Google OAuth Sign In
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  };

  // Sign Out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setUser(null);
  };

  // Send Password Reset Link
  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}`,
    });
    if (error) throw error;
    return data;
  };

  // Update Password (used after recovery)
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    setIsPasswordRecovery(false);
    return data;
  };

  const value = {
    user,
    session,
    loading,
    isPasswordRecovery,
    setIsPasswordRecovery,
    isConfigured: isSupabaseConfigured,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
