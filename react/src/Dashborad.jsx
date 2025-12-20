import { useEffect, useState } from "react";
import axios from "axios";
import "./css/VidStreemDashboard.css";

function VidStreemDashboard() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [editForm, setEditForm] = useState({ title: "", categoryName: "", description: "" });

    useEffect(() => {
        axios
            .get("http://vidstreem.runasp.net/api/VideohandelApi/thumbnails?take=50&skip=0")
            .then((res) => {
                const payload = res.data;
                if (Array.isArray(payload)) {
                    setVideos(payload);
                } else if (Array.isArray(payload.data)) {
                    setVideos(payload.data);
                } else if (Array.isArray(payload.items)) {
                    setVideos(payload.items);
                } else {
                    setVideos([]);
                }
            })
            .catch((err) => {
                console.error("Error while fetching videos:", err);
                setVideos([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleDeleteClick = (video) => {
        setSelectedVideo(video);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://vidstreem.runasp.net/api/VideohandelApi/${selectedVideo.id}`);
            setVideos((prev) => prev.filter((v) => v.id !== selectedVideo.id));
            setShowDeleteModal(false);
            setSelectedVideo(null);
            alert("Video deleted successfully! ✓");
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete video");
        }
    };

    const handleEditClick = (video) => {
        setSelectedVideo(video);
        setEditForm({
            title: video.title || "",
            categoryName: video.categoryName || "",
            description: video.description || "",
        });
        setShowEditModal(true);
    };

    const confirmEdit = async () => {
        if (!selectedVideo) return;
        try {
            const formData = new FormData();
            formData.append("Title", editForm.title);
            formData.append("Description", editForm.description || selectedVideo.description || "");
            formData.append("CategoryId", selectedVideo.categoryId || 0);
            formData.append("Duration", selectedVideo.duration || 0);
            formData.append("FilePath", "");
            formData.append("ThumbnailPath", "");
            formData.append("ContentType", selectedVideo.contentType || "video/mp4");

            const response = await axios.put(
                `http://vidstreem.runasp.net/api/VideohandelApi/update/${selectedVideo.id}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            setVideos((prev) =>
                prev.map((v) =>
                    v.id === selectedVideo.id
                        ? { ...v, title: editForm.title, description: editForm.description }
                        : v
                )
            );
            setShowEditModal(false);
            setSelectedVideo(null);
            setEditForm({ title: "", categoryName: "", description: "" });
            alert("Video updated successfully! ✓");
        } catch (err) {
            console.error("Edit failed:", err);
            const errorMsg = err.response?.data?.message || err.message || "Failed to update video";
            alert(`Update failed: ${errorMsg}`);
        }
    };

    const filtered = videos.filter((v) =>
        v.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div style={styles.fullscreenCenter}>
                <div style={styles.spinner}></div>
                <p style={{ marginTop: 12, color: "#ff6b00" }}>Loading VidStreem...</p>
            </div>
        );
    }

    return (
        <div style={styles.contentScroll}>
            {/* Page Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>Video Management</h1>
                    <p style={styles.breadcrumb}>Dashboard / Videos</p>
                </div>
                <div style={styles.headerActions}>
                    <input
                        style={styles.searchInput}
                        placeholder="Search videos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats Row */}
            <div style={styles.statsRow}>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>📹</div>
                    <div>
                        <p style={styles.statLabel}>Total Videos</p>
                        <h3 style={styles.statValue}>{videos.length}</h3>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIconAlt}>📂</div>
                    <div>
                        <p style={styles.statLabel}>Categories</p>
                        <h3 style={styles.statValue}>{[...new Set(videos.map((v) => v.categoryName))].length}</h3>
                    </div>
                </div>
            </div>

            {/* Video Table */}
            <section style={styles.tableCard}>
                <div style={styles.tableHeaderRow}>
                    <h2 style={{ margin: 0, fontSize: 18, color: "#000" }}>Video Library</h2>
                </div>
                <div style={styles.tableHead}>
                    <div style={{ ...styles.th, flex: 0.5 }}>#</div>
                    <div style={{ ...styles.th, flex: 1 }}>Thumbnail</div>
                    <div style={{ ...styles.th, flex: 3 }}>Title</div>
                    <div style={{ ...styles.th, flex: 1.5 }}>Category</div>
                    <div style={{ ...styles.th, flex: 2 }}>Actions</div>
                </div>
                <div style={styles.tableBody}>
                    {filtered.map((v, idx) => (
                        <div key={v.id} style={styles.tr}>
                            <div style={{ ...styles.td, flex: 0.5, color: "#000" }}>{idx + 1}</div>
                            <div style={{ ...styles.td, flex: 1 }}>
                                <img src={v.thumbnailUrl} alt={v.title} style={styles.thumb} />
                            </div>
                            <div style={{ ...styles.td, flex: 3, color: "#000" }}>{v.title}</div>
                            <div style={{ ...styles.td, flex: 1.5 }}>
                                <span style={styles.tag}>{v.categoryName}</span>
                            </div>
                            <div style={{ ...styles.td, flex: 2 }}>
                                <button style={styles.smallPrimary} onClick={() => handleEditClick(v)}>
                                    Edit
                                </button>
                                <button style={styles.smallDanger} onClick={() => handleDeleteClick(v)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Delete Video</h3>
                            <button style={styles.modalClose} onClick={() => setShowDeleteModal(false)}>
                                ×
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <p style={styles.modalText}>
                                Are you sure you want to delete <strong>{selectedVideo?.title}</strong>?
                            </p>
                            <p style={styles.modalWarning}>This action cannot be undone.</p>
                        </div>
                        <div style={styles.modalFooter}>
                            <button style={styles.modalBtnSecondary} onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </button>
                            <button style={styles.modalBtnDanger} onClick={confirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
                    <div style={styles.modalContentLarge} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Edit Video</h3>
                            <button style={styles.modalClose} onClick={() => setShowEditModal(false)}>
                                ×
                            </button>
                        </div>
                        <div style={styles.modalBodyScroll}>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Title</label>
                                <input
                                    type="text"
                                    style={styles.formInput}
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    placeholder="Enter video title"
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Description</label>
                                <textarea
                                    style={{ ...styles.formInput, minHeight: 100, resize: "vertical" }}
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    placeholder="Enter video description"
                                />
                            </div>
                        </div>
                        <div style={styles.modalFooter}>
                            <button style={styles.modalBtnSecondary} onClick={() => setShowEditModal(false)}>
                                Cancel
                            </button>
                            <button style={styles.modalBtnPrimary} onClick={confirmEdit}>
                                Save Changes
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
        gap: 12,
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
        marginBottom: 12,
    },
    tableHead: {
        display: "flex",
        padding: "10px 12px",
        borderRadius: 10,
        background: "#fff7ee",
        fontSize: 12,
        color: "#000",
        fontWeight: 600,
        opacity: 0.7,
    },
    th: {
        textTransform: "uppercase",
    },
    tableBody: {
        marginTop: 4,
        maxHeight: "calc(100vh - 360px)",
        overflowY: "auto",
    },
    tr: {
        display: "flex",
        alignItems: "center",
        padding: "10px 12px",
        borderBottom: "1px solid rgba(0,0,0,0.03)",
        fontSize: 14,
        transition: "background 0.2s",
        color: "#000",
    },
    td: {
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    thumb: {
        width: 80,
        height: 48,
        borderRadius: 8,
        objectFit: "cover",
        border: "1px solid rgba(0,0,0,0.06)",
    },
    tag: {
        padding: "4px 10px",
        borderRadius: 999,
        background: "#fff7ee",
        color: "#ff6b00",
        fontSize: 12,
        fontWeight: 600,
    },
    smallPrimary: {
        padding: "6px 10px",
        marginRight: 6,
        borderRadius: 6,
        border: "none",
        background: "linear-gradient(135deg,#ff6b00,#ff8c1a)",
        color: "#fff",
        fontSize: 12,
        cursor: "pointer",
        fontWeight: 600,
    },
    smallDanger: {
        padding: "6px 10px",
        borderRadius: 6,
        border: "none",
        background: "linear-gradient(135deg,#e03131,#ff5b57)",
        color: "#fff",
        fontSize: 12,
        cursor: "pointer",
        fontWeight: 600,
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
    modalContentLarge: {
        background: "#ffffff",
        borderRadius: 20,
        width: 580,
        maxWidth: "90vw",
        minHeight: 400,
        maxHeight: "85vh",
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
    modalBodyScroll: {
        padding: 24,
        flex: 1,
        overflowY: "auto",
        minHeight: 0,
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
};

export default VidStreemDashboard;
