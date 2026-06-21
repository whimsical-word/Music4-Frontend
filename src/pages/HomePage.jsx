import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, User as UserIcon, Heart, MessageSquare, Star, MoreHorizontal } from 'lucide-react';
import axiosClient from '../app/axios/axiosClient';
import { useAuthStore } from '../features/auth/useAuthStore';
import { usePlayerStore } from '../features/player/usePlayerStore';
import MusicImage from '../layouts/components/MusicImage';
import TrackEngagementModal from '../layouts/components/TrackEngagementModal';

// =====================================================================
// COMPONENT PHỤ: BĂNG CHUYỀN TỰ ĐỘNG TRƯỢT (AUTO-SCROLL CAROUSEL)
// =====================================================================
const AutoScrollCarousel = ({ title, items, renderItem, onViewAll }) => {
    const scrollRef = useRef(null);
    useEffect(() => {
        if (!items || items.length === 0) return;

        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
                }
            }
        }, 3500);

        return () => clearInterval(interval);
    }, [items]);

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    {title}
                </h3>
                <button
                    onClick={onViewAll}
                    className="text-xs font-bold text-[#a7a7a7] hover:text-white uppercase tracking-widest bg-transparent border-none cursor-pointer transition-colors"
                >
                    Xem tất cả
                </button>
            </div>

            <div className="relative group">
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth snap-x pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                    {items && items.length > 0 ? items.map(renderItem) : (
                        <div className="w-full text-center text-sm text-gray-500 py-8 border border-dashed border-[#282828] rounded-xl bg-[#181818]">
                            Chưa có dữ liệu hệ thống.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

// =====================================================================
// COMPONENT CHÍNH: TRANG CHỦ (CHUẨN PLAYLIST & CHARTS UI SPOTIFY)
// =====================================================================
const HomePage = () => {
    const navigate = useNavigate();
    const { username } = useAuthStore();
    const playTrack = usePlayerStore((state) => state.playTrack);

    const [tracks, setTracks] = useState([]);
    const [artists, setArtists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [albums, setAlbums] = useState([]);
    const [top5Tracks, setTop5Tracks] = useState([]);

    // State điều khiển đóng/mở Pop-up tương tác tổng hợp (Bình luận, rating, và yêu thích)
    const [selectedTrack, setSelectedTrack] = useState(null);

    useEffect(() => {
        const fetchHomeData = async () => {
            setIsLoading(true);
            try {
                const [tracksRes, artistsRes, albumRes, top5TrackRes] = await Promise.all([
                    axiosClient.get('/tracks'),
                    axiosClient.get('/artists'),
                    axiosClient.get('/albums'),
                    axiosClient.get('tracks/top5-views')
                ]);

                setTracks(tracksRes.data || []);
                setArtists(artistsRes.data || []);
                setAlbums(albumRes.data || []);
                setTop5Tracks(top5TrackRes.data || []);
            } catch (error) {
                console.error("Lỗi lấy dữ liệu trang chủ: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    if (isLoading) {
        return (
            <div className="p-6 bg-[#121212] min-h-screen flex items-center justify-center font-sans">
                <div className="w-10 h-10 border-4 border-[#282828] border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    const cleanArtists = Array.isArray(artists) ? artists : (artists?.content || []);

    return (
        <div className="p-6 pb-32 font-sans text-gray-100 bg-[#121212] min-h-screen selection:bg-blue-600 selection:text-white">

            {/* BANNER CHÀO MỪNG */}
            <div className="mb-10 p-8 rounded-xl bg-[#181818] border border-[#282828] shadow-md relative overflow-hidden">
                <h2 className="text-4xl font-extrabold mb-2 text-white relative z-10 tracking-tight">
                    Chào buổi chiều, <span className="text-blue-500">{username || 'Listener'}</span>
                </h2>
                <p className="text-[#a7a7a7] relative z-10 text-sm">
                    Hệ thống gợi ý đã sẵn sàng. Khám phá những giai điệu dành riêng cho bạn hôm nay.
                </p>
            </div>

            <div className="space-y-12 animate-fadeIn">

                {/* 1. BĂNG CHUYỀN BÀI HÁT (TRACKS CAROUSEL) */}
                <AutoScrollCarousel
                    title="Khám phá Bài Hát"
                    items={tracks}
                    onViewAll={() => navigate('/tracks')}
                    renderItem={(track) => (
                        <div
                            key={track.id}
                            onClick={() => playTrack(track, tracks)}
                            className="min-w-[160px] md:min-w-[200px] flex-shrink-0 snap-start bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all duration-300 group cursor-pointer border border-transparent hover:border-[#3e3e3e] relative"
                        >
                            <div className="relative w-full h-[150px] md:h-[168px] mb-4 rounded-md overflow-hidden bg-[#282828] shadow-md flex-shrink-0">
                                <MusicImage src={track.img} type="track" alt={track.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                                {/* Nút phát nhạc nhảy lên bên dưới góc phải ảnh */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-end justify-end p-3 transition-opacity duration-300">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playTrack(track, tracks);
                                        }}
                                        className="w-11 h-11 bg-blue-600 hover:bg-blue-500 hover:scale-105 rounded-full flex items-center justify-center text-black shadow-xl transition-all border-none cursor-pointer transform translate-y-2 group-hover:translate-y-0"
                                    >
                                        <Play size={20} fill="currentColor" className="ml-0.5 text-black" />
                                    </button>
                                </div>
                            </div>

                            {/* Khối Metadata chứa tên bài hát & Nút bấm xem bình luận / rating ẩn hiện */}
                            <div className="relative pr-6 group/title">
                                <h4 className="font-bold text-white truncate text-sm mb-1 max-w-[85%] group-hover:text-blue-400 transition-colors">
                                    {track.name}
                                </h4>

                                {/* Nút Ba chấm chuẩn Spotify mở toản bộ hộp thoại đánh giá & bình luận */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Không kích hoạt phát nhạc ngoài ý muốn
                                        setSelectedTrack(track);
                                    }}
                                    className="absolute right-0 top-0.5 opacity-0 group-hover:opacity-100 text-[#b3b3b3] hover:text-white bg-transparent border-none cursor-pointer transition-opacity duration-200"
                                    title="Tương tác bài hát"
                                >
                                    <MoreHorizontal size={16} />
                                </button>
                            </div>

                            <p className="text-xs text-[#a7a7a7] truncate flex gap-1 items-center mt-1">
                                {track.artists && track.artists.length > 0 ? (
                                    track.artists.map((artist, idx) => (
                                        <span key={artist.id}>
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/artists/${artist.id}`);
                                                }}
                                                className="hover:text-blue-500 hover:underline cursor-pointer transition-colors text-gray-400 font-medium"
                                            >
                                                {artist.name}
                                            </span>
                                            {idx < track.artists.length - 1 && ", "}
                                        </span>
                                    ))
                                ) : "Nghệ sĩ hệ thống"}
                            </p>
                        </div>
                    )}
                />

                {/* 2. NGHỆ SĨ */}
                <AutoScrollCarousel
                    title="Nghệ Sĩ Nổi Bật"
                    items={cleanArtists}
                    onViewAll={() => navigate('/artists')}
                    renderItem={(artist) => (
                        <div key={artist.id} onClick={() => navigate(`/artists/${artist.id}`)} className="min-w-[160px] md:min-w-[200px] flex-shrink-0 snap-start bg-[#181818] p-5 rounded-xl hover:bg-[#282828] transition-all duration-300 group cursor-pointer border border-transparent hover:border-[#3e3e3e] text-center">
                            <div className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-4 rounded-full overflow-hidden border border-[#282828] relative bg-[#282828] shadow-md">
                                <MusicImage src={artist.img} type="artist" alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 object-top" />
                            </div>
                            <h4 className="font-bold text-white truncate text-sm mb-1 group-hover:text-blue-400 transition-colors">{artist.name}</h4>
                            <p className="text-[11px] text-[#a7a7a7] font-medium tracking-wider uppercase">Artist</p>
                        </div>
                    )}
                />

                {/* 3. ALBUM */}
                <AutoScrollCarousel
                    title="Album Nổi Bật"
                    items={albums}
                    onViewAll={() => navigate('/albums')}
                    renderItem={(album) => (
                        <div key={album.id} onClick={() => navigate(`/albums/${album.id}`)} className="min-w-[160px] md:min-w-[200px] flex-shrink-0 snap-start bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all duration-300 group cursor-pointer border border-transparent hover:border-[#3e3e3e]">
                            <div className="relative aspect-square w-full mb-4 rounded-md overflow-hidden bg-[#282828] shadow-md">
                                <MusicImage src={album.img} type="album" alt={album.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <h4 className="font-bold text-white truncate text-sm mb-1 group-hover:text-blue-400 transition-colors">{album.name}</h4>
                            <p className="text-[11px] text-[#a7a7a7] font-medium tracking-wider uppercase">Album</p>
                        </div>
                    )}
                />

                {/* 4. BIỂU ĐỒ TOP 5 THỊNH HÀNH (ĐÃ ĐƯỢC TÍNH HỢP CÁC CHỨC NĂNG ĐÚNG CHUẨN PLAYLIST CHARTS) */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
                            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                            Biểu Đồ Top 5 Thịnh Hành
                        </h3>
                    </div>

                    <div className="bg-[#181818] border border-[#282828] p-2 rounded-xl shadow-2xl">
                        {top5Tracks && top5Tracks.length > 0 ? (
                            <div className="flex flex-col">
                                {top5Tracks.map((track, index) => {
                                    let rankColor = "text-[#b3b3b3]";
                                    if (index === 0) rankColor = "text-[#1db954]"; // Top 1 màu xanh lá cây đặc trưng
                                    if (index === 1) rankColor = "text-[#fff]";
                                    if (index === 2) rankColor = "text-[#fff]";

                                    return (
                                        <div
                                            key={track.id}
                                            onClick={() => playTrack(track, top5Tracks)}
                                            className="grid grid-cols-12 items-center gap-4 p-3 rounded-md hover:bg-[#ffffff]/10 transition-all duration-200 group cursor-pointer"
                                        >
                                            {/* SỐ THỨ TỰ / ICON PLAY KHI HOVER */}
                                            <div className="col-span-1 flex items-center justify-center font-bold text-base w-8">
                                                <span className={`group-hover:hidden ${rankColor}`}>
                                                    {index + 1}
                                                </span>
                                                <Play size={14} fill="currentColor" className="hidden group-hover:block text-white" />
                                            </div>

                                            {/* THÔNG TIN BÀI HÁT */}
                                            <div className="col-span-6 flex items-center gap-4 min-w-0">
                                                <div className="w-10 h-10 rounded bg-[#282828] relative flex-shrink-0 overflow-hidden">
                                                    <MusicImage src={track.img} type='track' alt={track.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="truncate">
                                                    <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                                                        {track.name}
                                                    </h4>
                                                    <p className="text-xs text-[#b3b3b3] truncate flex gap-1 items-center mt-0.5">
                                                        {track.artists && track.artists.length > 0 ? (
                                                            track.artists.map((artist, idx) => (
                                                                <span key={artist.id}>
                                                                    <span
                                                                        onClick={(e) => { e.stopPropagation(); navigate(`/artists/${artist.id}`); }}
                                                                        className="hover:text-white hover:underline cursor-pointer transition-colors"
                                                                    >
                                                                        {artist.name}
                                                                    </span>
                                                                    {idx < track.artists.length - 1 && ", "}
                                                                </span>
                                                            ))
                                                        ) : <span>Nghệ sĩ hệ thống</span>}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* LƯỢT NGHE */}
                                            <div className="col-span-2 text-left text-sm text-[#b3b3b3] font-normal">
                                                {track.viewCount?.toLocaleString() || 0} lượt nghe
                                            </div>

                                            {/* HÀNG CÔNG CỤ TƯƠNG TÁC PHẲNG - CHỈ HIỂN THỊ KHI HOVER CHUỘT VÀO DÒNG BÀI HÁT */}
                                            <div className="col-span-3 flex items-center justify-end gap-5 pr-4">
                                                {/* 1. CHỨC NĂNG RATING (Hiển thị Icon Ngôi sao) */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTrack(track); // Mở hộp thoại để chấm sao rating
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 text-[#b3b3b3] hover:text-[#ffca28] bg-transparent border-none cursor-pointer transition-all p-1"
                                                    title="Đánh giá bài hát"
                                                >
                                                    <Star size={16} />
                                                </button>

                                                {/* 2. CHỨC NĂNG BÌNH LUẬN (Hiển thị Icon Tin nhắn) */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTrack(track); // Mở hộp thoại đọc/viết bình luận công khai
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 text-[#b3b3b3] hover:text-blue-400 bg-transparent border-none cursor-pointer transition-all p-1"
                                                    title="Bình luận bài hát"
                                                >
                                                    <MessageSquare size={16} />
                                                </button>

                                                {/* 3. CHỨC NĂNG THẢ TIM / YÊU THÍCH (Hiển thị Icon Trái tim) */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTrack(track); // Mở hộp thoại bật/tắt trạng thái yêu thích
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 text-[#b3b3b3] hover:text-red-500 bg-transparent border-none cursor-pointer transition-all p-1"
                                                    title="Yêu thích bài hát"
                                                >
                                                    <Heart size={16} />
                                                </button>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center text-sm text-gray-500 p-8 border border-dashed border-[#3e3e3e] rounded-xl">
                                Hệ thống đang tải dữ liệu biểu đồ...
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* BOX ĐIỀU KHIỂN HOẠT ĐỘNG POP-UP TỔNG HỢP (KHI ĐƯỢC KÍCH HOẠT) */}
            {selectedTrack && (
                <TrackEngagementModal
                    track={selectedTrack}
                    onClose={() => setSelectedTrack(null)}
                />
            )}
        </div>
    );
};

export default HomePage;``