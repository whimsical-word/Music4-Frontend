import React from 'react';
import {
    Home,
    Library,
    PlusSquare,
    Heart,
    Headphones,
    Mic2,
    Disc,
    Users,
    LayoutGrid,
    LayoutDashboard,
    Music2
} from 'lucide-react';
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
        <div className="w-64 bg-[#0d131a] p-6 flex flex-col h-full border-r border-white/[0.05] hidden md:flex font-sans text-slate-400">

            {/* LOGO BRANDING */}
            <Link to="/" className="flex items-center gap-3 mb-8 cursor-pointer group">
                <div className="w-10 h-10 bg-sky-500 hover:bg-sky-400 hover:scale-105 active:scale-95 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_4px_14px_rgba(14,165,233,0.2)]">
                    <Headphones className="text-white" size={20} />
                </div>
                <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    MUSIC 4
                </h1>
            </Link>

            {/* THANH ĐIỀU HƯỚNG CHUNG */}
            <nav className="flex flex-col gap-4 font-medium">
                <Link to="/" className={`flex items-center gap-4 hover:text-sky-400 transition-all ${!isAdminPage && location.pathname === '/' ? 'text-sky-400 font-semibold' : ''}`}>
                    <Home size={22} /> Trang chủ
                </Link>
                {role !== 'admin' && (
                    <Link to="/library" className={`flex items-center gap-4 hover:text-sky-400 transition-all ${location.pathname === '/library' ? 'text-sky-400 font-semibold' : ''}`}>
                        <Library size={22} /> Thư viện
                    </Link>
                )}
            </nav>

            {/* 🟢 KHU VỰC THÊM MỚI: DANH SÁCH MENU DÀNH RIÊNG CHO ADMIN */}
            {role === 'admin' && (
                <div className="mt-8 pt-6 border-t border-white/[0.05] flex flex-col gap-2 font-medium">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Quản trị hệ thống</p>

                    <button
                        onClick={() => handleAdminTabChange('overview')}
                        className={`flex items-center gap-4 py-2 px-3 rounded-xl text-sm font-semibold transition-all w-full text-left bg-transparent border-none outline-none cursor-pointer ${isAdminPage && currentTab === 'overview' ? 'bg-white/[0.06] text-white border-l-2 border-sky-400 rounded-l-none pl-3' : 'hover:text-white hover:bg-white/[0.03]'}`}
                    >
                        <LayoutDashboard size={18} className={isAdminPage && currentTab === 'overview' ? 'text-sky-400' : ''} />
                        Tổng quan
                    </button>

                    <button
                        onClick={() => handleAdminTabChange('users')}
                        className={`flex items-center gap-4 py-2 px-3 rounded-xl text-sm font-semibold transition-all w-full text-left bg-transparent border-none outline-none cursor-pointer ${isAdminPage && currentTab === 'users' ? 'bg-white/[0.06] text-white border-l-2 border-sky-400 rounded-l-none pl-3' : 'hover:text-white hover:bg-white/[0.03]'}`}
                    >
                        <Users size={18} className={isAdminPage && currentTab === 'users' ? 'text-sky-400' : ''} />
                        Người dùng
                    </button>

                    <button
                        onClick={() => handleAdminTabChange('artists')}
                        className={`flex items-center gap-4 py-2 px-3 rounded-xl text-sm font-semibold transition-all w-full text-left bg-transparent border-none outline-none cursor-pointer ${isAdminPage && currentTab === 'artists' ? 'bg-white/[0.06] text-white border-l-2 border-sky-400 rounded-l-none pl-3' : 'hover:text-white hover:bg-white/[0.03]'}`}
                    >
                        <Mic2 size={18} className={isAdminPage && currentTab === 'artists' ? 'text-sky-400' : ''} />
                        Nghệ sĩ
                    </button>

                    <button
                        onClick={() => handleAdminTabChange('categories')}
                        className={`flex items-center gap-4 py-2 px-3 rounded-xl text-sm font-semibold transition-all w-full text-left bg-transparent border-none outline-none cursor-pointer ${isAdminPage && currentTab === 'categories' ? 'bg-white/[0.06] text-white border-l-2 border-sky-400 rounded-l-none pl-3' : 'hover:text-white hover:bg-white/[0.03]'}`}
                    >
                        <LayoutGrid size={18} className={isAdminPage && currentTab === 'categories' ? 'text-sky-400' : ''} />
                        Thể loại
                    </button>
                </div>
            )}

            {/* DANH SÁCH PLAYLIST CHO NGƯỜI NGHE */}
            {role !== 'artist' && role !== 'admin' && (
                <>
                    <div className="mt-8 pt-6 border-t border-white/[0.05] flex flex-col gap-4 font-medium">
                        <button className="flex items-center gap-4 hover:text-sky-400 transition-all group w-full text-left bg-transparent border-none outline-none cursor-pointer p-0">
                            <div className="bg-white/[0.04] border border-white/[0.02] group-hover:bg-white/[0.08] group-hover:text-sky-400 p-1.5 rounded-lg text-slate-300 transition-colors"><PlusSquare size={18} /></div>
                            Tạo Playlist
                        </button>
                        <Link to="/favorites" className={`flex items-center gap-4 hover:text-sky-400 transition-all group ${location.pathname === '/favorites' ? 'text-sky-400 font-semibold' : ''}`}>
                            <div className="bg-white/[0.04] border border-white/[0.02] group-hover:bg-white/[0.08] p-1.5 rounded-lg text-slate-300 transition-all"><Heart size={18} /></div>
                            Bài hát đã thích
                        </Link>
                    </div>
                    <div className="mt-6 flex-1 overflow-y-auto custom-scrollbar">
                        <ul className="flex flex-col gap-3 text-sm text-slate-400">
                            {playlists.map((pl) => (
                                <li key={pl.id} className="hover:text-sky-400 cursor-pointer transition-colors truncate">
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