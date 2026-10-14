import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { login, register, googleAuth, linkGoogle, logout } from "../services/auth.api";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const {
    user,
    setUser,
    loading,
    loginLoading,
    setLoginLoading,
    registerLoading,
    setRegisterLoading,
    googleLoading,
    setGoogleLoading,
    logoutLoading,
    setLogoutLoading,
  } = context;

  const handleLogin = async ({ email, password }) => {
    setLoginLoading(true);
    try {
      const data = await login({ email, password });
      setUser(data.user);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setRegisterLoading(true);
    try {
      const data = await register({ username, email, password });
      setUser(data.user);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleGoogleAuth = async ({ accessToken }) => {
    setGoogleLoading(true);
    try {
      const data = await googleAuth({ accessToken });
      if (data && data.user) {
        setUser(data.user);
      }
      return data;
    } catch (err) {
      throw err;
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLinkGoogle = async ({ accessToken }) => {
    setGoogleLoading(true);
    try {
      const data = await linkGoogle({ accessToken });
      if (data && data.user) {
        setUser(data.user);
      }
      return data;
    } catch (err) {
      throw err;
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLogoutLoading(false);
    }
  };

  return {
    user,
    setUser,
    loading,
    loginLoading,
    registerLoading,
    googleLoading,
    logoutLoading,
    handleRegister,
    handleLogin,
    handleGoogleAuth,
    handleLinkGoogle,
    handleLogout,
  };
};