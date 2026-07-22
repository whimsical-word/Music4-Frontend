import React, { useState, useEffect } from "react";
import axios from "axios";
import { usePlayerStore } from "../features/player/usePlayerStore";

const NotificationBell = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const playTrack = usePlayerStore((state) => state.playTrack);

    useEffect(() => {
        if (!userId) return;

        // 1. Lấy danh sách thông báo lịch sử từ DB
        axios.get(`http://localhost:8080/api/notifications/user/${userId}`)
            .then((res) => {
                setNotifications(res.data);
                const unread = res.data.filter((n) => !n.isRead).length;
                setUnreadCount(unread);
            })
            .catch((err) => console.error("Lỗi lấy thông báo cũ:", err));

        // 2. THIẾT LẬP KẾT NỐI SSE
        const eventSource = new EventSource(`http://localhost:8080/api/notifications/subscribe/${userId}`);

        // Lắng nghe thông báo bài hát mới
        eventSource.addEventListener("NEW_TRACK", (event) => {
            const newNoti = JSON.parse(event.data);
            setNotifications((prevNotis) => [newNoti, ...prevNotis]);
            setUnreadCount((prevCount) => prevCount + 1);
        });

        // 🟢 LẮNG NGHE THÔNG BÁO CHUNG / ALBUM MỚI
        eventSource.addEventListener("NOTIFICATION", (event) => {
            const newNoti = JSON.parse(event.data);
            setNotifications((prevNotis) => [newNoti, ...prevNotis]);
            setUnreadCount((prevCount) => prevCount + 1);
        });

        eventSource.onerror = (err) => {
            console.error("Lỗi kết nối SSE:", err);
        };

        return () => {
            eventSource.close();
        };
    }, [userId]);

    const handleNotiClick = async (noti) => {
        try {
            // 1. Đánh dấu thông báo đã đọc
            if (!noti.isRead) {
                await axios.put(`http://localhost:8080/api/notifications/${noti.id}/read`);
                setNotifications((prev) =>
                    prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n))
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }

            // Đóng dropdown thông báo lại
            setIsOpen(false);

            // 2. Phân loại xử lý khi click vào thông báo
            if (noti.trackId || noti.track) {
                // Nếu là thông báo về Track -> Phát nhạc luôn
                const trackData = noti.track || { id: noti.trackId, name: noti.content, ...noti };
                playTrack(trackData, [trackData]);
            } else if (noti.albumId || noti.album) {
                // Nếu là thông báo về Album -> Bồ có thể tuỳ chỉnh điều hướng sang trang chi tiết Album ở đây
                console.log("Đã click vào thông báo Album:", noti);
                // Ví dụ: navigate(`/albums/${noti.albumId || noti.album.id}`);
            } else {
                console.warn("Thông báo này không chứa dữ liệu track hoặc album:", noti);
            }
        } catch (err) {
            console.error("Lỗi khi xử lý click thông báo:", err);
        }
    };

    const handleDeleteNoti = async (e, notiId, isRead) => {
        e.stopPropagation();
        try {
            await axios.delete(`http://localhost:8080/api/notifications/${notiId}`);
            setNotifications((prev) => prev.filter((n) => n.id !== notiId));
            if (!isRead) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error("Lỗi khi xóa thông báo:", err);
        }
    };

    const handleClearAll = async () => {
        try {
            await axios.delete(`http://localhost:8080/api/notifications/clear-all`);
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Lỗi khi xóa tất cả thông báo:", err);
        }
    };

    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            {/* 🔔 Icon chiếc chuông */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ background: "none", border: "none", cursor: "pointer", position: "relative", padding: "8px", color: "#fff" }}
            >
                <span style={{ fontSize: "22px" }}>🔔</span>

                {/* 🔴 Số đỏ thông báo */}
                {unreadCount > 0 && (
                    <span style={{ position: "absolute", top: "2px", right: "2px", backgroundColor: "#ff4d4f", color: "white", borderRadius: "50%", fontSize: "10px", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* 📂 Menu Dropdown danh sách thông báo */}
            {isOpen && (
                <div style={{ position: "absolute", right: 0, top: "100%", marginTop: "8px", width: "340px", backgroundColor: "#222222", border: "1px solid #333333", borderRadius: "8px", boxShadow: "0 6px 16px rgba(0,0,0,0.4)", zIndex: 100, color: "#fff" }}>

                    <div style={{ padding: "14px 16px", borderBottom: "1px solid #333333", fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "15px" }}>Thông báo mới nhận</span>
                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                style={{ fontSize: "12px", color: "#aaa", border: "none", background: "none", cursor: "pointer" }}
                                onMouseOver={(e) => (e.target.style.color = "#ff4d4f")}
                                onMouseOut={(e) => (e.target.style.color = "#aaa")}
                            >
                                Xóa tất cả
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: "30px", textAlign: "center", color: "#666", fontSize: "14px" }}>
                                Không có thông báo nào.
                            </div>
                        ) : (
                            notifications.map((noti) => (
                                <div
                                    key={noti.id}
                                    onClick={() => handleNotiClick(noti)}
                                    style={{
                                        padding: "14px 16px",
                                        borderBottom: "1px solid #2a2a2a",
                                        backgroundColor: !noti.isRead ? "#2d2d2d" : "transparent",
                                        cursor: "pointer",
                                        position: "relative",
                                        paddingRight: "35px",
                                        transition: "background-color 0.2s"
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#2a2a2a")}
                                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = !noti.isRead ? "#2d2d2d" : "transparent")}
                                >
                                    <p style={{ margin: 0, fontSize: "13.5px", color: "#e5e5e5", lineHeight: "1.4", fontWeight: !noti.isRead ? "600" : "normal" }}>
                                        {noti.content}
                                    </p>

                                    <div style={{ marginTop: "6px" }}>
                                        <span style={{ fontSize: "11px", color: "#666" }}>
                                            {new Date(noti.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <button
                                        onClick={(e) => handleDeleteNoti(e, noti.id, noti.isRead)}
                                        style={{
                                            position: "absolute",
                                            right: "12px",
                                            top: "16px",
                                            border: "none",
                                            background: "none",
                                            color: "#555",
                                            cursor: "pointer",
                                            fontSize: "13px",
                                            padding: "4px"
                                        }}
                                        onMouseOver={(e) => (e.target.style.color = "#ff4d4f")}
                                        onMouseOut={(e) => (e.target.style.color = "#555")}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;