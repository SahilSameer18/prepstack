import { createContext, useCallback, useEffect, useState, useMemo } from "react";
import { getCurrentUser } from "../api/services/authService";
import { extractError } from "../utils/extractError";
import { isSignedOutError } from "../utils/isSignedOutError";
import { setLogoutCallback } from "../api/axios";
import { LogoutOverlay } from "../components/ui/LogoutOverlay";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Let the axios interceptor call this when refresh token is also expired/invalid.
  // This avoids a circular import (axios can't use React hooks directly).
  useEffect(() => {
    setLogoutCallback(() => {
      setUser(null);
    });
    return () => setLogoutCallback(null); // cleanup on unmount
  }, []);

  // Ask the server who is signed in. A 401/403 is the normal answer for a visitor. Any other failure (lost connection,
  // timeout, server asleep) is kept in authError so a signed-in person is not shown as signed out: protected pages offer a retry.
  const checkSession = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await getCurrentUser();
      const userData = data?.data?.user || data?.user;
      if (userData) {
        setUser(userData);
      }
    } catch (err) {
      if (!isSignedOutError(err)) setAuthError(extractError(err, "Could not check your session. Please try again."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      setLoading,
      authError: user ? null : authError,
      retrySession: checkSession,
      isLoggingOut,
      setIsLoggingOut,
    }),
    [user, loading, authError, checkSession, isLoggingOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LogoutOverlay isOpen={isLoggingOut} />
    </AuthContext.Provider>
  );
};

