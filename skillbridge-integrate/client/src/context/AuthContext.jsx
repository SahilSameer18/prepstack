import { createContext, useEffect, useState, useMemo } from "react";
import { getMe } from "../services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const getAndSetUser = async () => {
      try {
        const data = await getMe();
        if (data && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        // Not logged in
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
      loginLoading,
      setLoginLoading,
      registerLoading,
      setRegisterLoading,
      googleLoading,
      setGoogleLoading,
      logoutLoading,
      setLogoutLoading,
    }),
    [user, loading, loginLoading, registerLoading, googleLoading, logoutLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
