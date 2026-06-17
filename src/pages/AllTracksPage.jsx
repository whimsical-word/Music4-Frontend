import React, { useEffect, useState } from 'react';
import trackService from '../features/tracks/trackService';
import { Play } from "lucide-react";

const AllTracksPage = () => {
    const [tracks, setTracks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
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

    // 2. Hàm helper đổi số giây thành định dạng phút:giây (ví dụ: 223s -> 3:43)
    const formatDuration = (seconds) => {
        if (!seconds) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // 3. Hàm lọc bài hát theo ô tìm kiếm (Tìm theo Tên bài hát hoặc Tên nghệ sĩ)
    const filteredTracks = tracks.filter(track => {
        const nameMatch = track.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const artistMatch = track.artists?.some(artist =>
            artist.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return nameMatch || artistMatch;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-zinc-950 text-zinc-400">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mr-3"></div>
                <span>Đang tải danh sách bài hát...</span>
            </div>
        );
    }

    return (
        <div className="p-8 text-white bg-zinc-950 min-h-screen">
            {/* Header của trang */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-100">Tất Cả Bài Hát</h1>
                    <p className="text-zinc-400 text-sm mt-1">Quản lý và xem chi tiết kho nhạc hệ thống ({tracks.length} bài hát)</p>
                </div>

                {/* Thanh tìm kiếm nhanh */}
                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Tìm tên bài hát, nghệ sĩ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <span className="absolute left-3.5 top-2.5 text-zinc-500 text-sm"><svg
                        xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        className="lucide lucide-search-icon lucide-search"><path d="m21 21-4.34-4.34"/><circle cx="11"
                                                                                                                cy="11"
                                                                                                                r="8"/></svg></span>
                </div>
            </div>

            {/* Xử lý trường hợp không tìm thấy kết quả phù hợp */}
            {filteredTracks.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800">
                    <p className="text-zinc-500">Không tìm thấy bài hát nào phù hợp với từ khóa.</p>
                </div>
            ) : (
                /* Bảng danh sách bài hát chi tiết */
                <div className="overflow-x-auto bg-zinc-900/40 rounded-2xl border border-zinc-800 shadow-xl backdrop-blur-md">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 text-xs font-semibold uppercase tracking-wider bg-zinc-900/80">
                            <th className="p-4 w-16 text-center">#</th>
                            <th className="p-4">Thông tin bài hát</th>
                            <th className="p-4">Nghệ sĩ</th>
                            <th className="p-4">Album</th>
                            <th className="p-4">Thể loại</th>
                            <th className="p-4 text-center">Ngày đăng</th>
                            <th className="p-4 text-center">Thời lượng</th>
                            <th className="p-4 text-center">Lượt nghe</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60 text-sm text-zinc-300">
                        {filteredTracks.map((track, index) => (
                            <tr
                                key={track.id}
                                className="hover:bg-zinc-800/30 transition-colors duration-150 group"
                            >
                                {/* 1. Số thứ tự / Nút Play giả lập khi hover */}
                                <td className="p-4 text-center font-medium text-zinc-500 group-hover:text-blue-800 transition-colors">
                                    <span className="group-hover:hidden">{index + 1}</span>
                                    <Play className="hidden group-hover:inline-block cursor-pointer w-5 h-5 text-blue-800 hover:scale-110 transition-transform" />                                </td>

                                {/* 2. Ảnh & Tên bài hát */}
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            /* Tiến hành nối chuỗi S3_BASE_URL + track.img */
                                            src={track.img ? `${S3_BASE_URL}${track.img}` : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80'}
                                            alt={track.name}
                                            className="w-11 h-11 object-cover rounded-lg shadow-md border border-zinc-800"
                                            onError={(e) => {
                                                // Phòng trường hợp một số bài hát cũ chưa có ảnh hoặc link lỗi,
                                                // tự động thế bằng ảnh placeholder đĩa nhạc mặc định này để không bị vỡ giao diện
                                                e.target.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80';
                                            }}
                                        />
                                        <div className="max-w-[180px] md:max-w-[240px]">
                                            <div className="font-semibold text-zinc-100 truncate group-hover:text-blue-700 transition-colors" title={track.name}>
                                                {track.name}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* 3. Danh sách các nghệ sĩ thể hiện */}
                                <td className="p-4 font-medium text-zinc-200">
                                    {track.artists && track.artists.length > 0 ? (
                                        <span className="truncate block max-w-[150px]" title={track.artists.map(a => a.name).join(', ')}>
                                                {track.artists.map(a => a.name).join(', ')}
                                            </span>
                                    ) : (
                                        <span className="text-zinc-600 italic">Ẩn danh</span>
                                    )}
                                </td>

                                {/* 4. Tên Album (Xử lý null hoàn hảo) */}
                                <td className="p-4">
                                    {track.album ? (
                                        <div className="flex flex-col">
                                                <span className="text-zinc-300 font-medium truncate max-w-[150px]" title={track.album.title}>
                                                    💿 {track.album.title}
                                                </span>
                                        </div>
                                    ) : (
                                        <span className="inline-block px-2 py-0.5 bg-zinc-800/60 text-zinc-500 text-xs rounded border border-zinc-700/50 italic">
                                                Single
                                            </span>
                                    )}
                                </td>

                                {/* 5. Thể loại (Render thành các tag nhỏ gọn) */}
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                                        {track.categories && track.categories.length > 0 ? (
                                            track.categories.map(c => (
                                                <span key={c.id} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded-md border border-zinc-700/30">
                                                        {c.name}
                                                    </span>
                                            ))
                                        ) : (
                                            <span className="text-zinc-600">--</span>
                                        )}
                                    </div>
                                </td>

                                {/* 6. Ngày đăng */}
                                <td className="p-4 text-center text-zinc-400 text-xs">
                                    {track.uploadDate ? new Date(track.uploadDate).toLocaleDateString('vi-VN') : '---'}
                                </td>

                                {/* 7. Thời lượng bài hát */}
                                <td className="p-4 text-center text-zinc-400 font-mono text-xs">
                                    {formatDuration(track.duration)}
                                </td>

                                {/* 8. Lượt nghe (View Count) */}
                                <td className="p-4 text-center">
                                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
                                            {track.viewCount?.toLocaleString() || 0}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AllTracksPage;