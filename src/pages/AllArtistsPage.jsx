import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, ChevronLeft, ChevronRight, UserPlus, UserCheck } from 'lucide-react';
import axiosClient from '../app/axios/axiosClient';
import MusicImage from "../layouts/components/MusicImage.jsx";
import { useFollowStore } from '../features/follow/useFollowStore';

const AllArtistsPage = () => {
    const navigate = useNavigate();
    const [artists, setArtists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- CÁC STATE QUẢN LÝ PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 12; // Chọn 12 phần tử giúp lưới hiển thị luôn đều đẹp

    const { followedArtistIds, fetchFollowedArtists, toggleFollowArtist } = useFollowStore();



    const userRole = localStorage.getItem('role') || '';
    const isArtistRole = userRole.toUpperCase().includes('ARTIST');

    // Tải danh sách nghệ sĩ đã follow của user một lần khi vào trang
    useEffect(() => {
        fetchFollowedArtists();
    }, [fetchFollowedArtists]);

    useEffect(() => {
        const fetchAllArtists = async () => {
            setIsLoading(true);
            try {
                const res = await axiosClient.get(`/artists?page=${currentPage}&size=${pageSize}`);
                setArtists(res.data.content || []);
                setTotalPages(res.data.page?.totalPages || 0);
            } catch (error) {
                console.error("Lỗi tải danh sách Artist: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllArtists();
    }, [currentPage]);

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage((prev) => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getPaginationGroup = () => {
        let pages = [];
        const delta = 2; // Số trang hiển thị quanh trang hiện tại
        for (let i = 0; i < totalPages; i++) {
            if (
                i === 0 || // Trang đầu
                i === totalPages - 1 || // Trang cuối
                (i >= currentPage - delta && i <= currentPage + delta) // Trang lân cận
            ) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        return pages;
    };

    if (isLoading) {
        return (
            <div className="p-6 bg-[#0d131a] min-h-screen flex items-center justify-center font-sans text-slate-400">
                <div className="w-10 h-10 border-4 border-white/[0.05] border-t-sky-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-8 pb-32 bg-[#0d131a] min-h-screen font-sans text-slate-100 flex flex-col justify-between selection:bg-sky-600 selection:text-white">
            <div>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white mb-6 bg-transparent border-none cursor-pointer transition-colors group/btn"
                >
                    <ArrowLeft size={18} className="group-hover/btn:-translate-x-1 transition-transform" /> Quay lại trang chủ
                </button>

                <h2 className="text-3xl font-black text-white mb-8 tracking-tight">Nghệ sĩ phổ biến</h2>

                {artists.length === 0 ? (
                    <div className="text-center py-20 bg-[#0f1722]/50 rounded-2xl border border-dashed border-white/[0.05] text-slate-500 my-20">
                        Không tìm thấy nghệ sĩ nào trong hệ thống.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {artists.map((artist) => {
                            const isFollowing = followedArtistIds.includes(Number(artist.id));

                            return (
                                <div
                                    key={artist.id}
                                    onClick={() => navigate(`/artist/${artist.id}`)}
                                    className="bg-[#0f1722] p-5 rounded-2xl hover:bg-white/[0.03] transition-all duration-300 group cursor-pointer border border-white/[0.05] hover:border-sky-500/30 text-center shadow-lg shadow-black/20 flex flex-col justify-between items-center"
                                >
                                    <div className="w-full text-center">
                                        {/* Khung hình tròn chuẩn Spotify */}
                                        <div className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-4 rounded-full overflow-hidden border border-white/[0.05] relative bg-white/[0.02] shadow-inner">
                                            <MusicImage
                                                src={artist.img}
                                                type='artist'
                                                alt={artist.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 object-top"
                                            />
                                            {/* Lớp phủ mờ nhẹ và nút Icon nổi bật khi hover */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                                    <UserIcon size={18} className="text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-white truncate text-sm mb-1 group-hover:text-sky-400 transition-colors w-full px-1" title={artist.name}>
                                            {artist.name}
                                        </h4>
                                        <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase mb-3">Artist</p>
                                    </div>

                                    {/* CHỈ HIỂN THỊ NÚT FOLLOW KHI ROLE KHÔNG PHẢI LÀ ARTIST */}
                                    {!isArtistRole && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Ngăn chặn sự kiện click thẻ bọc làm nhảy trang /artist/:id
                                                toggleFollowArtist(Number(artist.id));
                                            }}
                                            className={`w-full py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1 ${
                                                isFollowing
                                                    ? 'bg-transparent border-zinc-600 text-zinc-400 hover:border-red-500 hover:text-red-500'
                                                    : 'bg-white border-transparent text-black hover:scale-105'
                                            }`}
                                        >
                                            {isFollowing ? (
                                                <>
                                                    <UserCheck size={12} /> Đang Fl
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={12} /> Fl
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- 3. GIAO DIỆN THANH PHÂN TRANG (PAGINATION BAR) --- */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-16 pt-8 border-t border-white/[0.05]">
                    {/* Nút về đầu trang */}
                    <button
                        onClick={() => setCurrentPage(0)}
                        disabled={currentPage === 0}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.05] text-slate-400 hover:text-white hover:border-sky-500/50 hover:bg-white/[0.08] disabled:opacity-20 disabled:hover:border-white/[0.05] disabled:hover:bg-white/[0.03] transition-all font-mono"
                    >
                        «
                    </button>

                    {/* Nút Trước */}
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.05] text-slate-400 hover:text-white hover:border-sky-500/50 hover:bg-white/[0.08] disabled:opacity-20 transition-all"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {/* Các số trang */}
                    {getPaginationGroup().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === 'number' && setCurrentPage(page)}
                            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all border ${
                                page === currentPage
                                    ? 'bg-sky-600 border-sky-500 text-white shadow-lg shadow-sky-500/20'
                                    : 'bg-white/[0.03] border-white/[0.05] text-slate-400 hover:bg-white/[0.08] hover:text-white hover:border-sky-500/30'
                            } ${page === '...' ? 'cursor-default border-none hover:bg-transparent text-slate-600' : ''}`}
                            disabled={page === '...'}
                        >
                            {typeof page === 'number' ? page + 1 : page}
                        </button>
                    ))}

                    {/* Nút Sau */}
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages - 1}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.05] text-slate-400 hover:text-white hover:border-sky-500/50 hover:bg-white/[0.08] disabled:opacity-20 transition-all"
                    >
                        <ChevronRight size={18} />
                    </button>

                    {/* Nút đến cuối trang */}
                    <button
                        onClick={() => setCurrentPage(totalPages - 1)}
                        disabled={currentPage === totalPages - 1}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.05] text-slate-400 hover:text-white hover:border-sky-500/50 hover:bg-white/[0.08] disabled:opacity-20 disabled:hover:border-white/[0.05] disabled:hover:bg-white/[0.03] transition-all font-mono"
                    >
                        »
                    </button>
                </div>
            )}
        </div>
    );
};

export default AllArtistsPage;