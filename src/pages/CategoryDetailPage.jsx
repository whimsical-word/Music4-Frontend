import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Layers } from 'lucide-react';
import axiosClient from '../app/axios/axiosClient';
import MusicImage from '../layouts/components/MusicImage';
import { AppPagination } from "../layouts/components/AppPagination.jsx";
import { usePlayerStore } from '../features/player/usePlayerStore';

const CategoryDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const playTrack = usePlayerStore((state) => state.playTrack);

    // Lấy tên thể loại truyền qua state từ trang search (Nếu có)
    const categoryName = location.state?.categoryName || "Chi tiết Thể loại";

    const [tracks, setTracks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Phân trang
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 12;

    useEffect(() => {
        const fetchCategoryTracks = async () => {
            setIsLoading(true);
            try {
                // Gọi API backend bạn vừa tạo
                const res = await axiosClient.get(`/categories/${id}/tracks`, {
                    params: {
                        page: currentPage,
                        size: pageSize
                    }
                });
                setTracks(res.data.content || []);
                setTotalPages(res.data.page?.totalPages || res.data.totalPages || 0); // Dự phòng cả 2 cấu trúc
            } catch (error) {
                console.error("Lỗi khi tải bài hát theo thể loại: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategoryTracks();
    }, [id, currentPage]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading) {
        return (
            <div className="p-6 bg-[#121212] min-h-screen flex items-center justify-center font-sans">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-8 pb-32 bg-[#121212] min-h-screen font-sans text-slate-100">
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white mb-6 bg-transparent border-none cursor-pointer transition-colors group/btn"
                >
                    <ArrowLeft size={18} className="group-hover/btn:-translate-x-1 transition-transform" /> Quay lại
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-[#181818] rounded-xl flex items-center justify-center shadow-lg">
                        <Layers size={32} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tight">{categoryName}</h2>
                        <p className="text-[#a7a7a7] mt-1 text-sm">Khám phá các bài hát nổi bật nhất</p>
                    </div>
                </div>

                {tracks.length === 0 ? (
                    <div className="text-center py-20 bg-[#181818] rounded-2xl border border-dashed border-[#3e3e3e] text-slate-500 my-10">
                        Chưa có bài hát nào thuộc thể loại này.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {tracks.map((track) => (
                            <div key={track.id} className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all duration-300 group cursor-pointer border border-transparent hover:border-[#3e3e3e]">
                                <div className="relative aspect-square w-full mb-4 rounded-md overflow-hidden bg-[#282828] shadow-md">
                                    <MusicImage src={track.img} type='track' alt={track.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                        <button onClick={(e) => { e.stopPropagation(); playTrack(track, tracks); }} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white border-none cursor-pointer shadow-md">
                                            <Play size={18} fill="currentColor" className="text-black ml-0.5" />
                                        </button>
                                    </div>
                                </div>
                                <h4 className="font-bold text-white truncate text-sm mb-1 group-hover:text-blue-400">{track.name}</h4>
                                <p className="text-xs text-[#a7a7a7] truncate">
                                    {track.artists?.map(a => a.name).join(', ') || "Nghệ sĩ hệ thống"}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* PHÂN TRANG */}
            {totalPages > 1 && (
                <div className="pt-10 flex justify-center w-full">
                    <AppPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
            )}
        </div>
    );
};

export default CategoryDetailPage;