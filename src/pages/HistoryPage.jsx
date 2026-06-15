import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../app/axios/axiosClient';
import { useAuthStore } from '../features/auth/useAuthStore';
import { usePlayerStore } from '../features/player/usePlayerStore';
import MusicImage from '../layouts/components/MusicImage'; // Sử dụng component ảnh linh hoạt

const HistoryPage = () => {
    const navigate = useNavigate();
    const { id: userId } = useAuthStore();
    const playTrack = usePlayerStore(state => state.playTrack);

    const [historyTracks, setHistoryTracks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!userId) return;
            try {
                // Gọi API lấy lịch sử nghe nhạc của User
                const res = await axiosClient.get(`/tracking/history/${userId}`);
                setHistoryTracks(res.data || []);
            } catch (error) {
                console.error("Lỗi tải lịch sử nghe nhạc:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [userId]);

    return (
        <div className="bg-[#121212] min-h-screen text-white p-8 pb-32">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-[#a7a7a7] hover:text-white mb-8 bg-transparent border-none cursor-pointer"
            >
                <ArrowLeft size={20} /> Quay lại
            </button>

            <h1 className="text-4xl font-black mb-8 tracking-tight">Lịch sử nghe nhạc</h1>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-[#282828] border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : historyTracks.length > 0 ? (
                <div className="w-full text-[#a7a7a7] text-sm">
                    {historyTracks.map((track, index) => (
                        <div
                            key={`${track.id}-${index}`} // Đề phòng user nghe 1 bài nhiều lần
                            onClick={() => playTrack(track, historyTracks)} // Play nhạc và đưa cả mảng lịch sử vào hàng đợi
                            className="flex items-center gap-4 p-3 hover:bg-[#282828] rounded-xl transition-colors cursor-pointer group"
                        >
                            <div className="w-12 h-12 relative flex-shrink-0 rounded-md overflow-hidden bg-[#282828]">
                                <MusicImage src={track.img} type="track" className="w-full h-full" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Play size={16} fill="currentColor" className="text-white ml-0.5" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-white truncate group-hover:text-blue-400 transition-colors">{track.name}</h4>
                                {/* History đang dùng TrackResponseDTO (không có artists), nên tạm để hiển thị Artist hệ thống */}
                                <p className="text-xs truncate">Nghệ sĩ hệ thống</p>
                            </div>
                            <div className="text-right">
                                <span className="bg-[#282828] px-2.5 py-1 rounded-full text-xs border border-[#3e3e3e]">
                                    {track.viewCount || 0} views
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[#181818] rounded-xl p-8 border border-dashed border-[#3e3e3e] text-center">
                    <p className="text-[#a7a7a7]">Bạn chưa nghe bài hát nào gần đây.</p>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;