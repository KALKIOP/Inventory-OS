import React, { createContext, useState, useEffect, useContext } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user details if token exists on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const userData = await api.auth.me();
                    setUser(userData);
                } catch (err) {
                    console.error("Failed to authenticate session token:", err);
                    localStorage.removeItem("token");
                    setUser(null);
                }
            }
            setLoading(false);
        };
        initializeAuth();
    }, []);

    // Login action
    const login = async (username, password) => {
        setError(null);
        try {
            const data = await api.auth.login(username, password);
            localStorage.setItem("token", data.access_token);
            const userData = await api.auth.me();
            setUser(userData);
            return userData;
        } catch (err) {
            const msg = err.message || "Invalid credentials. Please try again.";
            setError(msg);
            throw new Error(msg);
        }
    };

    // Register action
    const register = async (username, email, password) => {
        setError(null);
        try {
            await api.auth.register(username, email, password);
            // Automatically log in user after successful registration
            return await login(username, password);
        } catch (err) {
            const msg = err.message || "Registration failed. Username or email may already be in use.";
            setError(msg);
            throw new Error(msg);
        }
    };

    // Logout action
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setError(null);
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout, setError }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
