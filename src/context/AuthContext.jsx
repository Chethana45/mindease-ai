import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = !!user;

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setError(null);
      const res = await API.get("/auth/profile");
      setUser(res.data.user);
    } catch (err) {
      console.error("Auth fetchProfile error:", err);
      // Token invalid/expired — clear it
      localStorage.removeItem("token");
      setUser(null);
      setError(err.response?.data?.message || "Session expired. Please login again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const res = await API.post("/auth/login", { email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem("token", token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
      return { success: false, message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setError(null);
    try {
      await API.post("/auth/register", { name, email, password });
      // Auto-login after successful registration
      const loginRes = await API.post("/auth/login", { email, password });
      const { token, user: userData } = loginRes.data;
      localStorage.setItem("token", token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
  }, []);

  const updateUser = useCallback(async (name, email) => {
    setError(null);
    try {
      const res = await API.put("/auth/profile", { name, email });
      const { user: userData } = res.data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update profile. Please try again.";
      setError(message);
      return { success: false, message };
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError,
    fetchProfile,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;