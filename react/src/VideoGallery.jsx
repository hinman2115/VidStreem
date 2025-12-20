import { useState, useEffect } from "react";
import axios from "axios";

function VideoGallery() {
    const [videos, setVideos] = useState([]);
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    useEffect(() => {
        loadVideos();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [videos, searchTerm, categoryFilter]);

    const loadVideos = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://vidstreem.runasp.net/api/VideohandelApi");
            if (Array.isArray(response.data)) {
                setVideos(response.data);
            } else if (response.data.data && Array.isArray(response.data.data)) {
                setVideos(response.data.data);
            } else {
                setVideos([]);
            }
        } catch (error) {
            console.error("Error fetching videos:", error);
            setVideos([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...videos];

        if (searchTerm) {
            filtered = filtered.filter(
                (video) =>
                    video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    video.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter !== "all") {
            filtered = filtered.filter((video) => video.categoryName === categoryFilter);
        }

        setFilteredVideos(filtered);
    };

    const handleVideoClick = (video) => {
        setSelectedVideo(video);
        setShowVideoModal(true);
    };

    const closeVideoModal = () => {
        setShowVideoModal(false);
        setSelectedVideo(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const uniqueCategories = [...new Set(videos.map((v) => v.categoryName))];

    if (loading) {
        return (
            <div style={styles.fullscreenCenter}>
                <div style={styles.spinner}></div>
                <p style={{ marginTop: 12, color: "#ff6b00" }}>Loading Videos...</p>
            </div>
        );
    }

    return (
        <div style={styles.contentScroll}>
            {/* Page Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>Video Gallery</h1>
                    <p style={styles.breadcrumb}>Dashboard / Videos</p>
                </div>
            </div>

            {/* Stats */}
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
                        <h3 style={styles.statValue}>{uniqueCategories.length}</h3>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIconActive}>✓</div>
                    <div>
                        <p style={styles.statLabel}>Filtered Results</p>
                        <h3 style={styles.statValue}>{filteredVideos.length}</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <section style={styles.filterCard}>
                <div style={styles.filterRow}>
                    <div style={styles.searchBox}>
                        <input
                            style={styles.searchInput}
                            placeholder="Search videos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Category</label>
                        <select
                            style={styles.filterSelect}
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {uniqueCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        style={styles.refreshBtn}
                        onClick={loadVideos}
                        title="Refresh"
                    >
                        ↻
                    </button>
                </div>
            </section>

            {/* Video Grid */}
            <section style={styles.videoGrid}>
                {filteredVideos.length > 0 ? (
                    filteredVideos.map((video) => (
                        <div
                            key={video.id}
                            style={styles.videoCard}
                            onClick={() => handleVideoClick(video)}
                        >
                            <div style={styles.thumbnailContainer}>
                                <img
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    style={styles.thumbnail}
                                    onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/400x225?text=No+Image";
                                    }}
                                />
                                <div style={styles.playOverlay}>
                                    <div style={styles.playButton}>▶</div>
                                </div>
                                <div style={styles.durationBadge}>{video.duration} min</div>
                            </div>
                            <div style={styles.videoInfo}>
                                <h3 style={styles.videoTitle}>{video.title}</h3>
                                <div style={styles.videoMeta}>
                                    <span style={styles.categoryBadge}>{video.categoryName}</span>
                                    <span style={styles.uploadDate}>{formatDate(video.uploadedOn)}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={styles.emptyState}>
                        <p style={styles.emptyText}>No videos found</p>
                    </div>
                )}
            </section>

            {/* Video Modal */}
            {showVideoModal && selectedVideo && (
                <div style={styles.modalOverlay} onClick={closeVideoModal}>
                    <div style={styles.videoModalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <div>
                                <h2 style={styles.modalTitle}>{selectedVideo.title}</h2>
                                <p style={styles.modalCategory}>
                                    {selectedVideo.categoryName} • {formatDate(selectedVideo.uploadedOn)}
                                </p>
                            </div>
                            <button style={styles.modalClose} onClick={closeVideoModal}>
                                ×
                            </button>
                        </div>
                        <div style={styles.videoPlayerWrapper}>
                            <video style={styles.videoPlayer} controls autoPlay src={selectedVideo.videoUrl}>
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <div style={styles.modalFooter}>
                            <div style={styles.videoDetails}>
                                <p style={styles.detailItem}>
                                    <strong>Duration:</strong> {selectedVideo.duration} minutes
                                </p>
                                <p style={styles.detailItem}>
                                    <strong>Type:</strong> {selectedVideo.contentType}
                                </p>
                            </div>
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
    videoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 24,
    },
    videoCard: {
        background: "#ffffff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        cursor: "pointer",
        transition: "transform 0.3s",
    },
    thumbnailContainer: {
        position: "relative",
        width: "100%",
        paddingTop: "56.25%",
        overflow: "hidden",
        background: "#000",
    },
    thumbnail: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    playOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0,
        transition: "opacity 0.3s",
    },
    playButton: {
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: "#ff6b00",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 24,
        boxShadow: "0 4px 20px rgba(255,107,0,0.5)",
    },
    durationBadge: {
        position: "absolute",
        bottom: 8,
        right: 8,
        background: "rgba(0,0,0,0.8)",
        color: "#fff",
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
    },
    videoInfo: {
        padding: 16,
    },
    videoTitle: {
        margin: 0,
        fontSize: 16,
        fontWeight: 700,
        color: "#000",
        marginBottom: 10,
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
    },
    videoMeta: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    categoryBadge: {
        padding: "4px 10px",
        borderRadius: 999,
        background: "#fff7ee",
        color: "#ff6b00",
        fontSize: 11,
        fontWeight: 600,
    },
    uploadDate: {
        fontSize: 11,
        color: "#666",
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
        background: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
    },
    videoModalContent: {
        background: "#1a1a1a",
        borderRadius: 20,
        width: "100%",
        maxWidth: 1200,
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },
    modalHeader: {
        padding: "20px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        background: "#1a1a1a",
    },
    modalTitle: {
        margin: 0,
        fontSize: 20,
        fontWeight: 700,
        color: "#fff",
    },
    modalCategory: {
        margin: 0,
        marginTop: 4,
        fontSize: 13,
        color: "#ff6b00",
    },
    modalClose: {
        border: "none",
        background: "transparent",
        fontSize: 36,
        color: "#fff",
        cursor: "pointer",
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        lineHeight: 1,
        padding: 0,
    },
    videoPlayerWrapper: {
        flex: 1,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 400,
    },
    videoPlayer: {
        width: "100%",
        maxHeight: "70vh",
        outline: "none",
    },
    modalFooter: {
        padding: "16px 24px",
        background: "#1a1a1a",
        borderTop: "1px solid rgba(255,255,255,0.1)",
    },
    videoDetails: {
        display: "flex",
        gap: 24,
        flexWrap: "wrap",
    },
    detailItem: {
        margin: 0,
        fontSize: 13,
        color: "#aaa",
    },
};

export default VideoGallery;
