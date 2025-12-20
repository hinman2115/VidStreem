// src/AuthPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ADD THIS

function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.toggleBar}>
                    <button
                        onClick={() => setIsLogin(true)}
                        style={isLogin ? styles.activeTab : styles.inactiveTab}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        style={!isLogin ? styles.activeTab : styles.inactiveTab}
                    >
                        Sign Up
                    </button>
                </div>

                {isLogin ? <LoginForm /> : <SignupForm />}
            </div>
        </div>
    );
}

// ========== Login Form (UPDATED) ==========
function LoginForm() {
    const navigate = useNavigate(); // ADD THIS
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("http://vidstreem.runasp.net/api/User/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accept: "*/*",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Login failed");
                setLoading(false);
                return;
            }

            // Store token and user data
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("role", data.role);
            localStorage.setItem("name", data.name);

            // NAVIGATE TO DASHBOARD
            navigate("/dashboard");
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h2>Login to VidStreem</h2>
            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.field}>
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />
            </div>

            <div style={styles.field}>
                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                />
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>
    );
}

// ========== Signup Form (same as before) ==========
function SignupForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("User");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://vidstreem.runasp.net/api/User/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accept: "*/*",
                },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    role,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Signup failed");
                setLoading(false);
                return;
            }

            setSuccess("Account created! You can login now.");
            setName("");
            setEmail("");
            setPhone("");
            setPassword("");
            setConfirmPassword("");
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h2>Create VidStreem Account</h2>
            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}

            <div style={styles.field}>
                <label>Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={styles.input}
                />
            </div>

            <div style={styles.field}>
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />
            </div>

            <div style={styles.field}>
                <label>Phone</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={styles.input}
                />
            </div>

            <div style={styles.field}>
                <label>Role</label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    style={styles.input}
                >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                </select>
            </div>

            <div style={styles.field}>
                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                />
            </div>

            <div style={styles.field}>
                <label>Confirm Password</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={styles.input}
                />
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading ? "Creating..." : "Sign Up"}
            </button>
        </form>
    );
}

// ========== Styles (same as before) ==========
const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    card: {
        background: "#ffffff",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        overflow: "hidden",
    },
    toggleBar: {
        display: "flex",
        background: "#f7f7f7",
    },
    activeTab: {
        flex: 1,
        padding: "14px",
        border: "none",
        background: "#ffffff",
        fontWeight: "600",
        fontSize: "16px",
        cursor: "pointer",
        borderBottom: "3px solid #667eea",
        color: "#667eea",
    },
    inactiveTab: {
        flex: 1,
        padding: "14px",
        border: "none",
        background: "#f7f7f7",
        fontWeight: "500",
        fontSize: "16px",
        cursor: "pointer",
        color: "#888",
    },
    form: {
        padding: "28px",
    },
    field: {
        marginBottom: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    input: {
        padding: "10px",
        fontSize: "14px",
        border: "1px solid #ddd",
        borderRadius: "6px",
    },
    submitBtn: {
        width: "100%",
        padding: "12px",
        background: "#667eea",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        marginTop: "8px",
    },
    error: { color: "red", marginBottom: "12px", fontSize: "14px" },
    success: { color: "green", marginBottom: "12px", fontSize: "14px" },
};

export default AuthPage;
