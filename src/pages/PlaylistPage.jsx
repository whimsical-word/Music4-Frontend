import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, Music, X } from 'lucide-react';
import { usePlaylistStore } from '../features/playlist/usePlaylistStore';

const PlaylistDetail = () => {
    const { id } = useParams();
    const { playlists, updatePlaylist } = usePlaylistStore();

    // Tìm playlist hiện tại trong store
    const playlist = playlists.find(p => p.id === parseInt(id)) || null;

    // State quản lý đóng/mở Modal chỉnh sửa
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // State form chỉnh sửa
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editAvatar, setEditAvatar] = useState(null); // File upload
    const [avatarPreview, setAvatarPreview] = useState(''); // Link ảnh tạm để hiển thị trước

    // Cập nhật giá trị ban đầu cho form khi mở modal
    useEffect(() => {
        if (playlist) {
            setEditName(playlist.name || '');
            setEditDescription(playlist.description || '');
            setAvatarPreview(playlist.coverUrl || ''); // Giả sử store có coverUrl
        }
    }, [playlist, isEditModalOpen]);

    if (!playlist) {
        return <div className="p-6 text-slate-400">Không tìm thấy playlist.</div>;
    }

    // Xử lý chọn file ảnh mới
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditAvatar(file);
            setAvatarPreview(URL.createObjectURL(file)); // Tạo link tạm xem trước ảnh
        }
    };

    // Xử lý Submit lưu thông tin thay đổi
    const handleSave = async (e) => {
        e.preventDefault();
        if (!editName.trim()) return alert("Tên playlist không được để trống!");

        // Tạo FormData để hỗ trợ upload file nếu backend yêu cầu multipart/form-data
        const formData = new FormData();
        formData.append('name', editName.trim());
        formData.append('description', editDescription.trim());
        if (editAvatar) {
            formData.append('coverFile', editAvatar); // Hoặc đổi tên key tương ứng với API backend
        }

        // Gọi action cập nhật từ store
        // Nếu API chỉ nhận JSON thường thì bồ truyền object, ở đây mình truyền formData cho đa dụng với upload ảnh
        const result = await updatePlaylist(playlist.id, formData);

        if (result.success) {
            setIsEditModalOpen(false);
            alert("🎉 Cập nhật thông tin playlist thành công!");
        } else {
            alert("❌ Cập nhật thất bại. Vui lòng thử lại!");
        }
    };

    return (
        <div className="p-8 text-white min-h-screen bg-gradient-to-b from-[#131d2a] to-[#0d131a]">

            {/* HEADER PLAYLIST - Click vào vùng này để mở chỉnh sửa */}
            <div
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-end gap-6 mb-8 cursor-pointer group select-none"
            >
                {/* Khu vực hiển thị AVATAR / COVER ART */}
                <div className="w-48 h-48 bg-[#1f2937] rounded-xl flex items-center justify-center shadow-2xl relative overflow-hidden flex-shrink-0">
                    {avatarPreview ? (
                        <img src={avatarPreview} alt={playlist.name} className="w-full h-full object-cover" />
                    ) : (
                        <Music size={64} className="text-slate-500" />
                    )}
                    {/* Lớp phủ Hover hiện icon Camera */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <Camera size={28} />
                        <span className="text-xs font-semibold">Thay đổi ảnh</span>
                    </div>
                </div>

                {/* THÔNG TIN CHỮ */}
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Playlist cá nhân</span>
                    <h1 className="text-5xl font-black tracking-tight group-hover:text-sky-400 transition-colors">
                        {playlist.name}
                    </h1>
                    <p className="text-sm text-slate-400 font-medium line-clamp-2 max-w-2xl">
                        {playlist.description || "Chưa có mô tả cho playlist này."}
                    </p>
                    <span className="text-xs text-slate-500 font-medium">0 bài hát</span>
                </div>
            </div>

            {/* TAB DANH SÁCH BÀI HÁT BÊN DƯỚI */}
            <div className="border-t border-white/[0.05] pt-6">
                <div className="flex items-center text-xs text-slate-500 font-bold uppercase tracking-wider mb-4 px-4">
                    <span className="w-10">#</span>
                    <span className="flex-1">Tiêu đề</span>
                    <span className="w-24 text-right">Hành động</span>
                </div>
                <div className="text-center py-12 text-sm text-slate-500 italic">
                    Danh sách phát này hiện chưa có bài hát nào.
                </div>
            </div>

            {/* ========================================================= */}
            {/* 🟢 MODAL CHỈNH SỬA THÔNG TIN PLAYLIST (SPOTIFY STYLE) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#182232] border border-white/[0.08] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                        {/* Header Modal */}
                        <div className="flex items-center justify-between p-5 border-b border-white/[0.05]">
                            <h2 className="text-lg font-bold">Chỉnh sửa thông tin chi tiết</h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition-all bg-transparent border-none cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSave} className="p-6 flex gap-6">

                            {/* Cột trái: Upload Avatar */}
                            <div className="flex flex-col items-center gap-3">
                                <label className="w-36 h-36 bg-[#243042] hover:bg-[#2c3b52] rounded-xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group shadow-md border border-white/[0.05]">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Music size={40} className="text-slate-500" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1 text-white text-[10px] font-medium">
                                        <Camera size={18} />
                                        <span>Chọn ảnh</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                                <span className="text-[10px] text-slate-500 italic">Hỗ trợ JPG, PNG</span>
                            </div>

                            {/* Cột phải: Nhập Tên & Mô tả */}
                            <div className="flex-1 flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-400">Tên playlist</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Nhập tên danh sách phát..."
                                        className="w-full bg-[#243042] border border-white/[0.05] focus:border-sky-500 text-white rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-400">Mô tả</label>
                                    <textarea
                                        rows="4"
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        placeholder="Thêm mô tả tùy chọn..."
                                        className="w-full bg-[#243042] border border-white/[0.05] focus:border-sky-500 text-white rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </form>

                        {/* Footer Modal */}
                        <div className="flex justify-end gap-3 p-4 bg-[#121a26] border-t border-white/[0.05]">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold bg-transparent text-slate-400 hover:text-white transition-all cursor-pointer border-none"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer border-none"
                            >
                                Lưu thay đổi
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default PlaylistDetail;