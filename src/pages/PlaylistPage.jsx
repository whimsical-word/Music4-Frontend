import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, Clock, Trash2, Camera, X, Music } from 'lucide-react';
import { usePlayerStore } from '../features/player/usePlayerStore';
import { usePlaylistStore } from '../features/playlist/usePlaylistStore';
import axiosClient from '../app/axios/axiosClient';
import MusicImage from '../layouts/components/MusicImage';

const PlaylistPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Quản lý trình phát nhạc tổng của dự án
    const playTrack = usePlayerStore(state => state.playTrack);
    const currentTrack = usePlayerStore(state => state.currentTrack);
    const isPlaying = usePlayerStore(state => state.isPlaying);

    // Quản lý store playlist
    const { updatePlaylist, uploadPlaylistImage, addTrackToPlaylist } = usePlaylistStore();

    const [playlistInfo, setPlaylistInfo] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [allTracks, setAllTracks] = useState([]); // State chứa toàn bộ bài hát hệ thống để chọn thêm
    const [isLoading, setIsLoading] = useState(true);

    // States quản lý đóng/mở và dữ liệu form chỉnh sửa thông tin Playlist
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editAvatar, setEditAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

    // Đổ dữ liệu hiện tại của playlist vào form khi mở modal
    useEffect(() => {
        if (playlistInfo) {
            setEditName(playlistInfo.name || '');
            setEditDescription(playlistInfo.description || '');
            setAvatarPreview(playlistInfo.img || '');
        }
    }, [playlistInfo, isEditModalOpen]);

    // Tải chi tiết dữ liệu Playlist và các bài hát từ Backend
    const fetchPlaylistDetails = async () => {
        setIsLoading(true);
        try {
            const [playlistRes, tracksRes] = await Promise.all([
                axiosClient.get(`/playlists/${id}`),
                axiosClient.get(`/playlists/${id}/tracks`)
            ]);

            const playlistData = playlistRes.data || playlistRes;
            const tracksData = tracksRes.data || tracksRes;

            setPlaylistInfo(playlistData);
            setTracks(tracksData || []);
        } catch (error) {
            console.error("Lỗi lấy chi tiết playlist:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Tải danh sách toàn bộ bài hát từ hệ thống để làm phần gợi ý thêm
    const fetchAllTracks = async () => {
        try {
            const res = await axiosClient.get('/tracks');
            const data = res.data || res;
            setAllTracks(Array.isArray(data) ? data : data.content || []);
        } catch (error) {
            console.error("Lỗi lấy danh sách bài hát hệ thống:", error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchPlaylistDetails();
            fetchAllTracks();
        }
    }, [id]);

    // Xử lý khi user chọn file ảnh mới từ máy tính
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // Xử lý submit lưu thông tin văn bản và ảnh tách biệt
    const handleSave = async (e) => {
        e.preventDefault();
        if (!editName.trim()) return alert("Tên playlist không được để trống!");

        try {
            const textResult = await updatePlaylist(id, {
                name: editName.trim(),
                description: editDescription.trim()
            });

            if (!textResult.success) {
                alert("❌ Cập nhật thông tin thất bại!");
                return;
            }

            if (editAvatar) {
                const imgResult = await uploadPlaylistImage(id, editAvatar);
                if (!imgResult.success) {
                    alert("⚠️ Lưu chữ thành công nhưng upload hình ảnh thất bại!");
                    fetchPlaylistDetails();
                    return;
                }
            }

            setIsEditModalOpen(false);
            alert("🎉 Cập nhật thông tin playlist thành công!");
            fetchPlaylistDetails();
        } catch (error) {
            console.error("Lỗi lưu thông tin:", error);
            alert("❌ Có lỗi xảy ra trong quá trình cập nhật!");
        }
    };

    // Xử lý thêm bài hát vào Playlist
    const handleAddTrack = async (track) => {
        const result = await addTrackToPlaylist(id, track.id);
        if (result.success) {
            alert(`🎉 Đã thêm bài hát "${track.name}" vào playlist!`);
            fetchPlaylistDetails();
        } else {
            alert(result.message || "Thêm bài hát thất bại.");
        }
    };

    // Xử lý xóa bài hát khỏi Playlist
    const handleRemoveTrack = async (e, trackId, trackName) => {
        e.stopPropagation();
        const isConfirm = window.confirm(`Bạn có chắc muốn xóa bài hát "${trackName}" ra khỏi playlist này?`);
        if (!isConfirm) return;

        try {
            await axiosClient.delete(`/playlists/${id}/tracks/${trackId}`);
            setTracks(prev => prev.filter(t => Number(t.id) !== Number(trackId)));
            alert("Đã loại bỏ bài hát khỏi playlist thành công!");
        } catch (error) {
            console.error("Lỗi khi xóa bài hát khỏi playlist:", error);
            alert("Xóa bài hát thất bại, vui lòng thử lại.");
        }
    };

    // Hàm bổ trợ giúp hiển thị tên nghệ sĩ thông minh, bao quét mọi kiểu dữ liệu từ Backend giống HomePage
    const renderArtistName = (track) => {
        console.log("=== CHECK TRACK DATA ===", track);
        if (track.artists && track.artists.length > 0) {
            return track.artists.map((artist, idx) => (
                <span key={artist.id || idx} className="inline-block max-w-full truncate">
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/artist/${artist.id}`);
                        }}
                        className="hover:text-sky-400 hover:underline cursor-pointer transition-colors text-slate-400 font-medium"
                    >
                        {artist.name}
                    </span>
                    {idx < track.artists.length - 1 && ", "}
                </span>
            ));
        }

        if (track.artist && track.artist.name) {
            return (
                <span
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/artist/${track.artist.id}`);
                    }}
                    className="hover:text-sky-400 hover:underline cursor-pointer transition-colors text-slate-400 font-medium"
                >
                    {track.artist.name}
                </span>
            );
        }

        if (track.artistName) {
            return <span className="text-slate-400 font-medium">{track.artistName}</span>;
        }

        return "Nghệ sĩ hệ thống";
    };

    if (isLoading) {
        return (
            <div className="bg-[#121212] min-h-screen flex items-center justify-center text-white">
                <div className="w-10 h-10 border-4 border-slate-700 border-t-sky-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!playlistInfo) {
        return (
            <div className="bg-[#121212] min-h-screen text-center text-slate-400 p-20">
                Không tìm thấy danh sách phát hoặc đã bị xóa.
            </div>
        );
    }

    return (
        <div className="bg-[#121212] min-h-screen text-white pb-32">
            {/* THANH ĐIỀU HƯỚNG QUAY LẠI */}
            <div className="p-4 flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                >
                    <ArrowLeft size={18} /> Quay lại
                </button>
            </div>

            {/* KHU VỰC BANNER TRÊN ĐẦU */}
            <div
                onClick={() => setIsEditModalOpen(true)}
                className="bg-gradient-to-b from-sky-900/40 to-[#121212] p-8 flex items-end gap-6 h-[280px] pt-0 cursor-pointer group select-none"
                title="Bấm để chỉnh sửa thông tin phát"
            >
                <div className="w-44 h-44 bg-[#282828] shadow-2xl flex items-center justify-center rounded-xl overflow-hidden border border-white/[0.05] relative flex-shrink-0">
                    {playlistInfo.img ? (
                        <MusicImage src={playlistInfo.img} type="track" className="w-full h-full object-cover" />
                    ) : tracks.length > 0 ? (
                        <MusicImage src={tracks[0].img} type="track" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-6xl">🎵</span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                        <Camera size={24} />
                        <span className="text-[10px] font-bold">Thay đổi ảnh</span>
                    </div>
                </div>

                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-sky-400">Playlist Cá Nhân</p>
                    <h1 className="text-4xl md:text-6xl font-black mt-2 mb-2 tracking-tight text-white group-hover:text-sky-400 transition-colors">
                        {playlistInfo.name}
                    </h1>
                    <p className="text-sm text-slate-400 font-medium line-clamp-2 max-w-2xl">
                        {playlistInfo.description || "Chưa có mô tả cho playlist này."}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 font-medium">{tracks.length} bài hát</p>
                </div>
            </div>

            {/* KHU VỰC ĐIỀU KHIỂN & BẢNG BÀI HÁT HIỆN TẠI */}
            <div className="p-8">
                {tracks.length > 0 && (
                    <button
                        onClick={() => playTrack(tracks[0])}
                        className="w-14 h-14 bg-sky-500 hover:bg-sky-400 rounded-full flex items-center justify-center hover:scale-105 transition-all cursor-pointer border-none shadow-lg mb-8"
                    >
                        <Play size={24} fill="white" className="text-white ml-1" />
                    </button>
                )}

                <div className="w-full text-[#a7a7a7] text-sm">
                    <div className="grid grid-cols-12 gap-4 pb-2 border-b border-white/[0.05] mb-4 px-4 font-semibold uppercase tracking-wider text-xs text-slate-400">
                        <div className="col-span-1">#</div>
                        <div className="col-span-7">Tiêu đề</div>
                        <div className="col-span-3 text-right"><Clock size={16} className="inline-block" /></div>
                        <div className="col-span-1 text-center">Hành động</div>
                    </div>

                    {tracks.length > 0 ? (
                        tracks.map((track, index) => {
                            const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
                            return (
                                <div
                                    key={track.id}
                                    onClick={() => playTrack(track)}
                                    className="grid grid-cols-12 gap-4 p-4 hover:bg-white/[0.05] rounded-xl transition-colors cursor-pointer group items-center"
                                >
                                    <div className="col-span-1 flex items-center font-medium text-slate-400">
                                        {isCurrentPlaying ? <span className="text-sky-400 animate-pulse">▶</span> : index + 1}
                                    </div>

                                    <div className="col-span-7 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded overflow-hidden bg-[#282828] flex-shrink-0">
                                            <MusicImage src={track.img} type="track" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="truncate">
                                            <p className={`font-semibold truncate ${isCurrentPlaying ? "text-sky-400" : "text-white"}`}>{track.name}</p>
                                            <p className="text-xs text-slate-400 truncate flex gap-1 items-center w-full">
                                                {/* 🟢 Đã fix: Đồng bộ render nghệ sĩ thông minh cho bảng trên */}
                                                {renderArtistName(track)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-span-3 text-right font-mono text-slate-400">
                                        {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, "0")}` : "0:00"}
                                    </div>

                                    <div className="col-span-1 text-center">
                                        <button
                                            onClick={(e) => handleRemoveTrack(e, track.id, track.name)}
                                            className="text-slate-500 hover:text-red-400 p-2 rounded-full hover:bg-white/[0.08] transition-colors cursor-pointer bg-transparent border-none"
                                            title="Xóa khỏi danh sách phát"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-16 text-slate-500 font-medium">
                            Danh sách phát này hiện chưa có bài hát nào.
                        </div>
                    )}
                </div>
            </div>

            {/* 🟢 KHU VỰC GỢI Ý THÊM BÀI HÁT MỚI */}
            <div className="p-8 border-t border-white/[0.05] mt-12 max-w-5xl mx-auto">
                <h2 className="text-xl font-bold text-white mb-1">Hãy cùng thêm nội dung cho danh sách phát của bạn</h2>
                <p className="text-xs text-slate-400 mb-6">Đề xuất các bài hát hiện có trên hệ thống</p>

                <div className="flex flex-col gap-2">
                    {allTracks
                        .filter(track => !tracks.some(t => Number(t.id) === Number(track.id)))
                        .slice(0, 5)
                        .map((track) => (
                            <div
                                key={track.id}
                                className="flex items-center justify-between p-3 hover:bg-white/[0.05] rounded-xl transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded bg-[#282828] overflow-hidden flex-shrink-0">
                                        <MusicImage src={track.img} type="track" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-white">{track.name}</p>
                                        <p className="text-xs text-slate-400 truncate flex gap-1 items-center w-full">
                                            {/* 🟢 Đã fix: Sử dụng chung hàm render nghệ sĩ thông minh cho danh sách dưới */}
                                            {renderArtistName(track)}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleAddTrack(track)}
                                    className="px-4 py-1.5 border border-slate-500 hover:border-white text-white rounded-full text-xs font-bold bg-transparent transition-all cursor-pointer"
                                >
                                    Thêm
                                </button>
                            </div>
                        ))}

                    {allTracks.filter(track => !tracks.some(t => Number(t.id) === Number(track.id))).length === 0 && (
                        <p className="text-xs text-slate-500 italic py-4">Hiện tại không còn bài hát nào mới trên hệ thống để thêm.</p>
                    )}
                </div>
            </div>

            {/* MODAL POPUP CHỈNH SỬA THÔNG TIN CHI TIẾT */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#182232] border border-white/[0.08] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between p-5 border-b border-white/[0.05]">
                            <h2 className="text-base font-bold text-white">Chỉnh sửa chi tiết cấu hình</h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition-all bg-transparent border-none cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 flex gap-6">
                            <div className="flex flex-col items-center gap-2">
                                <label className="w-36 h-36 bg-[#243042] hover:bg-[#2c3b52] rounded-xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group shadow-md border border-white/[0.05]">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Music size={36} className="text-slate-500" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1 text-white text-[10px] font-bold">
                                        <Camera size={16} />
                                        <span>Chọn file</span>
                                    </div>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </label>
                                <span className="text-[10px] text-slate-500 italic">Định dạng JPG, PNG</span>
                            </div>

                            <div className="flex-1 flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-400">Tên danh sách phát</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Nhập tên mới..."
                                        className="w-full bg-[#243042] border border-white/[0.05] focus:border-sky-500 text-white rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-400">Mô tả tóm tắt</label>
                                    <textarea
                                        rows="3"
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        placeholder="Mô tả danh sách này giúp bạn..."
                                        className="w-full bg-[#243042] border border-white/[0.05] focus:border-sky-500 text-white rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </form>

                        <div className="flex justify-end gap-2.5 p-4 bg-[#121a26] border-t border-white/[0.05]">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-transparent text-slate-400 hover:text-white transition-all cursor-pointer border-none">Hủy bộ</button>
                            <button type="button" onClick={handleSave} className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white shadow-lg transition-all cursor-pointer border-none">Lưu thay đổi</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaylistPage;