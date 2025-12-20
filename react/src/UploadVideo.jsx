import { useState, useEffect } from "react";
import axios from "axios";

function UploadVideo() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [duration, setDuration] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [videos, setVideos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile || !thumbnailFile) {
            setMessage("Please select video and thumbnail files.");
            setMessageType("error");
            return;
        }

        setUploading(true);
        setMessage("");

        const formData = new FormData();
        formData.append("Title", title);
        formData.append("Description", description);
        formData.append("CategoryId", categoryId);
        formData.append("Duration", duration);
        formData.append("FilePath", videoFile);
        formData.append("ThumbnailPath", thumbnailFile);
        formData.append("ContentType", "movie");

        try {
            const response = await axios.post(
                "http://vidstreem.runasp.net/api/VideohandelApi/upload",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setMessage(`Uploading... ${percentCompleted}%`);
                        setMessageType("info");
                    },
                }
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
            document.getElementById("videoFileInput").value = "";
            document.getElementById("thumbnailFileInput").value = "";

            loadThumbnails();
        } catch (error) {
            console.error("Upload failed:", error);
            const errorMsg = error.response?.data?.message || error.message || "Upload failed";
            setMessage(`Upload failed: ${errorMsg} ❌`);
            setMessageType("error");
        } finally {
            setUploading(false);
        }
    };

    const loadThumbnails = () => {
        axios
            .get("http://vidstreem.runasp.net/api/VideohandelApi/thumbnails?take=50&skip=0")
            .then((res) => {
                const payload = res.data;
                if (Array.isArray(payload)) {
                    setVideos(payload);
                } else if (Array.isArray(payload?.data)) {
                    setVideos(payload.data);
                } else if (Array.isArray(payload?.items)) {
                    setVideos(payload.items);
                } else {
                    setVideos([]);
                }
            })
            .catch((err) => {
                console.error("Error while fetching thumbnails:", err);
                setVideos([]);
            });
    };

    const loadCategories = () => {
        setLoadingCategories(true);
        axios
            .get("http://vidstreem.runasp.net/api/CategoryVC")
            .then((res) => {
                if (res.data.data && Array.isArray(res.data.data)) {
                    setCategories(res.data.data);
                } else if (Array.isArray(res.data)) {
                    setCategories(res.data);
                } else {
                    setCategories([]);
                }
            })
            .catch((err) => {
                console.error("Error while fetching categories:", err);
                setCategories([]);
            })
            .finally(() => {
                setLoadingCategories(false);
            });
    };

    useEffect(() => {
        loadThumbnails();
        loadCategories();
    }, []);

    const safeVideos = Array.isArray(videos) ? videos : [];

    return (
        <div style={styles.contentScroll}>
            {/* Page Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>Upload Video</h1>
                    <p style={styles.breadcrumb}>Dashboard / Upload</p>
                </div>
            </div>

            {/* Upload Form Card */}
            <section style={styles.uploadCard}>
                <div style={styles.cardHeader}>
                    <h2 style={styles.cardTitle}>Video Details</h2>
                    <p style={styles.cardSubtitle}>Fill in the information below to upload a new video</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Video Title</label>
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
                            <label style={styles.label}>Category</label>
                            {loadingCategories ? (
                                <div style={styles.loadingSelect}>Loading categories...</div>
                            ) : (
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    style={styles.select}
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option key={category.categoryId} value={category.categoryId}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description</label>
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
                            <label style={styles.label}>Duration (minutes)</label>
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
                            <label style={styles.label}>Video File (MP4)</label>
                            <div style={styles.fileInputWrapper}>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setVideoFile(e.target.files[0])}
                                    style={styles.fileInput}
                                    id="videoFileInput"
                                    required
                                />
                                <div style={styles.fileLabel}>
                                    <span style={styles.fileIcon}>📹</span>
                                    {videoFile ? videoFile.name : "Choose video file"}
                                </div>
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Thumbnail Image</label>
                            <div style={styles.fileInputWrapper}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setThumbnailFile(e.target.files[0])}
                                    style={styles.fileInput}
                                    id="thumbnailFileInput"
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
                        <div
                            style={
                                messageType === "success"
                                    ? styles.successMessage
                                    : messageType === "info"
                                        ? styles.infoMessage
                                        : styles.errorMessage
                            }
                        >
                            {message}
                        </div>
                    )}

                    <button type="submit" style={styles.uploadBtn} disabled={uploading}>
                        {uploading ? "Uploading..." : "Upload Video"}
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
                    {safeVideos.length > 0 ? (
                        safeVideos.slice(0, 8).map((v) => (
                            <div key={v.id} style={styles.videoCard}>
                                <img src={v.thumbnailUrl} alt={v.title} style={styles.thumbnail} />
                                <div style={styles.videoInfo}>
                                    <p style={styles.videoTitle}>{v.title}</p>
                                    <span style={styles.categoryTag}>{v.categoryName}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={styles.emptyState}>
                            <p style={styles.emptyText}>No videos uploaded yet</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

const styles = {
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
        color: "#000",
        background: "#fff",
    },
    select: {
        padding: "12px 16px",
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.12)",
        fontSize: 14,
        outline: "none",
        color: "#000",
        background: "#fff",
        cursor: "pointer",
    },
    loadingSelect: {
        padding: "12px 16px",
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.12)",
        fontSize: 14,
        color: "#666",
        background: "#f9f9f9",
        fontStyle: "italic",
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
        background: "#fff",
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
        zIndex: 2,
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
    infoMessage: {
        padding: "12px 16px",
        borderRadius: 10,
        background: "#d1ecf1",
        border: "1px solid #bee5eb",
        color: "#0c5460",
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
    emptyState: {
        gridColumn: "1 / -1",
        textAlign: "center",
        padding: "40px 20px",
    },
    emptyText: {
        margin: 0,
        fontSize: 14,
        color: "#666",
    },
};

export default UploadVideo;
