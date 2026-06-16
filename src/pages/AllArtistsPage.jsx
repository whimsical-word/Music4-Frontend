import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosClient from '../app/axios/axiosClient';
import MusicImage from "../layouts/components/MusicImage.jsx";

const AllArtistsPage = () => {
    const navigate = useNavigate();
    const [artists, setArtists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- 1. BỔ SUNG CÁC STATE QUẢN LÝ PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(0); // Spring Boot mặc định trang đầu tiên là số 0
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 12; // Chọn 12 phần tử vì chia hết cho lưới 2, 3, 4, 6 cột giúp giao diện luôn đều đẹp

    useEffect(() => {
        const fetchAllArtists = async () => {
            setIsLoading(true); // Bật loading mỗi khi bồ bấm chuyển trang
            try {
                // Gửi kèm tham số page và size lên API Back-end
                const res = await axiosClient.get(`/artists?page=${currentPage}&size=${pageSize}`);

                // Vì Back-end trả về Page nên data thật nằm trong mảng `content`
                setArtists(res.data.content || []);
                setTotalPages(res.data.totalPages || 0);
            } catch (error) {
                console.error("Lỗi tải danh sách nghệ sĩ: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllArtists();
    }, [currentPage]); // 💡 Mỗi lần currentPage thay đổi, useEffect sẽ tự động gọi lại API

    // --- 2. CÁC HÀM XỬ LÝ CHUYỂN TRANG ---
    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage((prev) => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn mượt lên đầu trang khi qua trang mới
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 bg-[#121212] min-h-screen flex items-center justify-center font-sans">
                <div className="w-10 h-10 border-4 border-[#282828] border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 pb-32 bg-[#121212] min-h-screen font-sans text-gray-100 flex flex-col justify-between">
            <div>
                {/* Nút quay lại trang chủ */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm font-bold text-[#a7a7a7] hover:text-white mb-6 bg-transparent border-none cursor-pointer transition-colors"
                >
                    <ArrowLeft size={18} /> Quay lại trang chủ
                </button>

                <h2 className="text-3xl font-extrabold text-white mb-8 tracking-tight">Nghệ sĩ phổ biến</h2>

                {/* Kiểm tra nếu không có nghệ sĩ nào */}
                {artists.length === 0 ? (
                    <div className="text-center text-zinc-500 my-20">
                        Không tìm thấy nghệ sĩ nào trong hệ thống.
                    </div>
                ) : (
                    /* Lưới hiển thị danh sách nghệ sĩ */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {artists.map((artist) => (
                            <div
                                key={artist.id}
                                onClick={() => navigate(`/artist/${artist.id}`)}
                                className="bg-[#181818] p-5 rounded-xl hover:bg-[#282828] transition-all duration-300 group cursor-pointer border border-transparent hover:border-[#3e3e3e] text-center"
                            >
                                {/* Khung hình tròn chuẩn Spotify */}
                                <div className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-4 rounded-full overflow-hidden border border-[#282828] relative bg-[#282828] shadow-md">
                                    <MusicImage
                                        src={artist.img}
                                        type='artist'
                                        alt={artist.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 object-top"
                                    />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                            <UserIcon size={18} className="text-white" />
                                        </div>
                                    </div>
                                </div>
                                <h4 className="font-bold text-white truncate text-sm mb-1 group-hover:text-blue-400 transition-colors">{artist.name}</h4>
                                <p className="text-[11px] text-[#a7a7a7] font-medium tracking-wider uppercase">Artist</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- 3. GIAO DIỆN THANH PHÂN TRANG (PAGINATION BAR) --- */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16 pt-6 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                        {/* Nút Trang trước */}
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 0}
                            className="p-2.5 rounded-full bg-[#1e1e1e] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#282828] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#1e1e1e] disabled:hover:text-zinc-400 transition-all cursor-pointer"
                            title="Trang trước"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {/* Số hiển thị trang hiện tại */}
                        <span className="text-sm font-medium text-[#a7a7a7] px-4">
                            Trang <strong className="text-white font-bold">{currentPage + 1}</strong> / {totalPages}
                        </span>

                        {/* Nút Trang sau */}
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages - 1}
                            className="p-2.5 rounded-full bg-[#1e1e1e] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#282828] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#1e1e1e] disabled:hover:text-zinc-400 transition-all cursor-pointer"
                            title="Trang sau"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllArtistsPage;