import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, LogOut, ChevronDown, LayoutDashboard, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/useAuthStore';
import MusicImage from './MusicImage.jsx';
import axiosClient from "../../app/axios/axiosClient";

const Navbar = () => {
    const navigate = useNavigate();

    const { userId, username, role, img, logout, isAuthenticated } = useAuthStore();
    const id = userId;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');

    // CÁC STATE PHỤC VỤ THÔNG BÁO REAL-TIME
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notiDropdownOpen, setNotiDropdownOpen] = useState(false);
    const notiDropdownRef = useRef(null);

    // LOGIC KẾT NỐI REAL-TIME VÀ LẤY THÔNG BÁO CŨ
    useEffect(() => {
        if (!isAuthenticated || !id) return;

        // Dùng axiosClient để lấy thông báo lịch sử (tự động đính kèm Token và tránh lỗi CORS)
        axiosClient.get(`/notifications/user/${id}`)
            .then((res) => {
                setNotifications(res.data);
                const unread = res.data.filter((n) => !n.isRead).length;
                setUnreadCount(unread);
            })
            .catch((err) => console.error("Lỗi lấy thông báo cũ:", err));

        // Mở kết nối SSE lắng nghe thông báo mới (SSE vẫn dùng URL tuyệt đối)
        const eventSource = new EventSource(`http://localhost:8080/api/notifications/subscribe/${id}`);

        eventSource.addEventListener("NEW_TRACK", (event) => {
            const newNoti = JSON.parse(event.data);
            setNotifications((prev) => [newNoti, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        eventSource.onerror = (err) => {
            console.error("Lỗi kết nối SSE:", err);
        };

        return () => {
            eventSource.close();
        };
    }, [isAuthenticated, id]);


    const handleNotiClick = async (noti) => {
        try {
            if (!noti.isRead) {
                await axiosClient.put(`/notifications/${noti.id}/read`);
                setNotifications((prev) =>
                    prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n))
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }

            if (noti.trackId) {
                navigate(`/tracks/${noti.trackId}`);
                setNotiDropdownOpen(false);
            }
        } catch (err) {
            console.error("Lỗi khi xử lý click thông báo:", err);
        }
    };

    //XÓA 1 THÔNG BÁO CỤ THỂ
    const handleDeleteNoti = async (e, notiId, isRead) => {
        e.stopPropagation();
        try {
            await axiosClient.delete(`/notifications/${notiId}`);
            setNotifications((prev) => prev.filter((n) => n.id !== notiId));
            if (!isRead) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error("Lỗi khi xóa thông báo:", err);
        }
    };

    // 2. XÓA SẠCH THÔNG BÁO (Sửa endpoint khớp với @DeleteMapping("/clear-all") của Backend)
    const handleClearAll = async () => {
        try {
            await axiosClient.delete(`/notifications/clear-all`);
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Lỗi khi xóa tất cả thông báo:", err);
        }
    };

    // HÀM XỬ LÝ ĐÁNH DẤU ĐÃ ĐỌC
    const handleMarkAsRead = async (e, notiId) => {
        e.stopPropagation();
        try {
            await axiosClient.put(`/notifications/${notiId}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === notiId ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái đã đọc:", err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim() !== '') {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (notiDropdownRef.current && !notiDropdownRef.current.contains(event.target)) {
                setNotiDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-20 flex items-center justify-between px-8 bg-[#09090b] border-b border-[#282828] sticky top-0 z-50 font-sans text-white">
            {/* Thanh tìm kiếm */}
            <div className="flex items-center bg-[#121212] rounded-full px-5 py-2.5 w-80 border border-[#282828] focus-within:border-blue-500 transition-all">
                <Search className="text-[#a7a7a7] mr-3" size={20} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    placeholder="Bài hát, nghệ sĩ..."
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-[#535353]"
                />
            </div>

            <div className="flex items-center gap-6">
                {isAuthenticated && (
                    <div className="relative" ref={notiDropdownRef}>
                        <button
                            onClick={() => setNotiDropdownOpen(!notiDropdownOpen)}
                            className="relative p-2 text-[#a7a7a7] hover:text-white transition-colors cursor-pointer bg-transparent border-none focus:outline-none"
                        >
                            <Bell size={22} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 min-w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {notiDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-[#282828] border border-[#3e3e3e] rounded-lg shadow-2xl py-1 z-50 animate-fadeIn text-sm">
                                <div className="px-4 py-3 border-b border-[#3e3e3e] font-bold bg-[#1e1e1e]/50 rounded-t-lg flex justify-between items-center">
                                    <span>Thông báo mới nhận</span>
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={handleClearAll}
                                            className="text-xs text-gray-400 hover:text-red-400 bg-transparent border-none cursor-pointer font-normal transition-colors"
                                        >
                                            Xóa tất cả
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-6 text-center text-[#a7a7a7] text-xs">
                                            Không có thông báo nào ở đây cả.
                                        </div>
                                    ) : (
                                        notifications.map((noti) => (
                                            <div
                                                key={noti.id}
                                                onClick={() => handleNotiClick(noti)}
                                                className={`px-4 py-3 border-b border-[#1e1e1e] flex flex-col gap-1 transition-colors relative group cursor-pointer ${!noti.isRead ? 'bg-[#333333]' : 'hover:bg-[#343434]'}`}
                                            >
                                                <button
                                                    onClick={(e) => handleDeleteNoti(e, noti.id, noti.isRead)}
                                                    className="absolute right-3 top-3 p-1 text-gray-500 hover:text-red-400 bg-transparent border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Xóa thông báo"
                                                >
                                                    <X size={14} />
                                                </button>

                                                <p className={`text-xs text-white leading-relaxed pr-5 ${!noti.isRead ? 'font-semibold' : 'font-normal'}`}>
                                                    {noti.content}
                                                </p>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-[10px] text-[#a7a7a7]">
                                                        {noti.createdAt ? new Date(noti.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                    {!noti.isRead && (
                                                        <button
                                                            onClick={(e) => handleMarkAsRead(e, noti.id)}
                                                            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-transparent border-none cursor-pointer font-medium"
                                                        >
                                                            <Check size={12} />
                                                            Đọc xong
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="relative" ref={dropdownRef}>
                    {isAuthenticated ? (
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-500 focus:border-blue-500 transition-all duration-300 bg-[#282828] flex items-center justify-center cursor-pointer p-0 shadow-md"
                            title={username || 'User Profile'}
                        >
                            <MusicImage
                                src={img && img !== 'null' ? img : `https://ui-avatars.com/api/?name=${username || 'U'}&background=0D8BFF&color=fff&bold=true&size=128`}
                                alt="User Avatar"
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ) : (
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 bg-[#121212] hover:bg-[#282828] p-1.5 pr-3 rounded-full border border-[#282828] transition-colors cursor-pointer text-white"
                        >
                            <div className="w-7 h-7 bg-[#282828] rounded-full flex items-center justify-center border border-[#3e3e3e]">
                                <User size={16} className="text-[#a7a7a7]" />
                            </div>
                            <span className="text-xs font-bold max-w-[100px] truncate">Guest</span>
                            <ChevronDown size={14} className={`text-[#a7a7a7] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                    )}

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-[#282828] border border-[#3e3e3e] rounded-lg shadow-2xl py-1 z-50 animate-fadeIn">
                            {isAuthenticated ? (
                                <>
                                    <div className="px-4 py-3 border-b border-[#3e3e3e] mb-1 bg-[#1e1e1e]/50 rounded-t-lg">
                                        <p className="text-sm font-bold text-white truncate">{username}</p>
                                        <p className="text-[10px] text-[#a7a7a7] uppercase tracking-widest mt-0.5">
                                            {role === 'admin' ? 'Quản trị viên' : (role === 'artist' ? 'Nghệ sĩ' : 'Người nghe')}
                                        </p>
                                    </div>

                                    {role === 'admin' && (
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                navigate('/admin');
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-yellow-500 hover:bg-[#3e3e3e] flex items-center gap-2.5 transition-colors bg-transparent border-none cursor-pointer"
                                        >
                                            <LayoutDashboard size={16} />
                                            <span>Admin Dashboard</span>
                                        </button>
                                    )}

                                    {role !== 'admin' && (
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                if (role === 'artist') navigate(`/artist/${id}`);
                                                else navigate('/profile');
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3e3e3e] flex items-center gap-2.5 transition-colors bg-transparent border-none cursor-pointer"
                                        >
                                            <User size={16} className="text-[#a7a7a7]" />
                                            <span>Account</span>
                                        </button>
                                    )}

                                    <div className="border-t border-[#3e3e3e] my-1"></div>

                                    <button
                                        onClick={() => { setDropdownOpen(false); handleLogout(); }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-[#3e3e3e] flex items-center gap-2.5 transition-colors bg-transparent border-none cursor-pointer"
                                    >
                                        <LogOut size={16} />
                                        <span>Log out</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => { setDropdownOpen(false); navigate('/login'); }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-white hover:bg-[#3e3e3e] flex items-center gap-2.5 transition-colors bg-transparent border-none cursor-pointer"
                                >
                                    <LogOut size={16} className="text-blue-500 transform rotate-180" />
                                    <span>Login</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;