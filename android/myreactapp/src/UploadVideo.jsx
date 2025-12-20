import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UploadVideo() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [duration, setDuration] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // success or error
    const [videos, setVideos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!videoFile || !thumbnailFile) {
            setMessage("Please select video and thumbnail files.");
            setMessageType("error");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("Title", title);
        formData.append("Description", description);
        formData.append("CategoryId", categoryId);
        formData.append("Duration", duration);
        formData.append("FilePath", videoFile);
        formData.append("ThumbnailPath", thumbnailFile);
        formData.append("ContentType", "movie");

        try {
            await axios.post(
                "http://vidstreem.runasp.net/api/VideohandelApi/upload",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            setMessage("Upload successful! ✔");
            setMessageType("success");

            // Reset form
            setTitle("");
            setDescription("");
            setCategoryId("");
            setDuration("");
            setVideoFile(null);
            setThumbnailFile(null);

            loadThumbnails();
        } catch (error) {
            console.error("Upload failed:", error);
            setMessage("Upload failed. Please try again. ❌");
            setMessageType("error");
        } finally {
            setUploading(false);
        }
    };

    const loadThumbnails = () => {
        axios.get("http://vidstreem.runasp.net/api/VideohandelApi/thumbnails?take=50&skip=0")
            .then(res => setVideos(res.data))
            .catch(err => console.error("Error loading videos:", err));
    };

    useEffect(() => {
        loadThumbnails();
    }, []);

    const userName = localStorage.getItem("name") || "Admin";
    const userInitials = userName
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div style={styles.appShell}>
            {/* Sidebar */}
            <aside
                style={{
                    ...styles.sidebar,
                    width: sidebarCollapsed ? 80 : 240,
                }}
            >
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
                    <button style={{ ...styles.navItem, ...styles.navItemActive }}>
                        <span style={styles.navIcon}>⬆</span>
                        {!sidebarCollapsed && <span>Upload Video</span>}
                    </button>
                    <button style={styles.navItem}>
                        <span style={styles.navIcon}>▶</span>
                        {!sidebarCollapsed && <span>Videos</span>}
                    </button>
                    <button style={styles.navItem}>
                        <span style={styles.navIcon}>▦</span>
                        {!sidebarCollapsed && <span>Categories</span>}
                    </button>
                    <button style={styles.navItem}>
                        <span style={styles.navIcon}>⚙</span>
                        {!sidebarCollapsed && <span>Settings</span>}
                    </button>
                </nav>

                <button
                    style={styles.collapse}
                    onClick={() => setSidebarCollapsed(v => !v)}
                >
                    {sidebarCollapsed ? "»" : "«"}
                </button>
            </aside>

            {/* Main area */}
            <div
                style={{
                    ...styles.mainArea,
                    marginLeft: sidebarCollapsed ? 80 : 240,
                }}
            >
                {/* Top bar */}
                <header style={styles.topBar}>
                    <div>
                        <h1 style={styles.topTitle}>Upload Video</h1>
                        <p style={styles.breadcrumb}>Dashboard / Upload</p>
                    </div>

                    <div style={styles.topRight}>
                        <button
                            style={styles.secondaryBtn}
                            onClick={() => navigate("/dashboard")}
                        >
                            ← Back to Dashboard
                        </button>
                        <div style={styles.avatar}>{userInitials}</div>
                    </div>
                </header>

                {/* Content scroll area */}
                <div style={styles.contentScroll}>
                    {/* Upload Form Card */}
                    <section style={styles.uploadCard}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Video Details</h2>
                            <p style={styles.cardSubtitle}>Fill in the information below to upload a new video</p>
                        </div>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Video Title *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter video title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        style={styles.input}
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Category ID *</label>
                                    <input
                                        type="number"
                                        placeholder="Enter category ID"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        style={styles.input}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Description *</label>
                                <textarea
                                    placeholder="Enter video description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    style={styles.textarea}
                                    required
                                />
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Duration (minutes) *</label>
                                    <input
                                        type="number"
                                        placeholder="Enter duration"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        style={styles.input}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Video File (MP4) *</label>
                                    <div style={styles.fileInputWrapper}>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => setVideoFile(e.target.files[0])}
                                            style={styles.fileInput}
                                            required
                                        />
                                        <div style={styles.fileLabel}>
                                            <span style={styles.fileIcon}>📹</span>
                                            {videoFile ? videoFile.name : "Choose video file"}
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Thumbnail Image *</label>
                                    <div style={styles.fileInputWrapper}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setThumbnailFile(e.target.files[0])}
                                            style={styles.fileInput}
                                            required
                                        />
                                        <div style={styles.fileLabel}>
                                            <span style={styles.fileIcon}>🖼️</span>
                                            {thumbnailFile ? thumbnailFile.name : "Choose thumbnail"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {message && (
                                <div style={messageType === "success" ? styles.successMessage : styles.errorMessage}>
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                style={styles.uploadBtn}
                                disabled={uploading}
                            >
                                {uploading ? "Uploading..." : "⬆ Upload Video"}
                            </button>
                        </form>
                    </section>

                    {/* Recent Uploads */}
                    <section style={styles.recentCard}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Recent Uploads</h2>
                            <p style={styles.cardSubtitle}>Latest videos uploaded to VidStreem</p>
                        </div>

                        <div style={styles.videoGrid}>
                            {videos.slice(0, 8).map(v => (
                                <div key={v.id} style={styles.videoCard}>
                                    <img src={v.thumbnailUrl} alt={v.title} style={styles.thumbnail} />
                                    <div style={styles.videoInfo}>
                                        <p style={styles.videoTitle}>{v.title}</p>
                                        <span style={styles.categoryTag}>{v.categoryName}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

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
    brandFull: { fontWeight: 700, fontSize: 22, color: "#000" },
    brandMini: { fontWeight: 700, fontSize: 18, color: "#ff6b00" },
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
    navIcon: { fontSize: 16, width: 20, textAlign: "center" },
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
        transition: "margin-left 0.3s ease",
    },
    topBar: {
        position: "sticky",
        top: 0,
        zIndex: 10,
        padding: "16px 28px",
        background: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(0,0,0,0.04)",
        flexWrap: "wrap",
        gap: 12,
    },
    topTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: "#000" },
    breadcrumb: { margin: 0, fontSize: 12, color: "#000", marginTop: 2, opacity: 0.6 },
    topRight: { display: "flex", alignItems: "center", gap: 12 },
    secondaryBtn: {
        padding: "9px 18px",
        borderRadius: 999,
        border: "1px solid rgba(255,107,0,0.4)",
        background: "#fff7ee",
        color: "#ff6b00",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
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
    },
    contentScroll: {
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: "24px 28px 32px",
    },
    uploadCard: {
        background: "#ffffff",
        borderRadius: 16,
        boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
        padding: 24,
        marginBottom: 24,
    },
    cardHeader: {
        marginBottom: 24,
    },
    cardTitle: {
        margin: 0,
        fontSize: 20,
        fontWeight: 700,
        color: "#000",
    },
    cardSubtitle: {
        margin: 0,
        marginTop: 4,
        fontSize: 14,
        color: "#000",
        opacity: 0.6,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 20,
    },
    formRow: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: 16,
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: 600,
        color: "#000",
    },
    input: {
        padding: "12px 16px",
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.12)",
        fontSize: 14,
        outline: "none",
        transition: "border 0.2s",
        color: "#000",
    },
    textarea: {
        padding: "12px 16px",
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.12)",
        fontSize: 14,
        outline: "none",
        minHeight: 100,
        resize: "vertical",
        fontFamily: "inherit",
        color: "#000",
    },
    fileInputWrapper: {
        position: "relative",
    },
    fileInput: {
        position: "absolute",
        opacity: 0,
        width: "100%",
        height: "100%",
        cursor: "pointer",
    },
    fileLabel: {
        padding: "12px 16px",
        borderRadius: 10,
        border: "2px dashed rgba(255,107,0,0.3)",
        background: "#fff7ee",
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        transition: "all 0.2s",
        color: "#ff6b00",
        fontSize: 14,
        fontWeight: 500,
    },
    fileIcon: {
        fontSize: 20,
    },
    uploadBtn: {
        padding: "14px 24px",
        borderRadius: 10,
        border: "none",
        background: "linear-gradient(135deg,#ff6b00,#ff8c1a)",
        color: "#fff",
        fontSize: 16,
        fontWeight: 600,
        cursor: "pointer",
        transition: "transform 0.2s",
        marginTop: 8,
    },
    successMessage: {
        padding: "12px 16px",
        borderRadius: 10,
        background: "#d4edda",
        border: "1px solid #c3e6cb",
        color: "#155724",
        fontSize: 14,
        fontWeight: 500,
    },
    errorMessage: {
        padding: "12px 16px",
        borderRadius: 10,
        background: "#f8d7da",
        border: "1px solid #f5c6cb",
        color: "#721c24",
        fontSize: 14,
        fontWeight: 500,
    },
    recentCard: {
        background: "#ffffff",
        borderRadius: 16,
        boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
        padding: 24,
    },
    videoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 20,
        marginTop: 16,
    },
    videoCard: {
        borderRadius: 12,
        overflow: "hidden",
        background: "#f9f9f9",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
    },
    thumbnail: {
        width: "100%",
        height: 120,
        objectFit: "cover",
    },
    videoInfo: {
        padding: 12,
    },
    videoTitle: {
        margin: 0,
        fontSize: 14,
        fontWeight: 600,
        color: "#000",
        marginBottom: 6,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    categoryTag: {
        padding: "4px 8px",
        borderRadius: 999,
        background: "#fff7ee",
        color: "#ff6b00",
        fontSize: 11,
        fontWeight: 600,
    },
};

export default UploadVideo;
