import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Clock, Music, ArrowLeft, Disc, ListMusic, Heart, Trash2, MoreHorizontal } from 'lucide-react';
import axiosClient from '../app/axios/axiosClient';
import MusicImage from "../layouts/components/MusicImage.jsx";
import { usePlayerStore } from "../features/player/usePlayerStore.js";
import TrackEngagementModal from "../layouts/components/TrackEngagementModal.jsx";

// import { useAuthStore } from "../features/auth/useAuthStore.js";

const AlbumDetailPage = () => {
    // 1. Lấy albumId từ URL Route (Ví dụ: /albums/32)
    const { albumId } = useParams();
    const navigate = useNavigate();
    const playTrack = usePlayerStore(state => state.playTrack);
    const S3_BASE_URL = "https://music4-v3-storage-kenz.s3.ap-southeast-1.amazonaws.com/";

    // 2. Lấy thông tin đăng nhập để phân quyền xóa bài (Xóa hardcode khi ráp AuthStore của bồ)
    // const { user, role } = useAuthStore();
    // const loggedInId = user?.id;
    const role = 'artist';      // Giả lập role phục vụ test UI
    const loggedInId = 22;      // Giả lập ID nghệ sĩ hiện tại (Ví dụ: 22 của Obito)

    // --- State quản lý dữ liệu ---
    const [tracks, setTracks] = useState([]);
    const [albumInfo, setAlbumInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [playingTrackId, setPlayingTrackId] = useState(null);
    const [selectedTrack, setSelectedTrack] = useState(null);

    // --- Quyền sở hữu album: Nghệ sĩ đăng nhập phải trùng với chủ Album ---
    const isOwner = role === 'artist' && Number(loggedInId) === Number(albumInfo?.artistId || tracks[0]?.artistId);

    // Tính tổng giây từ tất cả bài hát
    const totalDurationSeconds = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);

    // Chuyển đổi giây sang định dạng Phút:Giây hoặc Giờ:Phút:Giây
    const formatTotalDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours} giờ ${minutes} phút`;
        }
        return `${minutes} phút ${remainingSeconds} giây`;
    };

    // --- Hàm xử lý xóa bài hát khỏi Album ---
    const handleDeleteTrack = async (trackId, trackName) => {
        const isConfirm = window.confirm(`❗ Bạn có chắc chắn muốn xóa bài hát "${trackName}" không?\nHành động này sẽ xóa vĩnh viễn bài hát dưới Database và dọn sạch file trên AWS S3.`);
        if (!isConfirm) return;

        try {
            await axiosClient.delete(`/tracks/${trackId}`);
            alert("🎉 Đã xóa bài hát và dọn dẹp dữ liệu Cloud S3 thành công!");

            // Cập nhật State tại chỗ để danh sách bài hát cập nhật ngay trên giao diện
            setTracks(prevTracks => prevTracks.filter(track => track.id !== trackId));
        } catch (error) {
            console.error("Lỗi khi xóa bài hát:", error);
            alert(`❌ Xóa bài hát thất bại: ${error.response?.data?.message || "Vui lòng kiểm tra lại hệ thống!"}`);
        }
    };

    // --- Gọi API lấy danh sách bài hát thuộc Album khi vào trang ---
    useEffect(() => {
        const fetchAlbumTracks = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // ✅ ĐÃ SỬA: Phải truyền đúng albumId lấy từ URL để bốc đúng các bài hát của Album này!
                const response = await axiosClient.get(`/tracks/album/${albumId}`);
                const trackData = response.data || [];
                setTracks(trackData);

                // Bóc tách thông tin Album từ bài hát đầu tiên trả về
                if (trackData.length > 0) {
                    const mainArtist = trackData[0].artists.find(a => a.role === 'MAIN') || trackData[0].artists[0];
                    setAlbumInfo({
                        albumTitle: trackData[0].albumName || "Album Kỷ Nguyên Mới",
                        artistName: mainArtist?.name || "Nghệ Sĩ",
                        artistId: mainArtist?.artistId, // Giữ lại ID để so sánh với isOwner công bằng
                        coverUrl: S3_BASE_URL + trackData[0].img || ""
                    });
                }
            } catch (err) {
                console.error("Lỗi khi bốc bài hát của Album:", err);
                setError("Không thể tải danh sách bài hát. Bồ vui lòng kiểm tra lại API nha!");
            } finally {
                setIsLoading(false);
            }
        };

        if (albumId) {
            fetchAlbumTracks();
        }
    }, [albumId]);

    // --- Xử lý bấm nút Play/Pause trên giao diện ---
    const handlePlayTrack = (track) => {
        if (playingTrackId === track.id) {
            setPlayingTrackId(null);
        } else {
            setPlayingTrackId(track.id);
            playTrack(track); // Gọi xuống trình phát nhạc tổng của dự án
        }
    };

    if (isLoading) {
        return (
            <div className="bg-[#0a0f14] min-h-screen text-white flex flex-col items-center justify-center gap-3">
                <Disc className="animate-spin text-sky-400" size={40} />
                <p className="text-sm font-medium text-slate-400">Đang bốc danh sách bài hát thuộc Album...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#0a0f14] min-h-screen text-white flex flex-col items-center justify-center gap-4 p-4">
                <p className="text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl text-sm text-center max-w-md">{error}</p>
                <button onClick={() => navigate(-1)} className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-2 rounded-full text-sm flex items-center gap-2 transition-colors border-none cursor-pointer">
                    <ArrowLeft size={16} /> Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-[#07192c] via-[#0d131a] to-[#0a0f14] min-h-screen text-white font-sans">

            {/* Thanh điều hướng Header */}
            <div className="p-6 flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-black/30 hover:bg-black/50 p-2 rounded-full text-white transition-colors border-none cursor-pointer"
                >
                    <ArrowLeft size={20}/>
                </button>
            </div>

            {/* KHỐI THÔNG TIN CHUNG ALBUM (HERO BANNER) */}
            <div className="px-8 pb-6 flex flex-col md:flex-row items-end gap-6">
                <div className="w-48 md:w-60 aspect-square rounded-xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.6)] flex-shrink-0 bg-[#16222f]">
                    <img
                        src={albumInfo?.coverUrl}
                        alt={albumInfo?.title}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-sky-400/90">Album</span>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                        {albumInfo?.albumTitle || "Tên Album"}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                        <span className="text-white font-bold hover:underline cursor-pointer">
                            {albumInfo?.artistName || "Nghệ sĩ"}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{tracks.length} bài hát</span>

                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{formatTotalDuration(totalDurationSeconds)}</span>
                    </div>
                </div>
            </div>

            {/* KHỐI HÀNH ĐỘNG CHÍNH (PLAY ALL) */}
            <div className="bg-black/10 backdrop-blur-md px-8 py-6 flex items-center gap-5 border-t border-b border-white/[0.03]">
                <button
                    onClick={() => tracks.length > 0 && handlePlayTrack(tracks[0])}
                    className="w-14 h-14 bg-sky-500 hover:bg-sky-400 rounded-full flex items-center justify-center text-white shadow-[0_4px_18px_rgba(14,165,233,0.3)] hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
                >
                    <Play size={26} fill="white" className="ml-1"/>
                </button>
                <button className="text-slate-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer">
                    <Heart size={28}/>
                </button>
            </div>

            {/* BẢNG DANH SÁCH BÀI HÁT CHI TIẾT */}
            {/* BẢNG DANH SÁCH BÀI HÁT CHI TIẾT */}
            <section className="px-8 pb-24 mt-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-200">
                    <ListMusic size={20} className="text-sky-400" /> Danh sách bài hát thuộc Album
                </h2>

                {tracks.length > 0 ? (
                    <div className="bg-[#111a24]/30 border border-white/[0.04] p-4 rounded-xl space-y-1 backdrop-blur-sm">
                        {tracks.map((track, index) => (
                            <div
                                key={track.id || index}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.05] transition-colors group cursor-pointer"
                                onClick={() => handlePlayTrack(track)}
                            >
                                {/* Khối bên trái: Số thứ tự, Ảnh nhỏ, Tên bài hát */}
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <span className="text-slate-500 font-medium w-6 text-center group-hover:hidden">
                                        {index + 1}
                                    </span>
                                    <div className="hidden group-hover:flex text-sky-400 w-6 justify-center">
                                        {playingTrackId === track.id ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor"/>}
                                    </div>

                                    <div className="w-10 h-10 rounded overflow-hidden bg-[#16222f] flex-shrink-0 shadow-sm">
                                        <MusicImage
                                            src={track.img || track.albumCoverUrl || albumInfo?.coverUrl}
                                            type="track"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <p className={`font-semibold truncate transition-colors ${playingTrackId === track.id ? 'text-sky-400' : 'text-white group-hover:text-sky-400'}`}>
                                            {track.name || track.title}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate">
                                            {track.artists?.map(a => a.name).join(', ') || "Nghệ sĩ"}
                                        </p>
                                    </div>
                                </div>

                                {/* Khối bên phải: Lượt nghe, Thời lượng, Nút Xóa/More */}
                                <div className="flex items-center gap-6 ml-4">
                                    <span className="text-xs text-slate-400 hidden sm:block">
                                        {track.viewCount?.toLocaleString() || 0} lượt nghe
                                    </span>
                                    <span className="text-sm text-slate-400 hidden md:block font-mono">
                                        {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : "--:--"}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedTrack(track); }}
                                            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/[0.08] transition-colors bg-transparent border-none cursor-pointer"
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>
                                        {isOwner && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteTrack(track.id, track.name); }}
                                                className="text-slate-400 hover:text-red-400 p-2 rounded-full hover:bg-white/[0.08] transition-colors bg-transparent border-none cursor-pointer"
                                                title="Xóa bài hát khỏi Album"
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-[#111a24]/20 rounded-xl border border-white/[0.04] text-slate-400 text-sm">
                        <Music className="mx-auto mb-2 opacity-20" size={32} />
                        Album này hiện tại chưa có bài hát nào được đẩy vào bồ ơi.
                    </div>
                )}
            </section>
            {selectedTrack && (
                <TrackEngagementModal
                    track={selectedTrack}
                    onClose={() => setSelectedTrack(null)}
                />
            )}
        </div>
    );
};
export default AlbumDetailPage;