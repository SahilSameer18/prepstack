import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { login, logout, register, getCurrentUser, loginWithGoogle, linkGoogle, setPassword } from "../api/services/authService";
import { extractError } from "../utils/extractError";

export const useAuth = () => {
  const context = useContext(AuthContext);

  const { user, setUser, loading, setLoading, isLoggingOut, setIsLoggingOut } = context;

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      const data = await login({ email, password });
      setUser(data.user);
    } catch (error) {
      throw new Error(extractError(error, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (setIsLoggingOut) setIsLoggingOut(true);
      
      // Perform server logout and allow the full-screen overlay to display smoothly for 800ms
      await Promise.allSettled([
        logout(),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);

      setUser(null);
    } catch (error) {
      setUser(null);
      throw new Error(extractError(error, 'Logout failed. Please try again.'));
    } finally {
      if (setIsLoggingOut) setIsLoggingOut(false);
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      setLoading(true);
      const data = await register({ name, email, password });
      setUser(data.user);
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
      setUser(data.user);
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
      setUser(data.user);
    } catch (error) {
      throw error; // Re-throw the raw Axios error so Login.jsx can inspect error.response.status
    } finally {
      setLoading(false);
    }
  };

  const handleLinkGoogle = async (idToken) => {
    try {
      setLoading(true);
      const data = await linkGoogle(idToken);
      setUser(data.user);
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
      setUser(data.user);
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
    isLoggingOut,
    setIsLoggingOut,
    handleLogin,
    handleLogout,
    handleRegister,
    handleGetCurrentUser,
    handleGoogleLogin,
    handleLinkGoogle,
    handleSetPassword,
  };
};
