import { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";

function DashboardLayout() {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);

    const userName = localStorage.getItem("name") || "Admin";
    const userInitials = userName
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        navigate("/auth");
    };

    const styles = {
        appShell: {
            display: "flex",
            minHeight: "100vh",
            width: "100%",
            background: "#f5f6fb",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            color: "#000",
        },
        sidebar: {
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: sidebarCollapsed ? "80px" : "240px",
            background: "linear-gradient(180deg,#ffffff,#fff6ec)",
            borderRight: "1px solid rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            transition: "width 0.3s ease",
            zIndex: 100,
        },
        sidebarBrand: {
            padding: "20px 18px",
            borderBottom: "1px solid rgba(0,0,0,0.04)",
        },
        brandFull: {
            fontWeight: 700,
            fontSize: 22,
            color: "#000",
        },
        brandMini: {
            fontWeight: 700,
            fontSize: 18,
            color: "#ff6b00",
        },
        navList: {
            flex: 1,
            padding: "12px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
        },
        navItem: {
            border: "none",
            background: "transparent",
            borderRadius: 12,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#000",
            cursor: "pointer",
            fontSize: 14,
            transition: "all 0.2s",
        },
        navItemActive: {
            background: "linear-gradient(90deg,#ffe4c2,#fff)",
            color: "#ff6b00",
            boxShadow: "0 0 0 1px rgba(255,107,0,0.25)",
        },
        navIcon: {
            fontSize: 16,
            width: 20,
            textAlign: "center",
        },
        collapse: {
            margin: 12,
            padding: "8px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,107,0,0.3)",
            background: "#fff7ee",
            color: "#ff6b00",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
        },
        mainArea: {
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            background: "#f5f6fb",
            marginLeft: sidebarCollapsed ? "80px" : "240px",
            transition: "margin-left 0.3s ease",
        },
        topBar: {
            position: "sticky",
            top: 0,
            zIndex: 10,
            padding: "16px 28px",
            background: "#ffffff",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            borderBottom: "1px solid rgba(0,0,0,0.04)",
            gap: 12,
        },
        avatarContainer: {
            position: "relative",
        },
        avatar: {
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#ff6b00",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
        },
        avatarMenu: {
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "#ffffff",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            minWidth: 200,
            padding: 8,
            zIndex: 1000,
        },
        menuHeader: {
            padding: "12px 12px 8px",
        },
        menuName: {
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: "#000",
        },
        menuEmail: {
            margin: 0,
            fontSize: 12,
            color: "#666",
            marginTop: 2,
        },
        menuDivider: {
            height: 1,
            background: "rgba(0,0,0,0.08)",
            margin: "8px 0",
        },
        menuItem: {
            width: "100%",
            padding: "10px 12px",
            border: "none",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 14,
            color: "#000",
            cursor: "pointer",
            borderRadius: 8,
            transition: "background 0.2s",
            textAlign: "left",
        },
        menuItemDanger: {
            width: "100%",
            padding: "10px 12px",
            border: "none",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 14,
            color: "#e03131",
            cursor: "pointer",
            borderRadius: 8,
            transition: "background 0.2s",
            textAlign: "left",
            fontWeight: 600,
        },
        menuIcon: {
            fontSize: 16,
            width: 20,
            textAlign: "center",
        },
    };

    return (
        <div style={styles.appShell}>
            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <div style={styles.sidebarBrand}>
                    {sidebarCollapsed ? (
                        <span style={styles.brandMini}>VS</span>
                    ) : (
                        <span style={styles.brandFull}>
              Vid<span style={{ color: "#ff6b00" }}>Streem</span>
            </span>
                    )}
                </div>

                <nav style={styles.navList}>
                    <button
                        style={styles.navItem}
                        onClick={() => navigate("/dashboard")}
                    >
                        <span style={styles.navIcon}>▣</span>
                        {!sidebarCollapsed && <span>Dashboard</span>}
                    </button>
                    <button
                        style={styles.navItem}
                        onClick={() => navigate("/uploadvideo")}
                    >
                        <span style={styles.navIcon}>⬆</span>
                        {!sidebarCollapsed && <span>Upload Video</span>}
                    </button>
                    <button
                        style={styles.navItem}
                        onClick={() => navigate("/Videos")}
                    >
                        <span style={styles.navIcon}>▶</span>
                        {!sidebarCollapsed && <span>Videos</span>}
                    </button>
                    <button
                        style={styles.navItem}
                        onClick={() => navigate("/Categorys")}
                    >
                        <span style={styles.navIcon}>▦</span>
                        {!sidebarCollapsed && <span>Categories</span>}
                    </button>
                    <button
                        style={styles.navItem}
                        onClick={() => navigate("/UserManagement")}
                    >
                        <span style={styles.navIcon}>⚙</span>
                        {!sidebarCollapsed && <span>User</span>}
                    </button>
                </nav>

                <button
                    style={styles.collapse}
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                    {sidebarCollapsed ? "→" : "←"}
                </button>
            </aside>

            {/* Main Area */}
            <div style={styles.mainArea}>
                {/* Top Bar */}
                <header style={styles.topBar}>
                    <div style={styles.avatarContainer}>
                        <div
                            style={styles.avatar}
                            onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                        >
                            {userInitials}
                        </div>
                        {showAvatarMenu && (
                            <div style={styles.avatarMenu}>
                                <div style={styles.menuHeader}>
                                    <p style={styles.menuName}>{userName}</p>
                                    <p style={styles.menuEmail}>
                                        {localStorage.getItem("role") || "User"}
                                    </p>
                                </div>
                                <div style={styles.menuDivider}></div>
                                <button
                                    style={styles.menuItem}
                                    onClick={() => navigate("/profile")}
                                >
                                    <span style={styles.menuIcon}>👤</span> Profile
                                </button>
                                <button
                                    style={styles.menuItem}
                                    onClick={() => navigate("/settings")}
                                >
                                    <span style={styles.menuIcon}>⚙</span> Users
                                </button>
                                <div style={styles.menuDivider}></div>
                                <button
                                    style={styles.menuItemDanger}
                                    onClick={handleLogout}
                                >
                                    <span style={styles.menuIcon}>🚪</span> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* This is where child routes render */}
                <Outlet />
            </div>
        </div>
    );
}

export default DashboardLayout;
