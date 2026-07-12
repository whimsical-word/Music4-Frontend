import React, { useEffect } from 'react';
import { useFavoriteStore } from '../features/favorite/useFavoriteStore';
import { usePlayerStore } from '../features/player/usePlayerStore'; // 🟢 Kết nối với Store phát nhạc giống HomePage
import { Heart, Play } from 'lucide-react';

const LikedSongsPage = () => {
    const { likedTracks, fetchLikedTracks, isLoading } = useFavoriteStore();
    const playTrack = usePlayerStore((state) => state.playTrack); // 🟢 Lấy hàm playTrack ra sử dụng

    // Tự động gọi API lấy đúng bài hát của User đang đăng nhập khi vừa vào trang
    useEffect(() => {
        fetchLikedTracks();
    }, [fetchLikedTracks]);

    if (isLoading) {
        return (
            <div className="p-6 bg-[#0d131a] min-h-screen flex items-center justify-center font-sans text-white">
                <div className="w-10 h-10 border-4 border-white/[0.05] border-t-sky-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    // 🟢 HÀM CHUẨN HÓA: Ép dữ liệu từ danh sách yêu thích về cấu trúc { id, name, img, artists } chuẩn như HomePage trước khi phát
    const handlePlayLikedTrack = (currentTrack) => {
        // Chuẩn hóa toàn bộ danh sách bài hát yêu thích để làm danh sách phát (Queue)
        const normalizedPlaylist = likedTracks.map(track => ({
            ...track,
            id: track.id || track.trackId,
            name: track.name || track.trackName,
            img: track.img || track.imageUrl || track.trackImg,
            artists: track.artists || []
        }));

        // Chuẩn hóa riêng bài hát được click trúng
        const normalizedCurrentTrack = {
            ...currentTrack,
            id: currentTrack.id || currentTrack.trackId,
            name: currentTrack.name || currentTrack.trackName,
            img: currentTrack.img || currentTrack.imageUrl || currentTrack.trackImg,
            artists: currentTrack.artists || []
        };

        // Kích hoạt trình phát nhạc
        playTrack(normalizedCurrentTrack, normalizedPlaylist);
    };

    return (
        <div className="p-6 pb-32 font-sans text-slate-100 bg-[#0d131a] min-h-screen selection:bg-sky-600 selection:text-white">
            {/* Banner Header giống Spotify */}
            <div className="mb-10 p-8 rounded-xl bg-gradient-to-r from-red-950/40 to-[#131e2e] border border-white/[0.05] shadow-md flex items-end gap-6 relative overflow-hidden">
                <div className="w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-2xl flex-shrink-0 z-10">
                    <Heart size={54} fill="white" className="text-white" />
                </div>
                <div className="relative z-10">
                    <span className="text-xs font-bold uppercase tracking-widest text-red-400">Playlist</span>
                    <h1 className="text-3xl md:text-5xl font-black mt-1 mb-2 text-white tracking-tight">Bài hát đã thích</h1>
                    <p className="text-xs text-slate-400 font-medium">{likedTracks.length} bài hát của bạn</p>
                </div>
            </div>

            {/* Danh sách bài hát */}
            <div className="bg-[#0f1722] border border-white/[0.05] p-6 rounded-2xl shadow-2xl space-y-1">
                {likedTracks.length > 0 ? (
                    likedTracks.map((fav, index) => {
                        // Xác định các trường dữ liệu linh hoạt (phòng trường hợp backend trả về lệch key)
                        const trackName = fav.name || fav.trackName;
                        const trackImg = fav.img || fav.imageUrl || fav.trackImg;
                        const trackId = fav.id || fav.trackId;

                        return (
                            <div
                                key={trackId}
                                onClick={() => handlePlayLikedTrack(fav)} // 🟢 Gọi hàm phát nhạc đã được lọc cấu trúc chuẩn
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer"
                            >
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    {/* Số thứ tự hoặc nút Play khi hover */}
                                    <span className="text-slate-500 w-5 text-center text-sm font-medium font-mono group-hover:hidden">
                                        {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                    </span>
                                    <button className="text-sky-400 w-5 hidden group-hover:flex border-none bg-transparent cursor-pointer justify-center items-center">
                                        <Play size={14} fill="currentColor"/>
                                    </button>

                                    {/* Ảnh bài hát */}
                                    <img
                                        src={trackImg || "https://via.placeholder.com/40"}
                                        alt={trackName}
                                        className="w-11 h-11 object-cover rounded-md shadow-md flex-shrink-0"
                                    />

                                    {/* Thông tin bài viết */}
                                    <div className="min-w-0 flex-1 px-1">
                                        <h4 className="font-bold text-sm text-slate-200 group-hover:text-sky-400 transition-colors truncate">
                                            {trackName}
                                        </h4>
                                        <p className="text-xs text-slate-400 mt-1 truncate">
                                            {fav.artists && fav.artists.length > 0
                                                ? fav.artists.map(a => a.name).join(", ")
                                                : "Bài hát hệ thống"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-16 text-sm text-slate-500 border border-dashed border-white/[0.05] rounded-xl">
                        Danh sách trống. Hãy thả tim bài hát bạn yêu thích tại Trang Chủ!
                    </div>
                )}
            </div>
        </div>
    );
};

export default LikedSongsPage;