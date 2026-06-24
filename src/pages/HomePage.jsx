import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Music, Layers, UploadCloud, BarChart3, User as UserIcon } from 'lucide-react';
import axiosClient from '../app/axios/axiosClient';
import { useAuthStore } from '../features/auth/useAuthStore';
import { usePlayerStore } from '../features/player/usePlayerStore';
import MusicImage from '../layouts/components/MusicImage';

// =====================================================================
// COMPONENT PHỤ: BĂNG CHUYỀN ĐIỀU HƯỚNG TAY (ĐÃ BỎ HOÀN TOÀN AUTO-SCROLL)
// =====================================================================
const AutoScrollCarousel = ({ title, items, renderItem, onViewAll }) => {
    const scrollRef = useRef(null);

    // Hàm thực hiện cuộn thủ công khi bấm nút điều hướng
    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 240; // Khoảng cách cuộn tương đương kích thước 1 card
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const validItems = Array.isArray(items)
        ? items
        : (items && Array.isArray(items.content) ? items.content : []);

    if (validItems.length === 0) return null;

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
                    <span className="w-1.5 h-6 bg-sky-500 rounded-full"></span>
                    {title}
                </h3>
                <button
                    onClick={onViewAll}
                    className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest bg-transparent border-none cursor-pointer transition-colors"
                >
                    Xem tất cả
                </button>
            </div>

            {/* Lớp bọc có thêm nút chuyển dữ liệu thủ công qua Hover */}
            <div className="relative group/carousel">
                {/* Nút bấm dịch trái */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-slate-900/80 border border-white/10 text-white w-9 h-9 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-sky-500 flex items-center justify-center shadow-lg animate-fadeIn"
                >
                    &#10094;
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth snap-x pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                    {validItems.map(renderItem)}
                </div>

                {/* Nút bấm dịch phải */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-slate-900/80 border border-white/10 text-white w-9 h-9 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-sky-500 flex items-center justify-center shadow-lg animate-fadeIn"
                >
                    &#10095;
                </button>
            </div>
        </section>
    );
};

// =====================================================================
// COMPONENT CHÍNH: TRANG CHỦ
// =====================================================================
const HomePage = () => {
    const navigate = useNavigate();
    const { username, role } = useAuthStore();

    const playTrack = usePlayerStore((state) => state.playTrack);

    // --- QUẢN LÝ TRẠNG THÁI DỮ LIỆU TỪ DATABASE ---
    const [tracks, setTracks] = useState([]);
    const [artists, setArtists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [albums, setAlbums] = useState([]);
    const [top5Tracks, setTop5Tracks] = useState([]);

    // --- FETCH DATA TỪ SPRING BOOT (GIỮ NGUYÊN HOÀN TOÀN LOGIC CŨ) ---
    useEffect(() => {
        const fetchHomeData = async () => {
            setIsLoading(true);
            try {
                const [tracksRes, artistsRes, albumRes, top5TrackRes] =
                    await Promise.all([
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
            <div className="p-6 bg-[#0d131a] min-h-screen flex items-center justify-center font-sans">
                <div className="w-10 h-10 border-4 border-white/[0.05] border-t-sky-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 pb-32 font-sans text-slate-100 bg-[#0d131a] min-h-screen selection:bg-sky-600 selection:text-white">

            {/* KHỐI BANNER CHÀO MỪNG */}
            <div className="mb-10 p-8 rounded-xl bg-gradient-to-r from-[#0f1722] to-[#131e2e] border border-white/[0.05] shadow-md relative overflow-hidden">
                <h2 className="text-4xl font-extrabold mb-2 text-white relative z-10 tracking-tight">
                    Chào buổi chiều, <span className="text-sky-400">{username || 'Listener'}</span>
                </h2>
                <p className="text-slate-400 relative z-10 text-sm">
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
                            className="w-[160px] md:w-[200px] flex-shrink-0 snap-start bg-[#0f1722] p-4 rounded-xl hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer border border-transparent hover:border-white/[0.1] relative"
                        >
                            <div className="relative w-full h-[150px] md:h-[168px] mb-4 rounded-md overflow-hidden bg-white/[0.02] shadow-md flex-shrink-0">
                                <MusicImage
                                    src={track.img}
                                    type="track"
                                    alt={track.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playTrack(track, tracks);
                                        }}
                                        className="w-11 h-11 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 border-none cursor-pointer shadow-md"
                                    >
                                        <Play size={20} fill="currentColor" className="text-white ml-0.5" />
                                    </button>
                                </div>
                            </div>
                            {/* Ép kích thước chữ tự động hiển thị ... khi tên quá dài */}
                            <h4 className="font-bold text-white truncate text-sm mb-1 w-full">{track.name}</h4>
                            <p className="text-xs text-slate-400 truncate flex gap-1 items-center w-full">
                                {track.artists && track.artists.length > 0 ? (
                                    track.artists.map((artist, idx) => (
                                        <span key={artist.id} className="inline-block max-w-full truncate">
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
                                    ))
                                ) : (
                                    "Nghệ sĩ hệ thống"
                                )}
                            </p>
                        </div>
                    )}
                />

                {/* 2. BĂNG CHUYỀN NGHỆ SĨ (ARTISTS CAROUSEL) */}
                <AutoScrollCarousel
                    title="Nghệ Sĩ Nổi Bật"
                    items={artists}
                    onViewAll={() => navigate('/artists')}
                    renderItem={(artist) => (
                        <div
                            key={artist.id}
                            onClick={() => navigate(`/artist/${artist.id}`)}
                            className="w-[160px] md:w-[200px] flex-shrink-0 snap-start bg-[#0f1722] p-5 rounded-xl hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer border border-transparent hover:border-white/[0.1] text-center"
                        >
                            <div className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-4 rounded-full overflow-hidden border border-white/[0.05] relative bg-white/[0.02] shadow-md flex-shrink-0">
                                <MusicImage
                                    src={artist.img}
                                    type="artist"
                                    alt={artist.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 object-top"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                        <UserIcon size={18} className="text-white" />
                                    </div>
                                </div>
                            </div>
                            <h4 className="font-bold text-white truncate text-sm mb-1 group-hover:text-sky-400 transition-colors w-full">{artist.name}</h4>
                            <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase">Artist</p>
                        </div>
                    )}
                />

                {/* 3. BĂNG CHUYỀN ALBUM (HÌNH VUÔNG GỐC - ĐÃ FIX KÍCH THƯỚC TRÀN MÀN) */}
                <AutoScrollCarousel
                    title="Album Nổi Bật"
                    items={albums}
                    onViewAll={() => navigate('/albums')}
                    renderItem={(album) => (
                        <div
                            key={album.id}
                            onClick={() => navigate(`/albums/${album.id}`)}
                            className="w-[160px] md:w-[200px] flex-shrink-0 snap-start bg-[#0f1722] p-4 rounded-xl hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer border border-transparent hover:border-white/[0.1]"
                        >
                            {/* Giới hạn khung chứa ảnh album tương ứng với độ rộng card */}
                            <div className="relative aspect-square w-full h-[150px] md:h-[168px] mb-4 overflow-hidden bg-white/[0.02] shadow-md flex-shrink-0">
                                <MusicImage
                                    src={album.img}
                                    type="album"
                                    alt={album.name}
                                    className="group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <button className="w-11 h-11 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center shadow-md transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 border-none cursor-pointer">
                                        <Play size={20} fill="currentColor" className="text-white ml-0.5" />
                                    </button>
                                </div>
                            </div>
                            <h4 className="font-bold text-white truncate text-sm mb-1 group-hover:text-sky-400 transition-colors w-full">{album.name}</h4>
                            <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase">Album</p>
                        </div>
                    )}
                />

                {/* 4. BIỂU ĐỒ TOP 5 THỊNH HÀNH */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
                            <span className="w-1.5 h-6 bg-sky-500 rounded-full"></span>
                            Biểu Đồ Top 5 Thịnh Hành
                        </h3>
                    </div>

                    <div className="bg-[#0f1722] border border-white/[0.05] p-6 rounded-2xl shadow-2xl">
                        {top5Tracks.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {top5Tracks.map((track, index) => {
                                    let rankColor = "text-slate-600";
                                    if (index === 0) rankColor = "text-[#FFD700]";
                                    if (index === 1) rankColor = "text-[#C0C0C0]";
                                    if (index === 2) rankColor = "text-[#CD7F32]";

                                    return (
                                        <div
                                            key={track.id}
                                            onClick={() => playTrack(track, top5Tracks)}
                                            className="grid grid-cols-12 items-center gap-4 p-3 rounded-xl hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer"
                                        >
                                            {/* CỘT 1: THỨ HẠNG */}
                                            <div className={`col-span-1 flex items-center justify-center font-black text-xl w-10 h-10 flex-shrink-0 ${rankColor}`}>
                                                {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                            </div>

                                            {/* CỘT 2: HÌNH ẢNH BÀI HÁT */}
                                            <div className="col-span-1 flex items-center justify-center flex-shrink-0 min-w-[48px]">
                                                <div className="w-12 h-12 rounded-md overflow-hidden bg-white/[0.02] relative shadow-md flex-shrink-0 min-w-[48px] min-h-[48px]">
                                                    <MusicImage
                                                        src={track.img}
                                                        type="track"
                                                        alt={track.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Play size={14} fill="currentColor" className="text-white ml-0.5" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CỘT 3: TÊN BÀI HÁT & NGHỆ SĨ */}
                                            <div className="col-span-7 flex flex-col justify-center min-w-0 px-2">
                                                <div className="truncate mb-1.5 min-w-0">
                                                    <h4 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors truncate w-full">
                                                        {track.name}
                                                    </h4>

                                                    <p className="text-xs text-slate-400 truncate flex gap-1 items-center min-w-0 w-full">
                                                        {track.artists && track.artists.length > 0 ? (
                                                            track.artists.map((artist, idx) => (
                                                                <span key={artist.id} className="inline-block max-w-full truncate">
                                                                    <span
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigate(`/artist/${artist.id}`);
                                                                        }}
                                                                        className="hover:text-sky-400 hover:underline cursor-pointer transition-colors"
                                                                    >
                                                                        {artist.name}
                                                                    </span>
                                                                    {idx < track.artists.length - 1 && ", "}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span>Nghệ sĩ hệ thống</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* CỘT 4: SỐ LƯỢT NGHE */}
                                            <div className="col-span-3 text-right flex flex-col items-end justify-center flex-shrink-0">
                                                <span className="text-sm font-semibold text-white font-mono bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/[0.05] group-hover:border-sky-500/30 transition-colors whitespace-nowrap">
                                                    {track.viewCount?.toLocaleString() || 0} <span className="text-xs text-slate-400 font-sans font-normal ml-0.5">lượt nghe</span>
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center text-sm text-slate-500 p-8 border border-dashed border-white/[0.05] rounded-xl">
                                Hệ thống đang tải dữ liệu biểu đồ...
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;