import { useState, useEffect } from "react";
import axios from "axios";

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [subscriptionFilter, setSubscriptionFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");
    const [sortBy, setSortBy] = useState("joiningDate");

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [users, searchTerm, subscriptionFilter, roleFilter, sortBy]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                "http://vidstreem.runasp.net/api/User/all-with-subscriptions"
            );
            if (response.data.data && Array.isArray(response.data.data)) {
                setUsers(response.data.data);
            } else if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...users];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (user) =>
                    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply subscription filter
        if (subscriptionFilter !== "all") {
            filtered = filtered.filter((user) => {
                if (subscriptionFilter === "active") {
                    return user.activeSubscription !== null;
                } else if (subscriptionFilter === "expired") {
                    return user.totalSubscriptions > 0 && user.activeSubscription === null;
                } else if (subscriptionFilter === "none") {
                    return user.totalSubscriptions === 0;
                }
                return true;
            });
        }

        // Apply role filter
        if (roleFilter !== "all") {
            filtered = filtered.filter((user) => user.role === roleFilter);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            if (sortBy === "name") {
                return a.name.localeCompare(b.name);
            } else if (sortBy === "joiningDate") {
                return new Date(b.joiningDate) - new Date(a.joiningDate);
            } else if (sortBy === "accountAgeDays") {
                return b.accountAgeDays - a.accountAgeDays;
            }
            return 0;
        });

        setFilteredUsers(filtered);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getSubscriptionStatus = (user) => {
        if (user.activeSubscription) {
            return { text: "Active", color: "#28a745" };
        } else if (user.totalSubscriptions > 0) {
            return { text: "Expired", color: "#dc3545" };
        } else {
            return { text: "None", color: "#6c757d" };
        }
    };

    // Statistics
    const stats = {
        total: users.length,
        activeSubscriptions: users.filter((u) => u.activeSubscription !== null).length,
        expiredSubscriptions: users.filter(
            (u) => u.totalSubscriptions > 0 && u.activeSubscription === null
        ).length,
        noSubscription: users.filter((u) => u.totalSubscriptions === 0).length,
        usersOnly: users.filter((u) => u.role === "User").length,
    };

    if (loading) {
        return (
            <div style={styles.fullscreenCenter}>
                <div style={styles.spinner}></div>
                <p style={{ marginTop: 12, color: "#ff6b00" }}>Loading Users...</p>
            </div>
        );
    }

    return (
        <div style={styles.contentScroll}>
            {/* Page Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>User Management</h1>
                    <p style={styles.breadcrumb}>Dashboard / Users</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsRow}>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>👥</div>
                    <div>
                        <p style={styles.statLabel}>Total Users</p>
                        <h3 style={styles.statValue}>{stats.total}</h3>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIconActive}>✓</div>
                    <div>
                        <p style={styles.statLabel}>Active Subscriptions</p>
                        <h3 style={styles.statValue}>{stats.activeSubscriptions}</h3>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIconExpired}>⏱</div>
                    <div>
                        <p style={styles.statLabel}>Expired</p>
                        <h3 style={styles.statValue}>{stats.expiredSubscriptions}</h3>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIconNone}>○</div>
                    <div>
                        <p style={styles.statLabel}>No Subscription</p>
                        <h3 style={styles.statValue}>{stats.noSubscription}</h3>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <section style={styles.filterCard}>
                <div style={styles.filterRow}>
                    <div style={styles.searchBox}>
                        <input
                            style={styles.searchInput}
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Subscription</label>
                        <select
                            style={styles.filterSelect}
                            value={subscriptionFilter}
                            onChange={(e) => setSubscriptionFilter(e.target.value)}
                        >
                            <option value="all">All Users</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="none">No Subscription</option>
                        </select>
                    </div>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Role</label>
                        <select
                            style={styles.filterSelect}
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="User">User</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Sort By</label>
                        <select
                            style={styles.filterSelect}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="joiningDate">Joining Date</option>
                            <option value="name">Name</option>
                            <option value="accountAgeDays">Account Age</option>
                        </select>
                    </div>
                    <button
                        style={styles.refreshBtn}
                        onClick={loadUsers}
                        title="Refresh"
                    >
                        ↻
                    </button>
                </div>
                <div style={styles.resultCount}>
                    Showing {filteredUsers.length} of {users.length} users
                </div>
            </section>

            {/* Users Table */}
            <section style={styles.tableCard}>
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.th}>User</th>
                            <th style={styles.th}>Contact</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Joining Date</th>
                            <th style={styles.th}>Account Age</th>
                            <th style={styles.th}>Subscription</th>
                            <th style={styles.th}>Plan Details</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => {
                                const status = getSubscriptionStatus(user);
                                return (
                                    <tr key={user.userId} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={styles.userCell}>
                                                <div style={styles.userAvatar}>
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p style={styles.userName}>{user.name}</p>
                                                    <p style={styles.userId}>ID: {user.userId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <p style={styles.email}>{user.email}</p>
                                            <p style={styles.phone}>{user.phone || "N/A"}</p>
                                        </td>
                                        <td style={styles.td}>
                        <span
                            style={{
                                ...styles.roleBadge,
                                background: user.role === "Admin" ? "#fff3cd" : "#d1ecf1",
                                color: user.role === "Admin" ? "#856404" : "#0c5460",
                            }}
                        >
                          {user.role}
                        </span>
                                        </td>
                                        <td style={styles.td}>{formatDate(user.joiningDate)}</td>
                                        <td style={styles.td}>
                                            <strong>{user.accountAgeDays}</strong> days
                                        </td>
                                        <td style={styles.td}>
                        <span
                            style={{
                                ...styles.statusBadge,
                                background: status.color,
                            }}
                        >
                          {status.text}
                        </span>
                                            <p style={styles.subCount}>
                                                {user.totalSubscriptions} total
                                            </p>
                                        </td>
                                        <td style={styles.td}>
                                            {user.activeSubscription ? (
                                                <div style={styles.planDetails}>
                                                    <p style={styles.planName}>
                                                        {user.activeSubscription.planName}
                                                    </p>
                                                    <p style={styles.planAmount}>
                                                        ₹{user.activeSubscription.amount}
                                                    </p>
                                                    <p style={styles.planDays}>
                                                        {user.activeSubscription.daysRemaining} days left
                                                    </p>
                                                </div>
                                            ) : (
                                                <p style={styles.noPlan}>No active plan</p>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ ...styles.td, textAlign: "center", padding: 40 }}>
                                    <p style={styles.emptyText}>No users found</p>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

const styles = {
    fullscreenCenter: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff5ec",
    },
    spinner: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "4px solid #ffe2c2",
        borderTopColor: "#ff6b00",
        animation: "spin 1s linear infinite",
    },
    contentScroll: {
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: "24px 28px 32px",
    },
    pageHeader: {
        marginBottom: 24,
    },
    pageTitle: {
        margin: 0,
        fontSize: 22,
        fontWeight: 700,
        color: "#000",
    },
    breadcrumb: {
        margin: 0,
        fontSize: 12,
        color: "#000",
        marginTop: 2,
        opacity: 0.6,
    },
    statsRow: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
        gap: 20,
        marginBottom: 24,
    },
    statCard: {
        background: "#ffffff",
        borderRadius: 16,
        padding: 16,
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
    },
    statIcon: {
        width: 46,
        height: 46,
        borderRadius: 14,
        background: "linear-gradient(135deg,#ff6b00,#ff9c3a)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
    },
    statIconActive: {
        width: 46,
        height: 46,
        borderRadius: 14,
        background: "linear-gradient(135deg,#28a745,#5cb85c)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
    },
    statIconExpired: {
        width: 46,
        height: 46,
        borderRadius: 14,
        background: "linear-gradient(135deg,#dc3545,#e74c3c)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
    },
    statIconNone: {
        width: 46,
        height: 46,
        borderRadius: 14,
        background: "linear-gradient(135deg,#6c757d,#95a5a6)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
    },
    statLabel: {
        margin: 0,
        fontSize: 12,
        color: "#000",
        opacity: 0.6,
    },
    statValue: {
        margin: 0,
        fontSize: 22,
        fontWeight: 700,
        color: "#000",
        marginTop: 4,
    },
    filterCard: {
        background: "#ffffff",
        borderRadius: 16,
        boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
        padding: 20,
        marginBottom: 24,
    },
    filterRow: {
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "flex-end",
    },
    searchBox: {
        flex: "1 1 300px",
    },
    searchInput: {
        width: "100%",
        padding: "10px 16px",
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.12)",
        fontSize: 14,
        outline: "none",
        color: "#000",
        background: "#fff",
        boxSizing: "border-box",
    },
    filterGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    filterLabel: {
        fontSize: 12,
        fontWeight: 600,
        color: "#000",
        opacity: 0.7,
    },
    filterSelect: {
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.12)",
        fontSize: 14,
        outline: "none",
        color: "#000",
        background: "#fff",
        cursor: "pointer",
        minWidth: 150,
    },
    refreshBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        border: "1px solid rgba(255,107,0,0.3)",
        background: "#fff7ee",
        color: "#ff6b00",
        fontSize: 20,
        fontWeight: 600,
        cursor: "pointer",
    },
    resultCount: {
        marginTop: 12,
        fontSize: 13,
        color: "#666",
        fontWeight: 500,
    },
    tableCard: {
        background: "#ffffff",
        borderRadius: 16,
        boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
        padding: 0,
        overflow: "hidden",
    },
    tableWrapper: {
        overflowX: "auto",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
    },
    th: {
        padding: 16,
        textAlign: "left",
        fontSize: 13,
        fontWeight: 700,
        color: "#000",
        background: "#f8f9fa",
        borderBottom: "2px solid #e9ecef",
        whiteSpace: "nowrap",
    },
    tr: {
        borderBottom: "1px solid #e9ecef",
        transition: "background 0.2s",
    },
    td: {
        padding: "14px 16px",
        fontSize: 14,
        color: "#000",
        verticalAlign: "top",
    },
    userCell: {
        display: "flex",
        alignItems: "center",
        gap: 12,
    },
    userAvatar: {
        width: 42,
        height: 42,
        borderRadius: "50%",
        background: "#ff6b00",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        fontWeight: 700,
        flexShrink: 0,
    },
    userName: {
        margin: 0,
        fontSize: 14,
        fontWeight: 600,
        color: "#000",
    },
    userId: {
        margin: 0,
        fontSize: 11,
        color: "#666",
        marginTop: 2,
    },
    email: {
        margin: 0,
        fontSize: 13,
        color: "#000",
    },
    phone: {
        margin: 0,
        fontSize: 12,
        color: "#666",
        marginTop: 4,
    },
    roleBadge: {
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
    },
    statusBadge: {
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        color: "#fff",
    },
    subCount: {
        margin: 0,
        fontSize: 11,
        color: "#666",
        marginTop: 4,
    },
    planDetails: {
        lineHeight: 1.4,
    },
    planName: {
        margin: 0,
        fontSize: 13,
        fontWeight: 600,
        color: "#000",
    },
    planAmount: {
        margin: 0,
        fontSize: 14,
        fontWeight: 700,
        color: "#ff6b00",
        marginTop: 2,
    },
    planDays: {
        margin: 0,
        fontSize: 11,
        color: "#666",
        marginTop: 2,
    },
    noPlan: {
        margin: 0,
        fontSize: 12,
        color: "#999",
        fontStyle: "italic",
    },
    emptyText: {
        margin: 0,
        fontSize: 14,
        color: "#666",
    },
};

export default UserManagement;
