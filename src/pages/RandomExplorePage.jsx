import React, {useState, useEffect} from 'react';
import {Play, RefreshCw} from 'lucide-react';
import axiosClient from '../app/axios/axiosClient';
import MusicImage from '../layouts/components/MusicImage';
import {usePlayerStore} from '../features/player/usePlayerStore';

const RandomExplorePage = () => {
    const playTrack = usePlayerStore((state) => state.playTrack);
    const [tracks, setTracks] = useState([]);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // 1. Lấy seed từ sessionStorage, nếu chưa có thì random một số từ 1 đến 10000
    const [seed, setSeed] = useState(() => {
        const savedSeed = sessionStorage.getItem('track_random_seed');
        if (savedSeed) return parseInt(savedSeed, 10);

        const newSeed = Math.floor(Math.random() * 10000) + 1;
        sessionStorage.setItem('track_random_seed', newSeed);
        return newSeed;
    });

    // 2. Fetch dữ liệu mỗi khi biến `page` hoặc `seed` thay đổi
    useEffect(() => {
        const fetchRandomTracks = async () => {
            if (!seed) return;
            setIsLoading(true);
            try {
                // Truyền seed xuống Backend thông qua axiosClient
                const res = await axiosClient.get('/tracks/random', {
                    params: {seed: seed, page: page, size: 12}
                });

                // Nối tiếp dữ liệu cũ và mới (Load more / Infinite Scroll)
                setTracks(prev => [...prev, ...(res.data.content || [])]);
            } catch (error) {
                console.error("Lỗi khi lấy nhạc random:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRandomTracks();
    }, [page, seed]);

    // 3. Hàm tải thêm trang tiếp theo (Load More)
    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    };

    // 4. Hàm làm mới hoàn toàn danh sách (Tạo Seed mới)
    const handleShuffleAgain = () => {
        const newSeed = Math.floor(Math.random() * 10000) + 1;
        sessionStorage.setItem('track_random_seed', newSeed);
        setSeed(newSeed);
        setPage(0);      // Reset page về 0
        setTracks([]);   // Reset mảng tracks về rỗng
    };

    return (
        <div className="p-8 pb-32 bg-[#0d131a] min-h-screen font-sans text-slate-100">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black tracking-tight text-white">Khám phá ngẫu nhiên</h2>
                <button
                    onClick={handleShuffleAgain}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] hover:bg-[#282828] text-sky-400 rounded-full transition-colors cursor-pointer border border-sky-500/30"
                >
                    <RefreshCw size={16} className={isLoading ? "animate-spin" : ""}/>
                    <span>Làm mới danh sách</span>
                </button>
            </div>

            {/* Render Danh Sách Tracks */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {tracks.map((track) => (
                    <div key={track.id}
                         className="bg-[#0f1722] p-4 rounded-xl hover:bg-white/[0.04] transition-all group cursor-pointer border border-transparent hover:border-white/[0.1]">
                        <div className="relative aspect-square w-full mb-4 rounded-md overflow-hidden bg-[#282828]">
                            <MusicImage src={track.img} type="track"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                            <div
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                {/* Tích hợp logic playTrack như HomePage */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        playTrack(track, tracks);
                                    }}
                                    className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white border-none cursor-pointer"
                                >
                                    <Play size={20} fill="currentColor" className="ml-0.5"/>
                                </button>
                            </div>
                        </div>
                        <h4 className="font-bold text-white truncate text-sm mb-1">{track.name}</h4>
                        <p className="text-xs text-slate-400 truncate">
                            {track.artists?.map(a => a.name).join(', ') || "Nghệ sĩ"}
                        </p>
                    </div>
                ))}
            </div>

            {/* Nút Load More thay cho Phân trang truyền thống */}
            <div className="mt-10 flex justify-center">
                <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="px-8 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-full font-bold transition-colors disabled:opacity-50 border border-white/[0.1]"
                >
                    {isLoading ? 'Đang tải...' : 'Tải thêm bài hát'}
                </button>
            </div>
        </div>
    );
};

export default RandomExplorePage;