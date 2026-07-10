import React, { useEffect, useState } from 'react';
import trackService from '../features/tracks/trackService';
import { Play, MessageSquare } from "lucide-react"; // 🟢 Thêm MessageSquare để làm nút mở tương tác
import TrackEngagementModal from "../layouts/components/TrackEngagementModal";

const AllTracksPage = () => {
    const [tracks, setTracks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // 🟢 STATE MỚI: Theo dõi bài hát nào đang được chọn để mở Modal tương tác
    const [selectedTrack, setSelectedTrack] = useState(null);

    const S3_BASE_URL = "https://music4-v3-storage-kenz.s3.ap-southeast-1.amazonaws.com/";

    // 1. Gọi API lấy dữ liệu khi trang được nạp
    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const data = await trackService.getAllTracksDetail();
                setTracks(data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách bài hát:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTracks();
    }, []);

    // 2. Hàm helper đổi số giây thành định dạng phút:giây
    const formatDuration = (seconds) => {
        if (!seconds) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // 3. Hàm lọc bài hát theo ô tìm kiếm
    const filteredTracks = tracks.filter(track => {
        const nameMatch = track.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const artistMatch = track.artists?.some(artist =>
            artist.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return nameMatch || artistMatch;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#0d131a] text-slate-400 font-sans">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/[0.05] border-t-sky-500 mr-3"></div>
                <span>Đang tải danh sách bài hát...</span>
            </div>
        );
    }

    return (
        <div className="p-8 text-slate-100 bg-[#0d131a] min-h-screen font-sans selection:bg-sky-600 selection:text-white">
            {/* Header của trang */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white">Tất Cả Bài Hát</h1>
                    <p className="text-slate-400 text-sm mt-1">Quản lý và xem chi tiết kho nhạc hệ thống ({tracks.length} bài hát)</p>
                </div>

                {/* Thanh tìm kiếm nhanh */}
                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Tìm tên bài hát, nghệ sĩ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.05] rounded-full text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                    />
                    <span className="absolute left-3.5 top-3 text-slate-400 text-sm">
                        <svg
                            xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            className="lucide lucide-search"
                        >
                            <path d="m21 21-4.34-4.34"/>
                            <circle cx="11" cy="11" r="8"/>
                        </svg>
                    </span>
                </div>
            </div>

            {/* Xử lý trường hợp không tìm thấy kết quả phù hợp */}
            {filteredTracks.length === 0 ? (
                <div className="text-center py-20 bg-[#0f1722]/50 rounded-2xl border border-dashed border-white/[0.05]">
                    <p className="text-slate-500">Không tìm thấy bài hát nào phù hợp với từ khóa.</p>
                </div>
            ) : (
                /* Bảng danh sách bài hát chi tiết */
                <div className="overflow-x-auto bg-[#0f1722] rounded-2xl border border-white/[0.05] shadow-2xl backdrop-blur-md">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-white/[0.05] text-slate-400 text-xs font-bold uppercase tracking-wider bg-white/[0.02]">
                            <th className="p-4 w-16 text-center">#</th>
                            <th className="p-4">Thông tin bài hát</th>
                            <th className="p-4">Nghệ sĩ</th>
                            <th className="p-4">Album</th>
                            <th className="p-4">Thể loại</th>
                            <th className="p-4 text-center">Ngày đăng</th>
                            <th className="p-4 text-center">Thời lượng</th>
                            <th className="p-4 text-center">Lượt nghe</th>
                            <th className="p-4 w-20 text-center">Tương tác</th> {/* 🟢 Thêm cột tiêu đề Tương tác */}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03] text-sm text-slate-300">
                        {filteredTracks.map((track, index) => (
                            <tr
                                key={track.id}
                                className="hover:bg-white/[0.03] transition-colors duration-150 group"
                            >
                                {/* 1. Số thứ tự / Nút Play khi hover */}
                                <td className="p-4 text-center font-medium text-slate-500 group-hover:text-sky-400 transition-colors">
                                    <span className="group-hover:hidden">{index + 1}</span>
                                    <Play className="hidden group-hover:inline-block cursor-pointer w-4 h-4 text-sky-400 hover:scale-110 transition-transform ml-1" fill="currentColor" />
                                </td>

                                {/* 2. Ảnh & Tên bài hát */}
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={track.img ? `${S3_BASE_URL}${track.img}` : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80'}
                                            alt={track.name}
                                            className="w-11 h-11 object-cover rounded-lg shadow-md border border-white/[0.05]"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80';
                                            }}
                                        />
                                        <div className="max-w-[180px] md:max-w-[240px]">
                                            <div className="font-semibold text-white truncate group-hover:text-sky-400 transition-colors" title={track.name}>
                                                {track.name}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* 3. Danh sách các nghệ sĩ thể hiện */}
                                <td className="p-4 font-medium text-slate-300">
                                    {track.artists && track.artists.length > 0 ? (
                                        <span className="truncate block max-w-[150px]" title={track.artists.map(a => a.name).join(', ')}>
                                                {track.artists.map(a => a.name).join(', ')}
                                            </span>
                                    ) : (
                                        <span className="text-slate-500 italic">Ẩn danh</span>
                                    )}
                                </td>

                                {/* 4. Tên Album */}
                                <td className="p-4">
                                    {track.album ? (
                                        <div className="flex flex-col">
                                                <span className="text-slate-300 font-medium truncate max-w-[150px]" title={track.album.title}>
                                                    💿 {track.album.title}
                                                </span>
                                        </div>
                                    ) : (
                                        <span className="inline-block px-2 py-0.5 bg-white/[0.04] text-slate-400 text-xs rounded border border-white/[0.05] italic">
                                                Single
                                            </span>
                                    )}
                                </td>

                                {/* 5. Thể loại */}
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                                        {track.categories && track.categories.length > 0 ? (
                                            track.categories.map(c => (
                                                <span key={c.id} className="px-2 py-0.5 bg-white/[0.06] text-slate-300 text-xs rounded-md border border-white/[0.05]">
                                                        {c.name}
                                                    </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-600">--</span>
                                        )}
                                    </div>
                                </td>

                                {/* 6. Ngày đăng */}
                                <td className="p-4 text-center text-slate-400 text-xs">
                                    {track.uploadDate ? new Date(track.uploadDate).toLocaleDateString('vi-VN') : '---'}
                                </td>

                                {/* 7. Thời lượng bài hát */}
                                <td className="p-4 text-center text-slate-400 font-mono text-xs">
                                    {formatDuration(track.duration)}
                                </td>

                                {/* 8. Lượt nghe */}
                                <td className="p-4 text-center">
                                        <span className="px-2.5 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full text-xs font-bold font-mono">
                                            {track.viewCount?.toLocaleString() || 0}
                                        </span>
                                </td>

                                {/* 🟢 9. CỘT MỚI: Nút mở Modal tương tác phẳng (Ẩn mặc định, hiện khi Hover dòng) */}
                                <td className="p-4 text-center">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Ngăn hành động click trúng dòng
                                            // Chuẩn hóa lại object track để đảm bảo có đầy đủ .img hợp lệ gửi vào modal
                                            const normalizedTrack = {
                                                ...track,
                                                img: track.img ? `${S3_BASE_URL}${track.img}` : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80'
                                            };
                                            setSelectedTrack(normalizedTrack);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 text-[#b3b3b3] hover:text-sky-400 bg-transparent border-none cursor-pointer transition-all p-2 rounded-full hover:bg-white/[0.05]"
                                        title="Mở bảng tương tác (Thích, Bình luận, Playlist)"
                                    >
                                        <MessageSquare size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 🟢 RENDERING MODAL: Tự động hiển thị khi selectedTrack khác null */}
            {selectedTrack && (
                <TrackEngagementModal
                    track={selectedTrack}
                    onClose={() => setSelectedTrack(null)}
                />
            )}
        </div>
    );
};

export default AllTracksPage;