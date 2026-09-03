import { createContext, useEffect, useState, useMemo } from "react";
import { getCurrentUser } from "../api/services/authService";
import { setLogoutCallback } from "../api/axios";
import { LogoutOverlay } from "../components/ui/LogoutOverlay";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Let the axios interceptor call this when refresh token is also expired/invalid.
  // This avoids a circular import (axios can't use React hooks directly).
  useEffect(() => {
    setLogoutCallback(() => {
      setUser(null);
    });
    return () => setLogoutCallback(null); // cleanup on unmount
  }, []);

  useEffect(() => {
    const getAndSetUser = async () => {
      try {
        const data = await getCurrentUser();
        if (data && data.user) {
          setUser(data.user);
        }
      } catch {
        // Expected for unauthenticated visitors (401 / refresh failure) — no action needed.
      } finally {
        setLoading(false);
      }
    };
    getAndSetUser();
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      setLoading,
      isLoggingOut,
      setIsLoggingOut,
    }),
    [user, loading, isLoggingOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LogoutOverlay isOpen={isLoggingOut} />
    </AuthContext.Provider>
  );
};

