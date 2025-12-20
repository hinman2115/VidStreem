import { useState, useEffect } from "react";
import axios from "axios";

function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://vidstreem.runasp.net/api/CategoryVC");
            if (response.data.data && Array.isArray(response.data.data)) {
                setCategories(response.data.data);
            } else if (Array.isArray(response.data)) {
                setCategories(response.data);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setCategoryForm({ name: "", description: "" });
        setMessage("");
        setShowAddModal(true);
    };

    const handleAddCategory = async () => {
        if (!categoryForm.name.trim()) {
            setMessage("Category name is required");
            setMessageType("error");
            return;
        }

        try {
            const response = await axios.post("http://vidstreem.runasp.net/api/CategoryVC", {
                name: categoryForm.name,
                description: categoryForm.description,
            });

            setMessage("Category added successfully!");
            setMessageType("success");

            setTimeout(() => {
                setShowAddModal(false);
                setCategoryForm({ name: "", description: "" });
                setMessage("");
                loadCategories();
            }, 1500);
        } catch (error) {
            console.error("Add failed:", error);
            const errorMsg = error.response?.data?.message || "Failed to add category";
            setMessage(errorMsg);
            setMessageType("error");
        }
    };

    const handleEditClick = (category) => {
        setSelectedCategory(category);
        setCategoryForm({
            name: category.name || "",
            description: category.description || "",
        });
        setMessage("");
        setShowEditModal(true);
    };

    const handleEditCategory = async () => {
        if (!categoryForm.name.trim()) {
            setMessage("Category name is required");
            setMessageType("error");
            return;
        }

        try {
            const response = await axios.put(
                `http://vidstreem.runasp.net/api/CategoryVC/${selectedCategory.categoryId}`,
                {
                    categoryName: categoryForm.name,
                    description: categoryForm.description,
                }
            );

            setMessage("Category updated successfully!");
            setMessageType("success");

            setTimeout(() => {
                setShowEditModal(false);
                setSelectedCategory(null);
                setCategoryForm({ name: "", description: "" });
                setMessage("");
                loadCategories();
            }, 1500);
        } catch (error) {
            console.error("Edit failed:", error);
            const errorMsg = error.response?.data?.message || "Failed to update category";
            setMessage(errorMsg);
            setMessageType("error");
        }
    };

    const handleDeleteClick = (category) => {
        setSelectedCategory(category);
        setMessage("");
        setShowDeleteModal(true);
    };

    const handleDeleteCategory = async () => {
        try {
            await axios.delete(
                `http://vidstreem.runasp.net/api/CategoryVC/${selectedCategory.categoryId}`
            );

            setMessage("Category deleted successfully!");
            setMessageType("success");

            setTimeout(() => {
                setShowDeleteModal(false);
                setSelectedCategory(null);
                setMessage("");
                loadCategories();
            }, 1500);
        } catch (error) {
            console.error("Delete failed:", error);
            const errorMsg = error.response?.data?.message || "Failed to delete category";
            setMessage(errorMsg);
            setMessageType("error");
        }
    };

    const filteredCategories = categories.filter((cat) =>
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div style={styles.fullscreenCenter}>
                <div style={styles.spinner}></div>
                <p style={{ marginTop: 12, color: "#ff6b00" }}>Loading Categories...</p>
            </div>
        );
    }

    return (
        <div style={styles.contentScroll}>
            {/* Page Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>Category Management</h1>
                    <p style={styles.breadcrumb}>Dashboard / Categories</p>
                </div>
                <div style={styles.headerActions}>
                    <input
                        style={styles.searchInput}
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button style={styles.primaryBtn} onClick={handleAddClick}>
                        Add Category
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={styles.statsRow}>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>📂</div>
                    <div>
                        <p style={styles.statLabel}>Total Categories</p>
                        <h3 style={styles.statValue}>{categories.length}</h3>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIconAlt}>✓</div>
                    <div>
                        <p style={styles.statLabel}>Filtered Results</p>
                        <h3 style={styles.statValue}>{filteredCategories.length}</h3>
                    </div>
                </div>
            </div>

            {/* Category Grid */}
            <section style={styles.tableCard}>
                <div style={styles.tableHeaderRow}>
                    <h2 style={{ margin: 0, fontSize: 18, color: "#000" }}>All Categories</h2>
                </div>

                <div style={styles.categoryGrid}>
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                            <div key={category.categoryId} style={styles.categoryCard}>
                                <div style={styles.categoryHeader}>
                                    <div style={styles.categoryIcon}>📁</div>
                                    <h3 style={styles.categoryName}>{category.name}</h3>
                                </div>
                                <p style={styles.categoryDesc}>
                                    {category.description || "No description available"}
                                </p>
                                <div style={styles.categoryFooter}>
                  <span style={styles.videoCount}>
                    {category.videos?.length || 0} videos
                  </span>
                                    <div style={styles.categoryActions}>
                                        <button
                                            style={styles.iconBtn}
                                            onClick={() => handleEditClick(category)}
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            style={styles.iconBtnDanger}
                                            onClick={() => handleDeleteClick(category)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={styles.emptyState}>
                            <p style={styles.emptyText}>No categories found</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Add Category Modal */}
            {showAddModal && (
                <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Add New Category</h3>
                            <button style={styles.modalClose} onClick={() => setShowAddModal(false)}>
                                ×
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Category Name</label>
                                <input
                                    type="text"
                                    style={styles.formInput}
                                    value={categoryForm.name}
                                    onChange={(e) =>
                                        setCategoryForm({ ...categoryForm, name: e.target.value })
                                    }
                                    placeholder="Enter category name"
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Description</label>
                                <textarea
                                    style={{ ...styles.formInput, minHeight: 100, resize: "vertical" }}
                                    value={categoryForm.description}
                                    onChange={(e) =>
                                        setCategoryForm({ ...categoryForm, description: e.target.value })
                                    }
                                    placeholder="Enter category description (optional)"
                                />
                            </div>
                            {message && (
                                <div
                                    style={
                                        messageType === "success"
                                            ? styles.successMessage
                                            : styles.errorMessage
                                    }
                                >
                                    {message}
                                </div>
                            )}
                        </div>
                        <div style={styles.modalFooter}>
                            <button
                                style={styles.modalBtnSecondary}
                                onClick={() => setShowAddModal(false)}
                            >
                                Cancel
                            </button>
                            <button style={styles.modalBtnPrimary} onClick={handleAddCategory}>
                                Add Category
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {showEditModal && (
                <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Edit Category</h3>
                            <button style={styles.modalClose} onClick={() => setShowEditModal(false)}>
                                ×
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Category Name</label>
                                <input
                                    type="text"
                                    style={styles.formInput}
                                    value={categoryForm.name}
                                    onChange={(e) =>
                                        setCategoryForm({ ...categoryForm, name: e.target.value })
                                    }
                                    placeholder="Enter category name"
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Description</label>
                                <textarea
                                    style={{ ...styles.formInput, minHeight: 100, resize: "vertical" }}
                                    value={categoryForm.description}
                                    onChange={(e) =>
                                        setCategoryForm({ ...categoryForm, description: e.target.value })
                                    }
                                    placeholder="Enter category description (optional)"
                                />
                            </div>
                            {message && (
                                <div
                                    style={
                                        messageType === "success"
                                            ? styles.successMessage
                                            : styles.errorMessage
                                    }
                                >
                                    {message}
                                </div>
                            )}
                        </div>
                        <div style={styles.modalFooter}>
                            <button
                                style={styles.modalBtnSecondary}
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancel
                            </button>
                            <button style={styles.modalBtnPrimary} onClick={handleEditCategory}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Delete Category</h3>
                            <button
                                style={styles.modalClose}
                                onClick={() => setShowDeleteModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <p style={styles.modalText}>
                                Are you sure you want to delete <strong>{selectedCategory?.name}</strong>?
                            </p>
                            <p style={styles.modalWarning}>
                                This action cannot be undone. All videos in this category may be affected.
                            </p>
                            {message && (
                                <div
                                    style={
                                        messageType === "success"
                                            ? styles.successMessage
                                            : styles.errorMessage
                                    }
                                >
                                    {message}
                                </div>
                            )}
                        </div>
                        <div style={styles.modalFooter}>
                            <button
                                style={styles.modalBtnSecondary}
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button style={styles.modalBtnDanger} onClick={handleDeleteCategory}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        flexWrap: "wrap",
        gap: 12,
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
    headerActions: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
    },
    searchInput: {
        padding: "8px 12px",
        borderRadius: 999,
        border: "1px solid rgba(0,0,0,0.12)",
        fontSize: 14,
        minWidth: 220,
        outline: "none",
        color: "#000",
        background: "#fff",
    },
    primaryBtn: {
        padding: "9px 18px",
        borderRadius: 999,
        border: "none",
        background: "linear-gradient(135deg,#ff6b00,#ff8c1a)",
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
    },
    statsRow: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
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
    statIconAlt: {
        width: 46,
        height: 46,
        borderRadius: 14,
        background: "linear-gradient(135deg,#ff8c1a,#ffb347)",
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
        textTransform: "uppercase",
        opacity: 0.6,
    },
    statValue: {
        margin: 0,
        fontSize: 22,
        fontWeight: 700,
        color: "#000",
        marginTop: 4,
    },
    tableCard: {
        background: "#ffffff",
        borderRadius: 16,
        boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
        padding: 16,
        minWidth: 0,
        overflow: "hidden",
    },
    tableHeaderRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    categoryGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 20,
        marginTop: 16,
    },
    categoryCard: {
        background: "#fff",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
        padding: 20,
        transition: "transform 0.2s",
        cursor: "pointer",
    },
    categoryHeader: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        background: "linear-gradient(135deg,#ff6b00,#ff8c1a)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        flexShrink: 0,
    },
    categoryName: {
        margin: 0,
        fontSize: 16,
        fontWeight: 700,
        color: "#000",
        flex: 1,
    },
    categoryDesc: {
        margin: 0,
        fontSize: 13,
        color: "#666",
        lineHeight: 1.5,
        marginBottom: 16,
        minHeight: 40,
    },
    categoryFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 12,
        borderTop: "1px solid rgba(0,0,0,0.06)",
    },
    videoCount: {
        fontSize: 12,
        color: "#ff6b00",
        fontWeight: 600,
    },
    categoryActions: {
        display: "flex",
        gap: 8,
    },
    iconBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        border: "none",
        background: "#fff7ee",
        cursor: "pointer",
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    iconBtnDanger: {
        width: 32,
        height: 32,
        borderRadius: 8,
        border: "none",
        background: "#ffe5e5",
        cursor: "pointer",
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    emptyState: {
        gridColumn: "1 / -1",
        textAlign: "center",
        padding: "60px 20px",
    },
    emptyText: {
        margin: 0,
        fontSize: 14,
        color: "#666",
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        backdropFilter: "blur(4px)",
    },
    modalContent: {
        background: "#ffffff",
        borderRadius: 20,
        width: 480,
        maxWidth: "90vw",
        minHeight: 240,
        maxHeight: "80vh",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
    },
    modalHeader: {
        padding: "24px 24px 16px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
    },
    modalTitle: {
        margin: 0,
        fontSize: 20,
        fontWeight: 700,
        color: "#000",
    },
    modalClose: {
        border: "none",
        background: "transparent",
        fontSize: 32,
        color: "#666",
        cursor: "pointer",
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        lineHeight: 1,
        padding: 0,
    },
    modalBody: {
        padding: 24,
        flex: 1,
        overflowY: "auto",
    },
    modalText: {
        margin: 0,
        fontSize: 15,
        color: "#000",
        lineHeight: 1.6,
    },
    modalWarning: {
        margin: "12px 0 0",
        fontSize: 13,
        color: "#e03131",
        fontWeight: 600,
    },
    modalFooter: {
        padding: "16px 24px 24px",
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        flexShrink: 0,
        borderTop: "1px solid rgba(0,0,0,0.04)",
    },
    modalBtnSecondary: {
        padding: "10px 24px",
        borderRadius: 999,
        border: "1px solid rgba(0,0,0,0.15)",
        background: "#ffffff",
        color: "#000",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
    },
    modalBtnDanger: {
        padding: "10px 24px",
        borderRadius: 999,
        border: "none",
        background: "linear-gradient(135deg,#e03131,#ff5b57)",
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
    },
    modalBtnPrimary: {
        padding: "10px 24px",
        borderRadius: 999,
        border: "none",
        background: "linear-gradient(135deg,#ff6b00,#ff8c1a)",
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        display: "block",
        marginBottom: 8,
        fontSize: 14,
        fontWeight: 600,
        color: "#000",
    },
    formInput: {
        width: "100%",
        padding: "12px 16px",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.12)",
        fontSize: 14,
        color: "#000",
        background: "#fff",
        outline: "none",
        boxSizing: "border-box",
        fontFamily: "inherit",
    },
    successMessage: {
        padding: "12px 16px",
        borderRadius: 10,
        background: "#d4edda",
        border: "1px solid #c3e6cb",
        color: "#155724",
        fontSize: 14,
        fontWeight: 500,
        marginTop: 12,
    },
    errorMessage: {
        padding: "12px 16px",
        borderRadius: 10,
        background: "#f8d7da",
        border: "1px solid #f5c6cb",
        color: "#721c24",
        fontSize: 14,
        fontWeight: 500,
        marginTop: 12,
    },
};

export default CategoryManagement;
