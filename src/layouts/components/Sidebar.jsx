import React from 'react';
import { Home, Library, PlusSquare, Heart, Music, Mic2, Disc, Users, LayoutGrid, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/useAuthStore';

const Sidebar = ({ playlists = [] }) => {
    const { role } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy query param 'tab' hiện tại để xác định nút nào đang được active
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('tab') || 'overview';
    const isAdminPage = location.pathname === '/admin';

    // Hàm tiện ích chuyển tab nhanh cho admin
    const handleAdminTabChange = (tabName) => {
        navigate(`/admin?tab=${tabName}`);
    };

    return (
        <div className="w-64 bg-black p-6 flex flex-col h-full border-r border-[#282828] hidden md:flex font-sans text-gray-400">
            <Link to="/" className="flex items-center gap-3 mb-8 cursor-pointer group">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300">
                    <Music className="text-white" size={20} />
                </div>
                <h1 className="text-2xl font-bold tracking-wider text-white">
                    MUSIC<span className="text-blue-500">4</span>
                </h1>
            </Link>

            {/* THANH ĐIỀU HƯỚNG CHUNG */}
            <nav className="flex flex-col gap-4 font-medium">
                <Link to="/" className={`flex items-center gap-4 hover:text-white transition-all ${!isAdminPage && location.pathname === '/' ? 'text-white' : ''}`}>
                    <Home size={22} /> Trang chủ
                </Link>
                {role !== 'admin' && (
                    <Link to="/library" className="flex items-center gap-4 hover:text-white transition-all">
                        <Library size={22} /> Thư viện
                    </Link>
                )}
            </nav>

            {/* 🟢 KHU VỰC THÊM MỚI: DANH SÁCH MENU DÀNH RIÊNG CHO ADMIN */}
            {role === 'admin' && (
                <div className="mt-8 pt-6 border-t border-[#282828] flex flex-col gap-2 font-medium">
                    <p className="text-[10px] font-bold text-[#535353] uppercase tracking-widest mb-2 px-1">Quản trị hệ thống</p>

                    <button
                        onClick={() => handleAdminTabChange('overview')}
                        className={`flex items-center gap-4 py-2 px-3 rounded-lg text-sm font-semibold transition-all w-full text-left bg-transparent border-none outline-none cursor-pointer p-0 ${isAdminPage && currentTab === 'overview' ? 'bg-[#282828] text-white' : 'hover:text-white hover:bg-[#181818]'}`}
                    >
                        <LayoutDashboard size={18} className={isAdminPage && currentTab === 'overview' ? 'text-blue-500' : ''} />
                        Tổng quan
                    </button>

                    <button
                        onClick={() => handleAdminTabChange('users')}
                        className={`flex items-center gap-4 py-2 px-3 rounded-lg text-sm font-semibold transition-all w-full text-left bg-transparent border-none outline-none cursor-pointer p-0 ${isAdminPage && currentTab === 'users' ? 'bg-[#282828] text-white' : 'hover:text-white hover:bg-[#181818]'}`}
                    >
                        <Users size={18} className={isAdminPage && currentTab === 'users' ? 'text-blue-500' : ''} />
                        Người dùng
                    </button>

                    <button
                        onClick={() => handleAdminTabChange('artists')}
                        className={`flex items-center gap-4 py-2 px-3 rounded-lg text-sm font-semibold transition-all w-full text-left bg-transparent border-none outline-none cursor-pointer p-0 ${isAdminPage && currentTab === 'artists' ? 'bg-[#282828] text-white' : 'hover:text-white hover:bg-[#181818]'}`}
                    >
                        <Mic2 size={18} className={isAdminPage && currentTab === 'artists' ? 'text-blue-500' : ''} />
                        Nghệ sĩ
                    </button>

                    <button
                        onClick={() => handleAdminTabChange('categories')}
                        className={`flex items-center gap-4 py-2 px-3 rounded-lg text-sm font-semibold transition-all w-full text-left bg-transparent border-none outline-none cursor-pointer p-0 ${isAdminPage && currentTab === 'categories' ? 'bg-[#282828] text-white' : 'hover:text-white hover:bg-[#181818]'}`}
                    >
                        <LayoutGrid size={18} className={isAdminPage && currentTab === 'categories' ? 'text-blue-500' : ''} />
                        Thể loại
                    </button>
                </div>
            )}

            {/* MENU CHO ARTIST */}
            {role === 'artist' && (
                <div className="mt-8 pt-6 border-t border-[#282828] flex flex-col gap-4 font-medium">
                    <button onClick={() => navigate('/studio/upload')} className="flex items-center gap-4 hover:text-white transition-all group w-full text-left bg-transparent border-none outline-none cursor-pointer p-0">
                        <div className="bg-[#282828] group-hover:bg-[#3e3e3e] p-1 rounded-sm text-white transition-colors"><Mic2 size={20} /></div>
                        Tạo Bài hát mới
                    </button>
                    <button onClick={() => navigate('/studio/album')} className="flex items-center gap-4 hover:text-white transition-all group w-full text-left bg-transparent border-none outline-none cursor-pointer p-0">
                        <div className="bg-[#282828] group-hover:bg-[#3e3e3e] p-1 rounded-sm text-white transition-colors"><Disc size={20} /></div>
                        Tạo Album mới
                    </button>
                </div>
            )}

            {/* DANH SÁCH PLAYLIST CHO NGƯỜI NGHE */}
            {role !== 'artist' && role !== 'admin' && (
                <>
                    <div className="mt-8 pt-6 border-t border-[#282828] flex flex-col gap-4 font-medium">
                        <button className="flex items-center gap-4 hover:text-white transition-all group w-full text-left bg-transparent border-none outline-none cursor-pointer p-0">
                            <div className="bg-[#282828] group-hover:bg-[#3e3e3e] p-1 rounded-sm text-white transition-colors"><PlusSquare size={20} /></div>
                            Tạo Playlist
                        </button>
                        <Link to="/favorites" className="flex items-center gap-4 hover:text-white transition-all group">
                            <div className="bg-[#282828] p-1 rounded-sm text-white transition-all"><Heart size={20} /></div>
                            Bài hát đã thích
                        </Link>
                    </div>
                    <div className="mt-6 flex-1 overflow-y-auto custom-scrollbar">
                        <ul className="flex flex-col gap-3 text-sm text-[#a7a7a7]">
                            {playlists.map((pl) => (
                                <li key={pl.id} className="hover:text-white cursor-pointer transition-colors truncate">
                                    <Link to={`/playlist/${pl.id}`}>{pl.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
};

export default Sidebar;