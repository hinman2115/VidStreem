import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div style={styles.container}>
            {/* Background decorations */}
            <div style={styles.bgDecoration1}></div>
            <div style={styles.bgDecoration2}></div>

            <div style={styles.card}>
                {/* Logo Section */}
                <div style={styles.logoSection}>
                    <div style={styles.logoText}>
                        Vid<span style={styles.logoAccent}>Streem</span>
                    </div>
                    <div style={styles.tagline}>Your Video Management Platform</div>
                </div>

                {/* Toggle Bar */}
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

// ========== Login Form ==========
function LoginForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!email.trim() || !password) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("http://vidstreem.runasp.net/api/User/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accept: "*/*",
                },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Login failed");
                setLoading(false);
                return;
            }

            // Admin-only access control
            if (data.role !== "Admin") {
                setError("Access Denied: Only Admins can access the dashboard");
                setLoading(false);
                return;
            }

            // Store token and user data
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("role", data.role);
            localStorage.setItem("name", data.name);

            // Navigate to dashboard
            navigate("/dashboard");
        } catch (err) {
            console.error("Login error:", err);
            setError("Network error. Please check your connection.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h2 style={styles.formTitle}>Welcome Back</h2>
            <p style={styles.formSubtitle}>Login to manage your videos</p>

            {error && (
                <div style={styles.errorBox}>
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            <div style={styles.field}>
                <label style={styles.label}>Email Address</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    style={styles.input}
                />
            </div>

            <div style={styles.field}>
                <label style={styles.label}>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={styles.input}
                />
            </div>

            <div style={styles.adminNote}>
                <span>🔒</span>
                <span style={styles.adminText}>Admin access only</span>
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>
    );
}

// ========== Signup Form ==========
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

        if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
            setError("Please fill all fields");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
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
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
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

            setSuccess("Account created successfully! You can now login.");
            setName("");
            setEmail("");
            setPhone("");
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error("Signup error:", err);
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSubtitle}>Join VidStreem today</p>

            {error && (
                <div style={styles.errorBox}>
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div style={styles.successBox}>
                    <span>✓</span>
                    <span>{success}</span>
                </div>
            )}

            <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    style={styles.input}
                />
            </div>

            <div style={styles.field}>
                <label style={styles.label}>Email Address</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    style={styles.input}
                />
            </div>

            <div style={styles.field}>
                <label style={styles.label}>Phone Number</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    required
                    style={styles.input}
                />
            </div>

            <div style={styles.field}>
                <label style={styles.label}>Role</label>
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
                <label style={styles.label}>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    style={styles.input}
                />
            </div>

            <div style={styles.field}>
                <label style={styles.label}>Confirm Password</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
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

// ========== Styles ==========
const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #fff5ec, #ffe4c2, #ffd4a3)",
        position: "relative",
        overflow: "hidden",
    },
    bgDecoration1: {
        position: "absolute",
        top: "-10%",
        right: "-5%",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #ff6b00, #ff8c1a)",
        opacity: 0.1,
        filter: "blur(60px)",
    },
    bgDecoration2: {
        position: "absolute",
        bottom: "-10%",
        left: "-5%",
        width: "350px",
        height: "350px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #ff8c1a, #ffb347)",
        opacity: 0.1,
        filter: "blur(60px)",
    },
    card: {
        background: "#ffffff",
        borderRadius: "24px",
        width: "100%",
        maxWidth: "440px",
        boxShadow: "0 20px 60px rgba(255, 107, 0, 0.15)",
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
    },
    logoSection: {
        padding: "32px 32px 24px",
        textAlign: "center",
        background: "linear-gradient(180deg, #fff7ee, #ffffff)",
        borderBottom: "1px solid rgba(255, 107, 0, 0.1)",
    },
    logoText: {
        fontSize: "32px",
        fontWeight: "700",
        color: "#000",
    },
    logoAccent: {
        color: "#ff6b00",
    },
    tagline: {
        marginTop: "8px",
        fontSize: "14px",
        color: "#666",
        fontWeight: "500",
    },
    toggleBar: {
        display: "flex",
        background: "#f9f9f9",
        padding: "4px",
        margin: "16px",
        borderRadius: "12px",
    },
    activeTab: {
        flex: 1,
        padding: "12px",
        border: "none",
        background: "linear-gradient(135deg, #ff6b00, #ff8c1a)",
        color: "white",
        fontWeight: "600",
        fontSize: "15px",
        cursor: "pointer",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(255, 107, 0, 0.3)",
        transition: "all 0.3s ease",
    },
    inactiveTab: {
        flex: 1,
        padding: "12px",
        border: "none",
        background: "transparent",
        color: "#666",
        fontWeight: "500",
        fontSize: "15px",
        cursor: "pointer",
        borderRadius: "10px",
        transition: "all 0.3s ease",
    },
    form: {
        padding: "24px 32px 32px",
    },
    formTitle: {
        margin: "0 0 4px 0",
        fontSize: "24px",
        fontWeight: "700",
        color: "#000",
    },
    formSubtitle: {
        margin: "0 0 24px 0",
        fontSize: "14px",
        color: "#666",
    },
    field: {
        marginBottom: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    label: {
        display: "block",
        fontSize: "14px",
        fontWeight: "600",
        color: "#000",
    },
    input: {
        width: "100%",
        padding: "12px 14px",
        border: "1px solid #e0e0e0",
        borderRadius: "10px",
        fontSize: "14px",
        transition: "all 0.2s ease",
        outline: "none",
        boxSizing: "border-box",
    },
    adminNote: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 14px",
        background: "#fff7ee",
        borderRadius: "10px",
        border: "1px solid rgba(255, 107, 0, 0.3)",
        marginBottom: "16px",
    },
    adminText: {
        color: "#ff6b00",
        fontWeight: "600",
        fontSize: "13px",
    },
    submitBtn: {
        width: "100%",
        padding: "14px",
        background: "linear-gradient(135deg, #ff6b00, #ff8c1a)",
        color: "white",
        border: "none",
        borderRadius: "10px",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        marginTop: "6px",
        transition: "transform 0.2s",
        boxShadow: "0 4px 16px rgba(255, 107, 0, 0.3)",
    },
    errorBox: {
        padding: "12px 14px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "16px",
        background: "#fff0f0",
        border: "1px solid #ffcccc",
        color: "#cc0000",
        fontSize: "14px",
        fontWeight: "500",
    },
    successBox: {
        padding: "12px 14px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "16px",
        background: "#f0fff4",
        border: "1px solid #c6f6d5",
        color: "#22543d",
        fontSize: "14px",
        fontWeight: "500",
    },
};

export default AuthPage;
