import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Play, User as UserIcon, Music, Layers } from 'lucide-react';
import axiosClient from '../app/axios/axiosClient';
import { usePlayerStore } from '../features/player/usePlayerStore';
import MusicImage from '../layouts/components/MusicImage';
import { AppPagination } from "../layouts/components/AppPagination.jsx";

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
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-500 rounded-full"></span> {title}
                </h3>
                <button
                    onClick={onViewAll}
                    className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest bg-transparent border-none cursor-pointer transition-colors"
                >
                    Xem tất cả
                </button>
            </div>

            <div className="relative group/carousel">
                <button
                    onClick={() => scroll('left')}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-[#181818]/80 border border-white/10 text-white w-9 h-9 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-blue-600 flex items-center justify-center shadow-lg"
                >
                    &#10094;
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth snap-x pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                    {validItems.map(renderItem)}
                </div>

                <button
                    onClick={() => scroll('right')}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-[#181818]/80 border border-white/10 text-white w-9 h-9 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-blue-600 flex items-center justify-center shadow-lg"
                >
                    &#10095;
                </button>
            </div>
        </section>
    );
};

// =====================================================================
// COMPONENT CHÍNH: TRANG TÌM KIẾM
// =====================================================================
const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const playTrack = usePlayerStore((state) => state.playTrack);

    const query = searchParams.get('q') || '';
    const currentType = searchParams.get('type') || 'all';
    const currentPage = parseInt(searchParams.get('page')) || 0;

    const [searchResults, setSearchResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!query.trim()) {
            setSearchResults(null);
            return;
        }

        const fetchResults = async () => {
            setIsLoading(true);
            try {
                // Lấy 20 items nếu ở tab "all" để cuộn ngang. Tab lẻ lấy 12 items để hiện lưới phân trang.
                const pageSize = currentType === 'all' ? 20 : 12;

                const response = await axiosClient.get('/search', {
                    params: {
                        q: query,
                        type: currentType,
                        page: currentPage,
                        size: pageSize
                    }
                });
                console.log("Dữ liệu API Search trả về:", response.data);
                setSearchResults(response.data);
            } catch (error) {
                console.error("Lỗi khi gọi API tìm kiếm: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [query, currentType, currentPage]);

    // BÓC TÁCH DỮ LIỆU
    const tracks = searchResults?.tracks?.content || [];
    const artists = searchResults?.artists?.content || [];
    const albums = searchResults?.albums?.content || [];
    const playlists = searchResults?.playlists?.content || [];
    const categories = searchResults?.categories?.content || [];

    // BÓC TÁCH DỮ LIỆU TOTAL PAGES (Đã sửa lại đường dẫn có thêm .page)
    let totalPages = 0;
    if (searchResults) {
        if (currentType === 'track') totalPages = searchResults.tracks?.page?.totalPages;
        else if (currentType === 'artist') totalPages = searchResults.artists?.page?.totalPages;
        else if (currentType === 'album') totalPages = searchResults.albums?.page?.totalPages;
        else if (currentType === 'playlist') totalPages = searchResults.playlists?.page?.totalPages;
        else if (currentType === 'category') totalPages = searchResults.categories?.page?.totalPages;
    }

    // Đảm bảo kiểu dữ liệu là số, nếu undefined thì cho về 0
    totalPages = totalPages ? Number(totalPages) : 0;

    const handlePageChange = (newPage) => {
        navigate(`/search?q=${encodeURIComponent(query)}&type=${currentType}&page=${newPage}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTypeChange = (newType) => {
        navigate(`/search?q=${encodeURIComponent(query)}&type=${newType}&page=0`);
    };

    // Helper: Render Bài hát
    const renderTrackCard = (track, isScrollMode) => (
        <div key={track.id} className={`${isScrollMode ? 'w-[160px] md:w-[200px] flex-shrink-0 snap-start' : 'w-full'} bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all duration-300 group cursor-pointer border border-transparent hover:border-[#3e3e3e]`}>
            <div className="relative aspect-square w-full mb-4 rounded-md overflow-hidden bg-[#282828] shadow-md">
                <MusicImage src={track.img} type='track' alt={track.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <button onClick={(e) => { e.stopPropagation(); playTrack(track, tracks); }} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white border-none cursor-pointer shadow-md">
                        <Play size={18} fill="currentColor" className="text-black ml-0.5" />
                    </button>
                </div>
            </div>
            <h4 className="font-bold text-white truncate text-sm mb-1 group-hover:text-blue-400">{track.name}</h4>
            <p className="text-xs text-[#a7a7a7] truncate flex gap-1 items-center">
                {track.artists && track.artists.length > 0 ? (
                    track.artists.map((artist, idx) => (
                        <span key={artist.id}>
                            <span onClick={(e) => { e.stopPropagation(); navigate(`/artist/${artist.id}`); }} className="hover:text-white hover:underline cursor-pointer transition-colors text-gray-400 font-medium">
                                {artist.name}
                            </span>
                            {idx < track.artists.length - 1 && ", "}
                        </span>
                    ))
                ) : "Nghệ sĩ hệ thống"}
            </p>
        </div>
    );

    // Helper: Render Nghệ sĩ
    const renderArtistCard = (artist, isScrollMode) => (
        <div key={artist.id} onClick={() => navigate(`/artist/${artist.id}`)} className={`${isScrollMode ? 'w-[160px] md:w-[200px] flex-shrink-0 snap-start' : 'w-full'} bg-[#181818] p-5 rounded-xl hover:bg-[#282828] transition-all duration-300 group cursor-pointer border border-transparent hover:border-[#3e3e3e] text-center`}>
            <div className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-4 rounded-full overflow-hidden border border-[#282828] relative bg-[#282828] shadow-md">
                <MusicImage src={artist.img} type='artist' alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 object-top" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                        <UserIcon size={16} className="text-white" />
                    </div>
                </div>
            </div>
            <h4 className="font-bold text-white truncate text-sm mb-1 group-hover:text-blue-400 transition-colors">{artist.name}</h4>
            <p className="text-[11px] text-[#a7a7a7] font-medium uppercase tracking-wider">Artist</p>
        </div>
    );

    // Helper: Render Album
    const renderAlbumCard = (album, isScrollMode) => (
        <div key={album.id} onClick={() => navigate(`/albums/${album.id}`)} className={`${isScrollMode ? 'w-[160px] md:w-[200px] flex-shrink-0 snap-start' : 'w-full'} bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all duration-300 group cursor-pointer border border-transparent hover:border-[#3e3e3e]`}>
            <div className="relative aspect-square w-full mb-4 rounded-md overflow-hidden bg-[#282828] shadow-md">
                <MusicImage src={album.img} type='album' alt={album.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-md border-none cursor-pointer">
                        <Play size={18} fill="currentColor" className="text-black ml-0.5" />
                    </button>
                </div>
            </div>
            <h4 className="font-bold text-white truncate text-sm mb-1 group-hover:text-blue-400 transition-colors">{album.name}</h4>
            <p className="text-[11px] text-[#a7a7a7] font-medium uppercase tracking-wider">Album</p>
        </div>
    );

    // Helper: Render Playlist (Đã khôi phục)
    const renderPlaylistCard = (playlist, isScrollMode) => (
        <div key={playlist.id} className={`${isScrollMode ? 'w-[160px] md:w-[200px] flex-shrink-0 snap-start' : 'w-full'} bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all duration-300 group cursor-pointer border border-transparent hover:border-[#3e3e3e]`}>
            <div className="relative aspect-square w-full mb-4 rounded-md overflow-hidden bg-gradient-to-br from-blue-900 to-[#181818] shadow-md flex items-center justify-center">
                <Music size={40} className="text-white/20" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-md border-none cursor-pointer">
                        <Play size={18} fill="currentColor" className="text-black ml-0.5" />
                    </button>
                </div>
            </div>
            <h4 className="font-bold text-white truncate text-sm mb-1 group-hover:text-blue-400 transition-colors">{playlist.name}</h4>
            <p className="text-[11px] text-[#a7a7a7] font-medium uppercase tracking-wider">Playlist</p>
        </div>
    );

    // Helper: Render Thể Loại (Đã khôi phục)
    // Cập nhật hàm Helper: Render Thể Loại
    const renderCategoryCard = (category, isScrollMode) => (
        <div
            key={category.id}
            // THÊM SỰ KIỆN CHUYỂN HƯỚNG TẠI ĐÂY
            onClick={() => navigate(`/categories/${category.id}`, { state: { categoryName: category.name } })}
            className={`${isScrollMode ? 'w-[160px] md:w-[200px] flex-shrink-0 snap-start' : 'w-full'} bg-gradient-to-br from-[#282828] to-[#181818] p-4 rounded-xl hover:from-[#3e3e3e] hover:to-[#282828] transition-all duration-300 group cursor-pointer border border-[#3e3e3e] flex flex-col justify-center items-center aspect-[4/3] shadow-md`}
        >
            <Layers size={28} className="text-blue-500 mb-3 opacity-80" />
            <h4 className="font-bold text-white text-base text-center group-hover:scale-105 transition-transform">{category.name}</h4>
        </div>
    );

    if (isLoading) {
        return (
            <div className="p-6 bg-[#121212] min-h-screen flex items-center justify-center font-sans">
                <div className="w-10 h-10 border-4 border-[#282828] border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 pb-32 font-sans text-gray-100 bg-[#121212] min-h-screen selection:bg-blue-600 selection:text-white">

            <div className="mb-6">
                {query ? (
                    <h2 className="text-xl text-[#a7a7a7]">
                        Kết quả tìm kiếm cho: <span className="text-white font-bold text-2xl">"{query}"</span>
                    </h2>
                ) : (
                    <h2 className="text-2xl font-bold text-white">Khám phá nội dung bạn yêu thích</h2>
                )}
            </div>

            <div className="flex flex-wrap gap-3 mb-10">
                {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'track', label: 'Bài hát' },
                    { id: 'artist', label: 'Nghệ sĩ' },
                    { id: 'album', label: 'Album' },
                    { id: 'playlist', label: 'Playlist' },
                    { id: 'category', label: 'Thể loại' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTypeChange(tab.id)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border-none cursor-pointer ${
                            currentType === tab.id
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                : 'bg-[#181818] text-[#a7a7a7] hover:bg-[#282828] hover:text-white'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {searchResults && (tracks.length > 0 || artists.length > 0 || albums.length > 0 || playlists.length > 0 || categories.length > 0) ? (
                <div className="space-y-6 animate-fadeIn">

                    {/* KHỐI 1: BÀI HÁT */}
                    {(currentType === 'all' || currentType === 'track') && tracks.length > 0 && (
                        currentType === 'all' ? (
                            <AutoScrollCarousel title="Bài hát" items={tracks} onViewAll={() => handleTypeChange('track')} renderItem={(t) => renderTrackCard(t, true)} />
                        ) : (
                            <section>
                                <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2"><span className="w-1 h-5 bg-blue-500 rounded-full"></span> Bài hát</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                    {tracks.map(t => renderTrackCard(t, false))}
                                </div>
                            </section>
                        )
                    )}

                    {/* KHỐI 2: NGHỆ SĨ */}
                    {(currentType === 'all' || currentType === 'artist') && artists.length > 0 && (
                        currentType === 'all' ? (
                            <AutoScrollCarousel title="Nghệ sĩ" items={artists} onViewAll={() => handleTypeChange('artist')} renderItem={(a) => renderArtistCard(a, true)} />
                        ) : (
                            <section>
                                <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2"><span className="w-1 h-5 bg-blue-500 rounded-full"></span> Nghệ sĩ</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                    {artists.map(a => renderArtistCard(a, false))}
                                </div>
                            </section>
                        )
                    )}

                    {/* KHỐI 3: ALBUM */}
                    {(currentType === 'all' || currentType === 'album') && albums.length > 0 && (
                        currentType === 'all' ? (
                            <AutoScrollCarousel title="Album" items={albums} onViewAll={() => handleTypeChange('album')} renderItem={(al) => renderAlbumCard(al, true)} />
                        ) : (
                            <section>
                                <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2"><span className="w-1 h-5 bg-blue-500 rounded-full"></span> Album</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                    {albums.map(al => renderAlbumCard(al, false))}
                                </div>
                            </section>
                        )
                    )}

                    {/* KHỐI 4: PLAYLIST (Đã được khôi phục) */}
                    {(currentType === 'all' || currentType === 'playlist') && playlists.length > 0 && (
                        currentType === 'all' ? (
                            <AutoScrollCarousel title="Playlist" items={playlists} onViewAll={() => handleTypeChange('playlist')} renderItem={(pl) => renderPlaylistCard(pl, true)} />
                        ) : (
                            <section>
                                <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2"><span className="w-1 h-5 bg-blue-500 rounded-full"></span> Playlist</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                    {playlists.map(pl => renderPlaylistCard(pl, false))}
                                </div>
                            </section>
                        )
                    )}

                    {/* KHỐI 5: THỂ LOẠI (Đã được khôi phục) */}
                    {(currentType === 'all' || currentType === 'category') && categories.length > 0 && (
                        currentType === 'all' ? (
                            <AutoScrollCarousel title="Thể loại" items={categories} onViewAll={() => handleTypeChange('category')} renderItem={(cat) => renderCategoryCard(cat, true)} />
                        ) : (
                            <section>
                                <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2"><span className="w-1 h-5 bg-blue-500 rounded-full"></span> Thể loại</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                    {categories.map(cat => renderCategoryCard(cat, false))}
                                </div>
                            </section>
                        )
                    )}

                    {/* PHÂN TRANG (CHỈ HIỆN Ở TAB LẺ VÀ CÓ NHIỀU HƠN 1 TRANG) */}
                    {currentType !== 'all' && totalPages > 1 && (
                        <div className="pt-10 flex justify-center w-full">
                            <AppPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                        </div>
                    )}
                </div>
            ) : (
                query && (
                    <div className="text-center py-16 border border-dashed border-[#282828] rounded-2xl bg-[#181818] max-w-xl mx-auto">
                        <p className="text-[#a7a7a7] text-base mb-2">Không tìm thấy kết quả nào phù hợp với từ khóa.</p>
                        <p className="text-xs text-gray-500">Hãy thử kiểm tra lại chính tả hoặc tìm kiếm bằng từ khóa khác nhé.</p>
                    </div>
                )
            )}
        </div>
    );
};

export default SearchPage;