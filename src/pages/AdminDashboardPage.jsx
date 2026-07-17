import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {Users, Mic2, LayoutGrid, Trash2, Edit, Eye, Plus, Play, RefreshCw, AlertTriangle, CheckCircle} from 'lucide-react';
import axiosClient from '../app/axios/axiosClient';
import MusicImage from '../layouts/components/MusicImage';
import { AppPagination } from "../layouts/components/AppPagination.jsx";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePlayerStore } from '../features/player/usePlayerStore';
const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    const playTrack = usePlayerStore((state) => state.playTrack);

    const COLORS = [
        '#1db954', // 01. Spotify Green (Màu gốc của bồ)
        '#3b82f6', // 02. Electric Blue
        '#8b5cf6', // 03. Deep Purple Neon
        '#f59e0b', // 04. Amber Gold
        '#ec4899', // 05. Hot Pink
        '#14b8a6', // 06. Teal Ocean
        '#ef4444', // 07. Crimson Red
        '#06b6d4', // 08. Cyber Cyan
        '#f97316', // 09. Bright Orange
        '#a855f7', // 10. Vivid Amethyst
        '#6366f1', // 11. Indigo Glow
        '#10b981', // 12. Mint Emerald
        '#eab308', // 13. Acid Yellow
        '#64748b', // 14. Cool Slate Grey
        '#d946ef', // 15. Fuchsia Bright
        '#84cc16', // 16. Lime Green
        '#22d3ee', // 17. Ice Ice Blue
        '#f43f5e', // 18. Rose Petal
        '#fbbf24', // 19. Warm Sun Yellow
        '#c084fc', // 20. Soft Lavender
        '#2dd4bf', // 21. Aquamarine
        '#fb923c', // 22. Pastel Tangerine
        '#38bdf8', // 23. Sky Blue Neon
        '#f472b6', // 24. Cotton Candy Pink
        '#4ade80', // 25. Light Neon Green
        '#9333ea', // 26. Dark Violet
        '#0284c7', // 27. Deep Sea Blue
        '#ea580c', // 28. Burnt Orange
        '#e11d48', // 29. Ruby Red
        '#0d9488', // 30. Dark Turquoise
        '#4f46e5', // 31. Royal Indigo
        '#16a34a'  // 32. Forest Green
    ];
    const [categoryStats, setCategoryStats] = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const [topTracks, setTopTracks] = useState([]);


    // 🟢 Thêm state quản lý trang cho cả User và Artist
    const currentArtistPage = parseInt(searchParams.get('artistPage')) || 0;
    const currentUserPage = parseInt(searchParams.get('userPage')) || 0;

    const [users, setUsers] = useState([]);
    const [artists, setArtists] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // State quản lý trạng thái đồng bộ
    const [isSyncing, setIsSyncing] = useState(false);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const displayToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleConfirmSync = async () => {
        setShowSyncModal(false); // Đóng popup xác nhận
        setIsSyncing(true);
        try {
            await axiosClient.post('/recommendations/sync');
            displayToast("Đồng bộ dữ liệu AI (Elasticsearch) thành công!", "success");
        } catch (error) {
            console.error("Lỗi đồng bộ:", error);
            displayToast(`Đồng bộ thất bại: ${error.response?.data?.message || error.message}`, "error");
        } finally {
            setIsSyncing(false);
        }
    };
    
    // 🟢 Thêm state lưu tổng số lượng để hiển thị Overview
    const [artistCount, setArtistCount] = useState(0);
    const [userCount, setUserCount] = useState(0);

    const [artistTotalPages, setArtistTotalPages] = useState(0);
    const [userTotalPages, setUserTotalPages] = useState(0);

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [
                    usersRes, artistsRes, categoriesRes, artistCountRes,
                    statsRes, topArtistsRes, topTracksRes, userCountRes
                ] = await Promise.allSettled([
                    axiosClient.get('/users', { params: { page: currentUserPage, size: 5 } }),
                    axiosClient.get('/artists', { params: { page: currentArtistPage, size: 5 } }),
                    axiosClient.get('/categories'),
                    axiosClient.get('/artists/count'),
                    axiosClient.get('/categories/stats'),
                    axiosClient.get('/artists/top3'),
                    axiosClient.get('/tracks/top5-views'),
                    axiosClient.get('/users/count'),
                ]);

                if (usersRes.status === 'fulfilled') {
                    const userData = usersRes.value.data;
                    const userList = userData?.content || userData?.data || userData || [];
                    setUsers(Array.isArray(userList) ? userList : []);
                    setUserTotalPages(userData?.totalPages || 0);
                }

                if (artistsRes.status === 'fulfilled') {
                    const artistData = artistsRes.value.data;

                    // Bóc tách mảng linh hoạt giống như User
                    const artistList = artistData?.content || artistData?.data || artistData || [];
                    setArtists(Array.isArray(artistList) ? artistList : []);

                    // Lấy totalPages một cách an toàn
                    setArtistTotalPages(artistData?.totalPages || 0);
                }

                if (artistCountRes.status === 'fulfilled') setArtistCount(artistCountRes.value.data || 0);
                if (categoriesRes.status === 'fulfilled') setCategories(categoriesRes.value.data || []);
                if (statsRes.status === 'fulfilled') setCategoryStats(statsRes.value.data);
                if (topArtistsRes.status === 'fulfilled') setTopArtists(topArtistsRes.value.data);
                if (topTracksRes.status === 'fulfilled') setTopTracks(topTracksRes.value.data);
                if(userCountRes.status === 'fulfilled')  setUserCount (userCountRes.value.data || 0);
            } catch (error) {
                console.error("Lỗi lấy dữ liệu tổng hợp admin:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [activeTab, currentArtistPage, currentUserPage]); // 🟢 Thêm refreshTrigger vào mảng phụ thuộc // Đầy đủ dependency, ESLint sẽ im lặng ngay!
    const handleSaveCategory = async () => {
        if (!categoryName.trim()) return;
        try {
            if (editingCategory) {
               await axiosClient.put(`/categories/${editingCategory.id}`, { name: categoryName });

               setCategories(prev => prev.map(c =>
                    c.id === editingCategory.id ? { ...c, name: categoryName } : c
                ));
            } else {

                const res = await axiosClient.post('/categories', { name: categoryName });
                const newCategory = res.data;
                setCategories(prev => [...prev, newCategory]);
            }

            setCategoryName('');
            setEditingCategory(null);
            setShowCategoryModal(false);

        } catch (error) {
            console.error("Lỗi lưu thể loại:", error);
        }
    };

    const handleArtistPageChange = (newPage) => {
        setSearchParams({ tab: 'artists', artistPage: newPage, userPage: currentUserPage });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUserPageChange = (newPage) => {
        setSearchParams({ tab: 'users', userPage: newPage, artistPage: currentArtistPage });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa thể loại này?")) {
            try {
                await axiosClient.delete(`/categories/${id}`);

                setCategories(prev => prev.filter(c => c.id !== id));



            } catch (error) {
                console.error("Lỗi xóa thể loại:", error);
            }
        }
    };
    const handleDeleteUser = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này? (Dữ liệu liên quan sẽ được xử lý an toàn)")) {
            try {
                // Gọi API xóa người dùng từ backend
                await axiosClient.delete(`/users/${id}`);

                // Cập nhật lại state danh sách người dùng trên giao diện
                setUsers(prev => prev.filter(u => u.id !== id));

                // Giảm biến đếm tổng số User đi 1
                setUserCount(prev => prev - 1);

                displayToast("Xóa người dùng thành công!", "success");
            } catch (error) {
                console.error("Lỗi xóa người dùng:", error);
                displayToast("Xóa người dùng thất bại!", "error");
            }
        }
    };
    return (
        <div className="min-h-screen bg-[#121212] font-sans text-gray-200 p-6 pb-24">
            <main className="max-w-7xl mx-auto animate-in fade-in duration-300">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[#282828] border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* TAB 1: TỔNG QUAN */}
                        {activeTab === 'overview' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Hệ Thống Tổng Quan</h2>
                                    <button
                                        onClick={() => setShowSyncModal(true)}
                                        disabled={isSyncing}
                                        className="flex items-center gap-2 bg-linear-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white px-4 py-2.5 rounded-lg font-semibold transition-all cursor-pointer border-none shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Đồng bộ kho nhạc lên Elasticsearch để AI Gợi ý hoạt động"
                                    >
                                        <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
                                        <span>{isSyncing ? "Đang đồng bộ..." : "Đồng Bộ Dữ Liệu AI"}</span>
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-[#181818] p-6 rounded-xl border border-[#282828] flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><Users size={24}/></div>
                                        <div>
                                            <p className="text-sm text-[#a7a7a7] font-medium">Người Nghe</p>
                                            {/* 🟢 Hiển thị tổng số User lấy từ PageResponseDTO */}
                                            <h3 className="text-2xl font-bold text-white mt-1">{userCount}</h3>
                                        </div>
                                    </div>
                                    <div className="bg-[#181818] p-6 rounded-xl border border-[#282828] flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Mic2 size={24}/></div>
                                        <div>
                                            <p className="text-sm text-[#a7a7a7] font-medium">Nghệ Sĩ</p>
                                            {/* 🟢 Hiển thị tổng số Artist từ API /count */}
                                            <h3 className="text-2xl font-bold text-white mt-1">{artistCount}</h3>
                                        </div>
                                    </div>
                                    <div className="bg-[#181818] p-6 rounded-xl border border-[#282828] flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500"><LayoutGrid size={24}/></div>
                                        <div>
                                            <p className="text-sm text-[#a7a7a7] font-medium">Thể Loại Nhạc</p>
                                            <h3 className="text-2xl font-bold text-white mt-1">{categories.length}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                    {/* 📊 KHU VỰC 1: BIỂU ĐỒ TRÒN (PIE CHART) */}
                                    <div className="bg-[#181818] p-6 rounded-2xl border border-[#282828] shadow-lg flex flex-col h-[400px]">
                                        <h3 className="text-lg font-bold text-white mb-2">Tỷ Lệ Thể Loại Nhạc</h3>
                                        <p className="text-xs text-[#a7a7a7] mb-4">Mức độ phân bổ bài hát trên hệ thống</p>

                                        {/* [FLOW - BƯỚC 5]: Đổ data categoryStats vào ResponsiveContainer.
                    Recharts sẽ tự động đọc mảng [{name: "Pop", value: 145}, ...] để tính % và vẽ góc tròn tương ứng */}
                                        <div className="flex-1 min-h-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={categoryStats}
                                                        dataKey="value" // Chỉ định trường chứa số lượng để Recharts cắt bánh
                                                        nameKey="name"  // Chỉ định trường chứa tên thể loại để làm nhãn
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={80} // Tạo lỗ hổng ở giữa (Biến Pie thành Donut Chart cho sành điệu)
                                                        outerRadius={120}
                                                        paddingAngle={2}
                                                    >
                                                        {/* [FLOW]: Chạy vòng lặp tô màu cho từng miếng bánh */}
                                                        {categoryStats.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    {/* Hiển thị tooltip đen nhám khi hover chuột vào miếng bánh */}
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#282828', borderColor: '#3e3e3e', color: '#fff', borderRadius: '8px' }}
                                                        itemStyle={{ color: '#fff' }}
                                                    />
                                                    {/* Chú thích màu sắc nằm ở dưới cùng */}
                                                    <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* 👑 KHU VỰC 2.1: TOP 5 BÀI HÁT THỊNH HÀNH */}
                                    <div className="bg-[#181818] p-6 rounded-2xl border border-[#282828] shadow-lg flex flex-col h-[400px]">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-white">Top 5 Trending</h3>
                                                <p className="text-xs text-[#a7a7a7]">Nhiều lượt stream nhất</p>
                                            </div>
                                            {/*<Play className="text-blue-500" size={24} />*/}
                                        </div>

                                        {/* [FLOW - BƯỚC 6]: Render mảng topTracks. Dùng overflow-y-auto để có thể cuộn nếu danh sách dài */}
                                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                            {topTracks.map((track, idx) => (
                                                <div key={track.id} className="flex items-center justify-between p-3 rounded-xl bg-[#222222]/50 hover:bg-[#282828] transition-colors group cursor-pointer border border-transparent hover:border-[#3e3e3e]">
                                                    <div className="flex items-center gap-4 overflow-hidden">
                                                        <span className={`font-black text-lg w-4 text-center ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-[#a7a7a7]'}`}>{idx + 1}</span>
                                                        <div className="col-span-1 flex items-center justify-center">
                                                            <div className="w-12 h-12 rounded-md overflow-hidden bg-[#282828] relative shadow-md flex-shrink-0">
                                                                <MusicImage
                                                                    src={track.img}
                                                                    type={'track'}
                                                                    alt={track.name}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            playTrack(track, topTracks); // Nên truyền thêm tham số 'tracks' ngữ cảnh để kích hoạt hàng đợi chuyển bài
                                                                        }}
                                                                        className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 border-none cursor-pointer shadow-md"
                                                                    >
                                                                        <Play size={20} fill="currentColor" className="text-black ml-0.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="truncate">
                                                            <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                                                                {track.name}
                                                            </h4>
                                                            <p className="text-xs text-[#a7a7a7] truncate flex gap-1 items-center">
                                                                {track.artists && track.artists.length > 0 ? (
                                                                    track.artists.map((artist, idx) => (
                                                                        <span key={artist.id}>
                        <span
                            onClick={(e) => {
                                e.stopPropagation(); // Ngăn chặn hành vi click lan ra dòng cha gây phát nhạc ngoài ý muốn
                                navigate(`/artist/${artist.id}`); // Điều hướng người dùng sang trang cá nhân nghệ sĩ
                            }}
                            className="hover:text-blue-400 hover:underline cursor-pointer transition-colors"
                        >
                            {artist.name}
                        </span>
                                                                            {/* Nếu bài hát được thể hiện bởi nhiều nghệ sĩ, tự động thêm dấu phẩy ngăn cách */}
                                                                            {idx < track.artists.length - 1 && ", "}
                    </span>
                                                                    ))
                                                                ) : (
                                                                    <span>Nghệ sĩ hệ thống</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-sm font-black text-white">{track.viewCount?.toLocaleString()}</p>
                                                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Streams</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 👑 KHU VỰC 2.2: TOP 3 NGHỆ SĨ NỔI BẬT (Bảng Vàng Vinh Danh - Dàn hàng ngang) */}
                                <div className="bg-[#181818] p-6 rounded-2xl border border-[#282828] shadow-lg">
                                    <h3 className="text-lg font-bold text-white mb-1">Bảng Vàng Nghệ Sĩ</h3>
                                    <p className="text-xs text-[#a7a7a7] mb-6">Đánh giá theo tương tác tổng hợp (Followers + Favorites)</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        {/* [FLOW - BƯỚC 7]: Lặp qua 3 nghệ sĩ đỉnh nhất. Tạo thẻ Card có hiệu ứng hover sành điệu */}
                                        {topArtists.map((artist, idx) => (
                                            <div key={artist.id} className="relative bg-[#222222] p-6 rounded-xl flex flex-col items-center text-center group hover:bg-[#282828] transition-all border border-[#2c2c2c] hover:border-blue-500/50">
                                                {/* Vương miện cho top 1 */}
                                                {idx === 0 && <div className="absolute -top-3 text-2xl drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] z-10">👑</div>}

                                                {/* Ảnh Avatar */}
                                                <div className="w-24 h-24 rounded-full p-1 mb-4 relative">
                                                    {/* Viền gradient xoay vòng cho đẹp mắt */}
                                                    <div className={`absolute inset-0 rounded-full ${idx === 0 ? 'bg-gradient-to-tr from-yellow-400 to-amber-600' : idx === 1 ? 'bg-gradient-to-tr from-gray-300 to-gray-500' : 'bg-gradient-to-tr from-amber-700 to-amber-900'} opacity-70 group-hover:opacity-100 transition-opacity`}></div>
                                                    <div className="w-full h-full rounded-full overflow-hidden bg-[#121212] relative z-10 border-2 border-[#181818]">
                                                        <MusicImage src={artist.img} type="artist" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                                                    </div>
                                                </div>

                                                <h4 className="text-lg font-black text-white mb-1">{artist.name}</h4>

                                                {/* Chỉ số thống kê (Hiển thị điểm tổng hợp) */}
                                                <div className="flex gap-4 mt-3 pt-3 border-t border-[#333] w-full justify-center">
                                                    <div>
                                                        <p className="text-[10px] text-[#a7a7a7] uppercase tracking-wider">Tương tác</p>
                                                        <p className="text-sm font-bold text-emerald-500">{(artist.followers + artist.favorites).toLocaleString()}</p>
                                                    </div>
                                                    <div className="w-px bg-[#333]"></div>
                                                    <div>
                                                        <p className="text-[10px] text-[#a7a7a7] uppercase tracking-wider">Bài hát</p>
                                                        <p className="text-sm font-bold text-gray-300">{artist.trackTotal}</p>
                                                    </div>
                                                    <div className="w-px bg-[#333]"></div>
                                                    <div>
                                                        <p className="text-[10px] text-[#a7a7a7] uppercase tracking-wider">Người theo dõi </p>
                                                        <p className="text-sm font-bold text-gray-300">{artist.followers}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: QUẢN LÝ USER */}
                        {activeTab === 'users' && (
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-6">Quản Lý Người Dùng ({userCount})</h2>
                                <div className="bg-[#181818] rounded-xl border border-[#282828] overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                        <tr className="border-b border-[#282828] bg-[#222222] text-[#a7a7a7] text-xs uppercase tracking-wider font-semibold">
                                            <th className="p-4">Thành viên</th>
                                            <th className="p-4">Email</th>
                                            <th className="p-4">ID Tài khoản</th>
                                            <th className="p-4 text-right">Hành động</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#282828] text-sm">
                                        {users.map(u => (
                                            <tr key={u.id} className="hover:bg-[#222222]/50 transition-colors">
                                                <td className="p-4 flex items-center gap-3 font-medium text-white">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#282828]">
                                                        <MusicImage src={u.img} type="artist"/>
                                                    </div>
                                                    <span>{u.username}</span>
                                                </td>
                                                {/* Thêm cột email cho đầy đủ thông tin */}
                                                <td className="p-4 text-gray-300">{u.email || 'Không có email'}</td>
                                                <td className="p-4 text-gray-400 font-mono">USR-{u.id}</td>
                                                {/* Cột Hành động của User */}
                                                <td className="p-4 text-right flex justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate('/profile')}
                                                        className="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                                                        title="Xem hồ sơ người nghe"
                                                    >
                                                        <Eye size={18}/>
                                                    </button>
                                                    {/* Thêm nút Xóa ở đây */}
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                                                        title="Xóa người dùng"
                                                    >
                                                        <Trash2 size={18}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    {/* Hiển thị nếu list user trống */}
                                    {users.length === 0 && (
                                        <div className="p-6 text-center text-gray-500">Chưa có người dùng nào.</div>
                                    )}
                                </div>
                                {/* 🟢 Thêm phân trang cho User nếu cần */}
                                {userTotalPages > 1 && (
                                    <AppPagination
                                        currentPage={currentUserPage}
                                        totalPages={userTotalPages}
                                        onPageChange={handleUserPageChange}
                                    />
                                )}
                            </div>
                        )}

                        {/* TAB 3: QUẢN LÝ NGHỆ SĨ */}
                        {activeTab === 'artists' && (
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-6">Quản Lý Nghệ Sĩ ({artistCount})</h2>
                                <div className="bg-[#181818] rounded-xl border border-[#282828] overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                        <tr className="border-b border-[#282828] bg-[#222222] text-[#a7a7a7] text-xs uppercase tracking-wider font-semibold">
                                            <th className="p-4">Nghệ sĩ</th>
                                            <th className="p-4">Mã số nghệ sĩ</th>
                                            <th className="p-4 text-right">Hành động</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#282828] text-sm">
                                        {artists.map(a => (
                                            <tr key={a.id} className="hover:bg-[#222222]/50 transition-colors">
                                                <td className="p-4 flex items-center gap-3 font-medium text-white">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#282828]"><MusicImage src={a.img} type="artist"/></div>
                                                    <span>{a.name}</span>
                                                </td>
                                                <td className="p-4 text-gray-400 font-mono">ART-{a.id}</td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => navigate(`/artist/${a.id}`)}
                                                        className="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                                                        title="Xem trang nghệ sĩ"
                                                    >
                                                        <Eye size={18}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                                {artistTotalPages > 1 && (
                                    <AppPagination
                                        currentPage={currentArtistPage}
                                        totalPages={artistTotalPages}
                                        onPageChange={handleArtistPageChange}
                                    />
                                )}
                            </div>
                        )}

                        {/* TAB 4: QUẢN LÝ THỂ LOẠI (giữ nguyên như cũ) */}
                        {activeTab === 'categories' && (
                            <div>
                                {/* ... [Code giữ nguyên như bản cũ] ... */}
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Quản Lý Thể Loại Nhạc ({categories.length})</h2>
                                    <button
                                        onClick={() => { setEditingCategory(null); setCategoryName(''); setShowCategoryModal(true); }}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors cursor-pointer border-none shadow-md"
                                    >
                                        <Plus size={18}/> <span>Thêm Thể Loại</span>
                                    </button>
                                </div>
                                <div className="bg-[#181818] rounded-xl border border-[#282828] overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                        <tr className="border-b border-[#282828] bg-[#222222] text-[#a7a7a7] text-xs uppercase tracking-wider font-semibold">
                                            <th className="p-4">Tên Thể Loại</th>
                                            <th className="p-4">Mã ID</th>
                                            <th className="p-4 text-right">Hành động</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#282828] text-sm">
                                        {categories.map(c => (
                                            <tr key={c.id} className="hover:bg-[#222222]/50 transition-colors">
                                                <td className="p-4 font-medium text-white">{c.name}</td>
                                                <td className="p-4 text-gray-400 font-mono">CAT-{c.id}</td>
                                                <td className="p-4 text-right flex justify-end gap-2">
                                                    <button
                                                        onClick={() => { setEditingCategory(c); setCategoryName(c.name); setShowCategoryModal(true); }}
                                                        className="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                                                    >
                                                        <Edit size={18}/>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(c.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                                                    >
                                                        <Trash2 size={18}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* MODAL THÊM/SỬA CATEGORY */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-[#181818] p-6 rounded-xl border border-[#282828] w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">
                            {editingCategory ? 'Sửa Thể Loại' : 'Thêm Thể Loại Mới'}
                        </h3>
                        <input
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            placeholder="Nhập tên thể loại..."
                            className="w-full p-3 rounded-lg bg-[#282828] text-white border border-[#2d2d30] focus:border-blue-500 outline-none mb-6"
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 rounded-lg text-[#a7a7a7] hover:text-white font-medium">Hủy</button>
                            <button onClick={handleSaveCategory} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">Lưu lại</button>
                        </div>
                    </div>
                </div>
            )}

            {/* POPUP XÁC NHẬN ĐỒNG BỘ AI */}
            {showSyncModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#181818] p-6 rounded-2xl border border-[#282828] w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                            <AlertTriangle className="text-amber-500" size={24} /> 
                            Xác nhận đồng bộ dữ liệu
                        </h3>
                        <div className="text-slate-300 text-sm mb-6 leading-relaxed">
                            Bạn có chắc chắn muốn đồng bộ dữ liệu hệ thống lên Elasticsearch không?
                            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-lg mt-3 text-xs flex gap-2">
                                <AlertTriangle size={16} className="shrink-0" />
                                <span>Quá trình này sẽ lấy toàn bộ bài hát, dịch sang Vector thông qua AI và lưu trữ. Thao tác này có thể mất một chút thời gian.</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowSyncModal(false)} 
                                className="px-5 py-2.5 rounded-lg text-[#a7a7a7] hover:text-white font-medium bg-[#282828] hover:bg-[#3e3e3e] transition-colors border-none cursor-pointer"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={handleConfirmSync} 
                                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer border-none shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                            >
                                Bắt đầu đồng bộ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST THÔNG BÁO (Góc dưới bên phải) */}
            {toast.show && (
                <div className={`fixed top-24 right-10 z-100 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl animate-in slide-in-from-top-5 fade-in duration-300 border ${
                    toast.type === 'success' 
                        ? 'bg-emerald-950 border-emerald-500/50 text-emerald-400' 
                        : 'bg-red-950 border-red-500/50 text-red-400'
                }`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    <span className="text-sm font-semibold">{toast.message}</span>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;