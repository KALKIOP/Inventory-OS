import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login, register, error: authError, setError } = useAuth();
    
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");

    const handleSwitchMode = () => {
        setIsRegister(!isRegister);
        setUsername("");
        setEmail("");
        setPassword("");
        setFormError("");
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setError(null);

        // Client-side validations
        if (!username || !password || (isRegister && !email)) {
            setFormError("All fields are required.");
            return;
        }

        if (password.length < 6) {
            setFormError("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        try {
            if (isRegister) {
                await register(username, email, password);
            } else {
                await login(username, password);
            }
        } catch (err) {
            console.error("Auth action failed:", err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.logo}>📦</div>
                    <h2 style={styles.title}>
                        {isRegister ? "Create Portal Account" : "Enterprise Portal Login"}
                    </h2>
                    <p style={styles.subtitle}>
                        {isRegister 
                            ? "Sign up to begin managing inventories, customers, and orders." 
                            : "Provide your credentials to access the inventory console."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {(formError || authError) && (
                        <div style={styles.errorAlert}>
                            ⚠️ {formError || authError}
                        </div>
                    )}

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Username</label>
                        <input
                            type="text"
                            placeholder="e.g. admin_manager"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    {isRegister && (
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address</label>
                            <input
                                type="email"
                                placeholder="e.g. manager@enterprise.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                    )}

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            placeholder="••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={styles.submitBtn}
                    >
                        {loading 
                            ? "Processing Auth Request..." 
                            : isRegister ? "Sign Up & Launch" : "Authenticate Access"}
                    </button>
                </form>

                <div style={styles.footer}>
                    <span>
                        {isRegister ? "Already have an account?" : "Need administrative access?"}
                    </span>
                    <button onClick={handleSwitchMode} style={styles.switchBtn}>
                        {isRegister ? "Login to existing session" : "Register new admin account"}
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 0) 40%), #0b0f19",
        padding: "20px",
    },
    card: {
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "20px",
        padding: "40px 30px",
        width: "100%",
        maxWidth: "450px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
    },
    header: {
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
    },
    logo: {
        fontSize: "2.5rem",
        background: "rgba(99, 102, 241, 0.1)",
        padding: "15px",
        borderRadius: "50%",
        border: "1px solid rgba(99, 102, 241, 0.2)",
        display: "inline-block",
        lineHeight: 1,
    },
    title: {
        fontSize: "1.6rem",
        fontWeight: "700",
        color: "#ffffff",
        margin: 0,
        letterSpacing: "-0.5px",
    },
    subtitle: {
        fontSize: "0.9rem",
        color: "rgba(255, 255, 255, 0.6)",
        margin: 0,
        lineHeight: "1.4",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    errorAlert: {
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        color: "#f87171",
        borderRadius: "10px",
        padding: "12px",
        fontSize: "0.85rem",
        textAlign: "left",
        lineHeight: "1.4",
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        textAlign: "left",
    },
    label: {
        fontSize: "0.85rem",
        fontWeight: "600",
        color: "rgba(255, 255, 255, 0.8)",
    },
    input: {
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "10px",
        padding: "12px 16px",
        fontSize: "0.95rem",
        color: "#ffffff",
        outline: "none",
        transition: "border-color 0.2s, background-color 0.2s",
        "&:focus": {
            borderColor: "#6366f1",
            background: "rgba(255, 255, 255, 0.08)",
        }
    },
    submitBtn: {
        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
        border: "none",
        borderRadius: "10px",
        padding: "14px",
        color: "#ffffff",
        fontSize: "0.95rem",
        fontWeight: "600",
        cursor: "pointer",
        transition: "transform 0.1s, filter 0.2s",
        marginTop: "10px",
        "&:hover": {
            filter: "brightness(1.1)",
        },
        "&:active": {
            transform: "scale(0.98)",
        }
    },
    footer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        fontSize: "0.85rem",
        color: "rgba(255, 255, 255, 0.5)",
    },
    switchBtn: {
        background: "none",
        border: "none",
        color: "#818cf8",
        fontWeight: "600",
        cursor: "pointer",
        fontSize: "0.85rem",
        padding: 0,
        textDecoration: "underline",
        "&:hover": {
            color: "#a5b4fc",
        }
    }
};
