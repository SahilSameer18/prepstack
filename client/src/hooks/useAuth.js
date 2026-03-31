import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { login, logout, register, getCurrentUser } from "../api/services/authService";

export const useAuth = () => {

  const context = useContext(AuthContext);

  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      const data = await login({ email, password });
      setUser(data.user);
    } catch (error) {
      setLoading(false);
      throw error
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      setUser(null);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  const handleRegister = async (name, email, password) => {
    try {
      setLoading(true);
      const data = await register({ name, email, password });
      setUser(data.user);
    } catch (error) {
      setLoading(false);
      throw error
    } finally {
      setLoading(false);
    }
  }

  const handleGetCurrentUser = async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      setUser(data.user);
    } catch (error) {
      setLoading(false);
      throw error
    } finally {
      setLoading(false);
    }
  }

  return { user, setUser, loading, setLoading, handleLogin, handleLogout, handleRegister, handleGetCurrentUser };

}