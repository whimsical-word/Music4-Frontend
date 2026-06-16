import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; // 🟢 Đảm bảo đã có useNavigate
import { Users, Mic2, LayoutGrid, Trash2, Edit, Eye, Plus } from 'lucide-react';
import axiosClient from '../app/axios/axiosClient';
import MusicImage from '../layouts/components/MusicImage';
import {AppPagination} from "../layouts/components/AppPagination.jsx";

const AdminDashboardPage = () => {
    const navigate = useNavigate(); // 🟢 Khởi tạo hàm điều hướng
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    const currentArtistPage = parseInt(searchParams.get('page')) || 0;
    const [users, setUsers] = useState([]);
    const [artists, setArtists] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [artistTotalPages, setArtistTotalPages] = useState(0);

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Gửi params phân trang khi gọi API nghệ sĩ
            const [usersRes, artistsRes, categoriesRes] = await Promise.allSettled([
                axiosClient.get('/users'),
                axiosClient.get('/artists', {
                    params: {
                        page: currentArtistPage,
                        size: 5
                    }
                }),
                axiosClient.get('/categories')
            ]);

            if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data || []);

            if (artistsRes.status === 'fulfilled') {
                // Kiểm tra xem dữ liệu BE trả về là đối tượng Page (có .content) hay mảng thuần
                const artistData = artistsRes.value.data;
                if (artistData && artistData.content) {
                    setArtists(artistData.content);
                    setArtistTotalPages(artistData.totalPages || 0);
                } else {
                    // Phương án dự phòng nếu BE chưa cập nhật phân trang (trả về mảng)
                    setArtists(artistData || []);
                    setArtistTotalPages(0);
                }
            }

            if (categoriesRes.status === 'fulfilled') setCategories(categoriesRes.value.data || []);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu tổng hợp admin:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleSaveCategory = async () => {
        if (!categoryName.trim()) return;
        try {
            if (editingCategory) {
                await axiosClient.put(`/categories/${editingCategory.id}`, { name: categoryName });
            } else {
                await axiosClient.post('/categories', { name: categoryName });
            }
            setCategoryName('');
            setEditingCategory(null);
            setShowCategoryModal(false);
            fetchData();
        } catch (error) {
            console.error("Lỗi lưu thể loại:", error);
        }
    };
    const handleArtistPageChange = (newPage) => {
        setSearchParams({ tab: 'artists', page: newPage });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleDeleteCategory = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa thể loại này?")) {
            try {
                await axiosClient.delete(`/categories/${id}`);
                fetchData();
            } catch (error) {
                console.error("Lỗi xóa thể loại:", error);
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
                                <h2 className="text-2xl font-bold text-white mb-6">Hệ Thống Tổng Quan</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-[#181818] p-6 rounded-xl border border-[#282828] flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><Users size={24}/></div>
                                        <div>
                                            <p className="text-sm text-[#a7a7a7] font-medium">Người Nghe</p>
                                            <h3 className="text-2xl font-bold text-white mt-1">{users.length}</h3>
                                        </div>
                                    </div>
                                    <div className="bg-[#181818] p-6 rounded-xl border border-[#282828] flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Mic2 size={24}/></div>
                                        <div>
                                            <p className="text-sm text-[#a7a7a7] font-medium">Nghệ Sĩ</p>
                                            <h3 className="text-2xl font-bold text-white mt-1">{artists.length}</h3>
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
                            </div>
                        )}

                        {/* TAB 2: QUẢN LÝ USER */}
                        {activeTab === 'users' && (
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-6">Quản Lý Người Dùng ({users.length})</h2>
                                <div className="bg-[#181818] rounded-xl border border-[#282828] overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                        <tr className="border-b border-[#282828] bg-[#222222] text-[#a7a7a7] text-xs uppercase tracking-wider font-semibold">
                                            <th className="p-4">Thành viên</th>
                                            <th className="p-4">ID Tài khoản</th>
                                            <th className="p-4 text-right">Hành động</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#282828] text-sm">
                                        {users.map(u => (
                                            <tr key={u.id} className="hover:bg-[#222222]/50 transition-colors">
                                                <td className="p-4 flex items-center gap-3 font-medium text-white">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#282828]"><MusicImage src={u.img} type="artist"/></div>
                                                    <span>{u.username}</span>
                                                </td>
                                                <td className="p-4 text-gray-400 font-mono">USR-{u.id}</td>
                                                <td className="p-4 text-right">
                                                    {/* 🟢 Sửa nút Eye để link qua trang cá nhân của Listener (theo file ProfilePage.jsx của bạn) */}
                                                    <button
                                                        onClick={() => navigate('/profile')}
                                                        className="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                                                        title="Xem hồ sơ người nghe"
                                                    >
                                                        <Eye size={18}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: QUẢN LÝ NGHỆ SĨ */}
                        {activeTab === 'artists' && (
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-6">Quản Lý Nghệ Sĩ ({artists.length})</h2>
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
                                                    {/* 🟢 Sửa nút Eye để link qua trang chi tiết của Artist (Khớp 100% với route /artist/:id trong App.jsx) */}
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

                        {/* TAB 4: QUẢN LÝ THỂ LOẠI */}
                        {activeTab === 'categories' && (
                            <div>
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
        </div>
    );
};

export default AdminDashboardPage;