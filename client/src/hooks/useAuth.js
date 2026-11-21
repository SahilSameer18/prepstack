import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { login, logout, logoutAll, register, getCurrentUser, loginWithGoogle, linkGoogle, setPassword } from "../api/services/authService";
import { extractError } from "../utils/extractError";
import { signOut } from "../utils/signOut";

export const useAuth = () => {
  const context = useContext(AuthContext);

  const { user, setUser, loading, setLoading, authError, retrySession, isLoggingOut, setIsLoggingOut } = context;

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      const data = await login({ email, password });
      setUser(data?.data?.user || data?.user);
    } catch (error) {
      throw new Error(extractError(error, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (setIsLoggingOut) setIsLoggingOut(true);
      
      await signOut(logout); // only a confirmed sign-out may continue to the success path
      setUser(null);
    } finally {
      if (setIsLoggingOut) setIsLoggingOut(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      if (setIsLoggingOut) setIsLoggingOut(true);

      await signOut(logoutAll);
      setUser(null);
    } finally {
      if (setIsLoggingOut) setIsLoggingOut(false);
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      setLoading(true);
      const data = await register({ name, email, password });
      setUser(data?.data?.user || data?.user);
    } catch (error) {
      throw new Error(extractError(error, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentUser = async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      setUser(data?.data?.user || data?.user);
    } catch (error) {
      throw new Error(extractError(error, 'Failed to fetch user. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (idToken) => {
    try {
      setLoading(true);
      const data = await loginWithGoogle(idToken);
      setUser(data?.data?.user || data?.user);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkGoogle = async (idToken) => {
    try {
      setLoading(true);
      const data = await linkGoogle(idToken);
      setUser(data?.data?.user || data?.user);
    } catch (error) {
      throw new Error(extractError(error, "Linking Google account failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (password) => {
    try {
      setLoading(true);
      const data = await setPassword(password);
      setUser(data?.data?.user || data?.user);
    } catch (error) {
      throw new Error(extractError(error, "Setting password failed."));
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    setUser,
    loading,
    setLoading,
    authError,
    retrySession,
    isLoggingOut,
    setIsLoggingOut,
    handleLogin,
    handleLogout,
    handleLogoutAll,
    handleRegister,
    handleGetCurrentUser,
    handleGoogleLogin,
    handleLinkGoogle,
    handleSetPassword,
  };
};

