import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../app/axios/axiosClient";
import { useNotifications } from "../../features/notifications/useNotifications";

const NotificationBell = ({ userId }) => {
    // Dùng chung 1 kết nối SSE với Navbar (xem useNotifications)
    const [notifications, setNotifications] = useNotifications(userId);
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleNotiClick = async (noti) => {
        try {
            if (!noti.isRead) {
                await axiosClient.put(`/notifications/${noti.id}/read`);
                setNotifications((prev) =>
                    prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n))
                );
            }

            if (noti.trackId) {
                navigate(`/track/${noti.trackId}`);
                setIsOpen(false);
            }
        } catch (err) {
            console.error("Lỗi khi xử lý click thông báo:", err);
        }
    };

    const handleDeleteNoti = async (e, notiId) => {
        e.stopPropagation();
        try {
            await axiosClient.delete(`/notifications/${notiId}`);
            setNotifications((prev) => prev.filter((n) => n.id !== notiId));
        } catch (err) {
            console.error("Lỗi khi xóa thông báo:", err);
        }
    };

    const handleClearAll = async () => {
        try {
            await axiosClient.delete(`/notifications/clear-all`);
            setNotifications([]);
        } catch (err) {
            console.error("Lỗi khi xóa tất cả thông báo:", err);
        }
    };

    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            {/* 🔔 Icon chiếc chuông chuẩn giao diện tối */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ background: "none", border: "none", cursor: "pointer", position: "relative", padding: "8px", color: "#fff" }}
            >
                {/* Dùng chuông nét mảnh hợp gu app nhạc hoặc bồ thích giữ icon 🔔 thì tùy ý nhé */}
                <span style={{ fontSize: "22px" }}>🔔</span>

                {/* 🔴 Số đỏ thông báo */}
                {unreadCount > 0 && (
                    <span style={{ position: "absolute", top: "2px", right: "2px", backgroundColor: "#ff4d4f", color: "white", borderRadius: "50%", fontSize: "10px", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* 📂 Menu danh sách thông báo Dropdown (Đã chuyển sang DARK MODE giống ảnh bồ gửi) */}
            {isOpen && (
                <div style={{ position: "absolute", right: 0, top: "100%", mt: "8px", width: "340px", backgroundColor: "#222222", border: "1px solid #333333", borderRadius: "8px", boxShadow: "0 6px 16px rgba(0,0,0,0.4)", zIndex: 100, color: "#fff" }}>

                    {/* Header: Đúng chữ "Thông báo mới nhận" + nút Xóa tất cả */}
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

                    {/* Body list item */}
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
                                        // Chưa đọc thì nền xám sáng hơn một chút để phân biệt
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

                                    {/* ✕ Nút xóa thông báo nhỏ ở góc phải */}
                                    <button
                                        onClick={(e) => handleDeleteNoti(e, noti.id)}
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