import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { login, logout, register, getCurrentUser, loginWithGoogle, linkGoogle, setPassword } from "../api/services/authService";
import { extractError } from "../utils/extractError";

export const useAuth = () => {

  const context = useContext(AuthContext);

  const { user, setUser, loading, setLoading } = context;

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
      setLoading(true);
      await logout();
      setUser(null);
    } catch (error) {
      // Logout failed server-side — clear the user locally anyway since the
      // access token is short-lived, but surface the error to the caller.
      setUser(null);
      throw new Error(extractError(error, 'Logout failed. Please try again.'));
    } finally {
      setLoading(false);
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

  return { user, setUser, loading, setLoading, handleLogin, handleLogout, handleRegister, handleGetCurrentUser, handleGoogleLogin, handleLinkGoogle, handleSetPassword };
};

