// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const res = await axiosInstance.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post("/auth/login", { email, password });
      const token = res.data.token;
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
      await fetchUserProfile(token);
    } catch (err) {
      alert("Invalid credentials or server issue.");
    }
  };

  const register = async (email, password) => {
    try {
      await axiosInstance.post("/auth/signup", {
        email,
        password,
        username: email.split("@")[0],
      });
      await login(email, password);
    } catch (err) {
      alert("Registration failed or user already exists.");
    }
  };

  const logout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("chatMessages"); // 👈 clear chat
      setIsAuthenticated(false);
      setUser(null);
      setIsLoggingOut(false);
    }, 1000);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        register,
        logout,
        isLoggingOut,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
