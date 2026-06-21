import React, { useEffect } from 'react';
import { useFavoriteStore } from '../features/favorite/useFavoriteStore'; // Điều chỉnh lại đường dẫn tới file useFavoriteStore.js của bạn
import { Heart, Play } from 'lucide-react';

const LikedSongsPage = () => {
    const { likedTracks, fetchLikedTracks, isLoading } = useFavoriteStore();

    // Tự động gọi API lấy đúng bài hát của User đang đăng nhập khi vừa vào trang
    useEffect(() => {
        fetchLikedTracks();
    }, [fetchLikedTracks]);

    if (isLoading) return <div className="text-white p-6 text-sm bg-[#121212] min-h-screen">Đang tải dữ liệu...</div>;

    return (
        <div className="p-6 text-white bg-gradient-to-b from-red-900/20 to-[#121212] min-h-screen font-sans">
            {/* Banner Header giống Spotify */}
            <div className="flex items-end gap-6 mb-8 mt-4">
                <div className="w-36 h-36 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-2xl">
                    <Heart size={64} fill="white" className="text-white" />
                </div>
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Playlist</span>
                    <h1 className="text-4xl font-black mt-1 mb-2">Bài hát đã thích</h1>
                    <p className="text-xs text-gray-400 font-medium">{likedTracks.length} bài hát của bạn</p>
                </div>
            </div>

            {/* Danh sách bài hát */}
            <div className="space-y-1">
                {likedTracks.length > 0 ? (
                    likedTracks.map((fav, index) => (
                        <div
                            key={fav.favoriteId || fav.trackId}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-gray-400 w-5 text-center text-sm group-hover:hidden">{index + 1}</span>
                                <button className="text-white w-5 hidden group-hover:block border-none bg-transparent cursor-pointer">
                                    <Play size={14} fill="white"/>
                                </button>

                                <img src={fav.img || "https://via.placeholder.com/40"} alt={fav.trackName} className="w-10 h-10 object-cover rounded-md shadow" />

                                <div>
                                    <h4 className="font-bold text-sm text-gray-200 group-hover:text-white transition-colors">{fav.trackName}</h4>
                                    <p className="text-xs text-gray-400 mt-0.5">Bài hát hệ thống</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 text-xs text-gray-500 border border-dashed border-[#282828] rounded-2xl">
                        Danh sách trống. Hãy thả tim bài hát bạn yêu thích!
                    </div>
                )}
            </div>
        </div>
    );
};

export default LikedSongsPage;