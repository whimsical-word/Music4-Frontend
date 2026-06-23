import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, Image as ImageIcon, Music, Trash2, Plus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axiosClient from '../app/axios/axiosClient';
import { useAuthStore } from "../features/auth/useAuthStore";

const CreateAlbumPage = () => {
    const navigate = useNavigate();
    const { id } = useAuthStore();

    // --- State quản lý thông tin Album ---
    const [albumName, setAlbumName] = useState('');
    const [albumCoverFile, setAlbumCoverFile] = useState(null); // Lưu file thật để dành lúc bấm nút mới up
    const [albumCoverPreview, setAlbumCoverPreview] = useState(null);
    const [albumCoverProgress, setAlbumCoverProgress] = useState(0);

    // --- State lưu danh sách dữ liệu từ Backend ---
    const [dbArtists, setDbArtists] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Danh mục cứng để test
    const mockCategories = [
        { id: 1, name: 'Pop' }, { id: 2, name: 'Rock' }, { id: 3, name: 'Rap/HipHop' }, { id: 4, name: 'Ballad' }
    ];

    // --- Mảng Quản Lý Trạng Thái Bài Hát ---
    const [tracks, setTracks] = useState([]);

    // Lấy danh sách nghệ sĩ đổ vào Dropdown Feat Artist
    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const res = await axiosClient.get('/artists/all');
                setDbArtists(res.data || []);
            } catch (err) {
                console.error("Không lấy được danh sách ca sĩ:", err);
            }
        };
        fetchArtists();
    }, []);

    // 🌟 BƯỚC 1: Chọn ảnh bìa -> CHỈ LƯU LẠI FILE VÀ PREVIEW, CHƯA UPLOAD
    const handleAlbumCoverChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAlbumCoverFile(file);
        setAlbumCoverPreview(URL.createObjectURL(file));
        setAlbumCoverProgress(0); // Reset tiến trình về 0
    };

    // 🌟 BƯỚC 2: Chọn nhiều file nhạc -> CHỈ NẠP VÀO MẢNG STATE, CHƯA UPLOAD
    const handleMusicFilesSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newTracksEntries = files.map(file => {
            const trackId = Math.random().toString(36).substring(2, 9);

            return {
                id: trackId,
                title: file.name.replace(/\.[^/.]+$/, ""), // Tự lấy tên file làm tiêu đề gốc
                file: file, // 🔥 GIỮ LẠI FILE GỐC Ở ĐÂY ĐỂ DÀNH UPLOAD SAU
                duration: 0,
                artistId: id || 7, // Lấy ID nghệ sĩ đang đăng nhập
                artistIds: [],
                categoryIds: [],
                fileName: file.name,
                progress: 0,
                status: 'idle' // Trạng thái ban đầu là 'idle' (đang đợi)
            };
        });

        setTracks(prev => [...prev, ...newTracksEntries]);
    };

    // 🌟 BƯỚC 3: Cập nhật thông tin chữ nghĩa tự do khi người dùng chỉnh sửa trên UI
    const updateTrackMetadata = (trackId, field, value) => {
        setTracks(prev => prev.map(t => t.id === trackId ? { ...t, [field]: value } : t));
    };

    const handleCategoryToggle = (trackId, categoryId) => {
        setTracks(prev => prev.map(t => {
            if (t.id === trackId) {
                const currentCats = [...t.categoryIds];
                const index = currentCats.indexOf(categoryId);
                if (index > -1) currentCats.splice(index, 1);
                else currentCats.push(categoryId);
                return { ...t, categoryIds: currentCats };
            }
            return t;
        }));
    };

    const handleFeatArtistsChange = (trackId, options) => {
        const selectedIds = Array.from(options).map(opt => parseInt(opt.value));
        updateTrackMetadata(trackId, 'artistIds', selectedIds);
    };

    const removeTrackRow = (trackId) => {
        setTracks(prev => prev.filter(t => t.id !== trackId));
    };

    // 🌟 BƯỚC 4: KHI BẤM PHÁT HÀNH -> MỚI BẮT ĐẦU KÍCH HOẠT LÊN S3 MỘT LOẠT
    const handlePublishAlbum = async (e) => {
        e.preventDefault();

        if (!albumName.trim() || !albumCoverFile) {
            alert("Vui lòng điền tên Album và chọn ảnh bìa!");
            return;
        }

        if (tracks.length === 0) {
            alert("Album phải có ít nhất một bài hát!");
            return;
        }

        try {
            setIsSubmitting(true);

            // === PHẦN I: UPLOAD ẢNH BÌA LÊN S3 TRƯỚC ===
            let finalCoverKey = "";
            setAlbumCoverProgress(1); // Bật trạng thái đang up ảnh bìa

            const coverFormData = new FormData();
            coverFormData.append('file', albumCoverFile);
            coverFormData.append('type', 'images');

            const coverRes = await axiosClient.post('/tracks/upload-temp', coverFormData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setAlbumCoverProgress(percent);
                }
            });
            finalCoverKey = coverRes.data.s3Key;


            // === PHẦN II: UPLOAD TUẦN TỰ TỪNG BÀI HÁT TRONG DANH SÁCH ===
            const cleanTracksPayload = [];

            // Sử dụng vòng lặp for...of để đẩy từng bài lên (Tránh bị nghẽn băng thông mạng nếu đẩy cùng lúc quá nhiều file dung lượng lớn)
            for (let track of tracks) {
                // Cập nhật giao diện bài này đang được upload
                setTracks(prev => prev.map(t => t.id === track.id ? { ...t, status: 'uploading', progress: 1 } : t));

                const trackFormData = new FormData();
                trackFormData.append('file', track.file); // Lấy file thật đã giữ lại ở Bước 2 ra up
                trackFormData.append('type', 'tracks');

                try {
                    const trackRes = await axiosClient.post('/tracks/upload-temp', trackFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        onUploadProgress: (progressEvent) => {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setTracks(prev => prev.map(t => t.id === track.id ? { ...t, progress: percent } : t));
                        }
                    });

                    // Đánh dấu bài hát này up thành công trên UI
                    setTracks(prev => prev.map(t => t.id === track.id ? { ...t, status: 'success', progress: 100 } : t));

                    // Đóng gói dữ liệu sạch chuẩn bị gửi JSON Bulk
                    cleanTracksPayload.push({
                        title: track.title,
                        audioFileKey: trackRes.data.s3Key, // Lấy S3 Key vừa sinh ra
                        duration: trackRes.data.duration || 0, // Lấy thời lượng Backend đo được
                        artistId: track.artistId,
                        artistIds: track.artistIds,
                        categoryIds: track.categoryIds
                    });

                } catch (trackError) {
                    // Nếu có 1 bài lỗi, đánh dấu đỏ trên UI và dừng tiến trình phát hành để đảm bảo tính an toàn dữ liệu
                    setTracks(prev => prev.map(t => t.id === track.id ? { ...t, status: 'error', progress: 0 } : t));
                    throw new Error(`Lỗi khi tải bài hát: ${track.fileName}`);
                }
            }


            // === PHẦN III: TẠO ALBUM TRONG DATABASE VÀ HOÀN TẤT ===
            // 1. Tạo Album lấy albumId
            const albumFormData = new FormData();
            albumFormData.append('albumTitle', albumName);
            albumFormData.append('artistId', id);
            albumFormData.append('coverImageKey', finalCoverKey);

            const albumRes = await axiosClient.post('/albums', albumFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const generatedAlbumId = albumRes.data.id;

            // 2. Gom tất cả ném vào API Bulk-Json
            const finalBulkPayload = {
                albumId: generatedAlbumId,
                coverImageKey: finalCoverKey,
                tracks: cleanTracksPayload
            };

            await axiosClient.post('/tracks/bulk-json', finalBulkPayload);

            alert("🎉 Đỉnh cao bồ ơi! Album và toàn bộ danh sách nhạc đã được phát hành thành công mà không tốn 1MB bộ nhớ rác nào!");
            navigate('/artists');

        } catch (error) {
            console.error("Lỗi trong quá trình phát hành:", error);
            alert(error.message || "Phát hành thất bại, bồ vui lòng kiểm tra lại kết nối mạng hệ thống nha!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#121212] min-h-screen text-white p-8 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* Tiêu đề trang */}
                <div className="flex items-center gap-3 mb-8 border-b border-[#232323] pb-4">
                    <FolderPlus size={36} className="text-emerald-500" />
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Studio Phát Hành Album</h1>
                        <p className="text-xs text-[#a7a7a7]">Luồng lưu trữ thông minh: Tiết kiệm băng thông, chống file rác AWS S3</p>
                    </div>
                </div>

                <form onSubmit={handlePublishAlbum} className="space-y-8">

                    {/* KHỐI THÔNG TIN ALBUM VÀ ẢNH BÌA */}
                    <div className="bg-[#181818] p-6 rounded-2xl border border-[#282828] grid grid-cols-1 md:grid-cols-4 gap-6 items-center">

                        <div className="flex flex-col items-center">
                            <div className="w-40 aspect-square bg-[#282828] rounded-xl border-2 border-dashed border-[#404040] relative overflow-hidden group flex items-center justify-center cursor-pointer">
                                {albumCoverPreview ? (
                                    <>
                                        <img src={albumCoverPreview} alt="Preview" className="w-full h-full object-cover" />
                                        {isSubmitting && albumCoverProgress < 100 && (
                                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs font-bold">
                                                Đang tải... {albumCoverProgress}%
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center p-2 text-gray-400">
                                        <ImageIcon size={32} className="mx-auto mb-1 text-emerald-500" />
                                        <span className="text-[11px] block">Chọn ảnh bìa Album</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" disabled={isSubmitting} onChange={handleAlbumCoverChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                            {albumCoverProgress === 100 && <span className="text-[10px] text-emerald-500 font-bold mt-1">✓ Đã lên Cloud</span>}
                        </div>

                        <div className="md:col-span-3 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Tên Album</label>
                                <input
                                    type="text"
                                    required
                                    disabled={isSubmitting}
                                    placeholder="Nhập tên đĩa nhạc của bồ..."
                                    value={albumName}
                                    onChange={(e) => setAlbumName(e.target.value)}
                                    className="w-full bg-[#282828] border border-transparent focus:border-emerald-500 rounded-xl px-4 py-3 text-white text-lg font-bold outline-none transition-all disabled:opacity-50"
                                />
                            </div>

                            {/* NÚT CHỌN FILE NHẠC */}
                            <div className="relative inline-block">
                                <button type="button" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 font-bold px-5 py-2.5 rounded-full text-sm flex items-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50">
                                    <Plus size={16} /> Chọn bài hát từ máy (Giữ Ctrl chọn nhiều file)
                                </button>
                                <input
                                    type="file"
                                    multiple
                                    accept="audio/*"
                                    disabled={isSubmitting}
                                    onChange={handleMusicFilesSelect}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* DANH SÁCH BÀI HÁT TRONG HÀNG ĐỢI THIẾT LẬP */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Music size={22} className="text-emerald-500" /> Bản ghi trong hàng đợi thiết lập ({tracks.length})
                        </h3>

                        {tracks.length === 0 && (
                            <div className="border border-[#282828] bg-[#181818] p-12 text-center rounded-2xl text-gray-500">
                                <Music size={48} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Chưa có bài hát nào được nạp. Hãy chọn file nhạc ở phía trên bồ nhé!</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {tracks.map((track, index) => (
                                <div key={track.id} className="bg-[#181818] border border-[#282828] rounded-xl p-5 space-y-4 shadow-lg relative group">

                                    {/* Hàng thanh trạng thái tiến trình (Chỉ thực sự chạy % khi bấm nút Phát hành) */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#282828] pb-2.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="bg-[#282828] w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-emerald-400">{index + 1}</span>
                                            <p className="text-xs text-gray-400 font-mono truncate">Tệp: {track.fileName}</p>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-64">
                                            <div className="w-full bg-[#282828] h-2 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-300 ${track.status === 'success' ? 'bg-emerald-500' : track.status === 'error' ? 'bg-red-500' : track.status === 'uploading' ? 'bg-blue-500' : 'bg-gray-600'}`}
                                                    style={{ width: `${track.status === 'idle' ? 0 : track.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-mono font-bold whitespace-nowrap min-w-[36px] text-right">
                                                {track.status === 'idle' && <span className="text-gray-500 text-[10px]">Đang chờ...</span>}
                                                {track.status === 'uploading' && `${track.progress}%`}
                                                {track.status === 'success' && <CheckCircle size={14} className="inline text-emerald-500" />}
                                                {track.status === 'error' && <AlertCircle size={14} className="inline text-red-500" />}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Điền thông tin Meta Data (Người dùng điền thoải mái lúc nào cũng được) */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Tiêu đề hiển thị</label>
                                            <input
                                                type="text"
                                                disabled={isSubmitting}
                                                value={track.title}
                                                onChange={(e) => updateTrackMetadata(track.id, 'title', e.target.value)}
                                                className="w-full bg-[#282828] border border-transparent focus:border-emerald-500 rounded-lg px-3 py-2 text-white text-sm outline-none transition-all disabled:opacity-50"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Ca Sĩ Hợp Tác (Feat)</label>
                                            <select
                                                multiple
                                                disabled={isSubmitting}
                                                value={track.artistIds.map(String)}
                                                onChange={(e) => handleFeatArtistsChange(track.id, e.target.selectedOptions)}
                                                className="w-full bg-[#282828] border border-transparent focus:border-emerald-500 rounded-lg px-2 py-1 text-white text-xs outline-none h-[38px] overflow-y-auto disabled:opacity-50"
                                            >
                                                {dbArtists.map(art => (
                                                    <option key={art.id} value={art.id} className="py-0.5">
                                                        {art.name || art.stageName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Thể loại phân phối</label>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {mockCategories.map(cat => {
                                                    const isChecked = track.categoryIds.includes(cat.id);
                                                    return (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            disabled={isSubmitting}
                                                            onClick={() => handleCategoryToggle(track.id, cat.id)}
                                                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all border-none cursor-pointer disabled:opacity-50 ${isChecked ? 'bg-emerald-500 text-black font-bold' : 'bg-[#282828] text-gray-400 hover:bg-[#333]'}`}
                                                        >
                                                            {cat.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nút hủy hàng nhạc */}
                                    {!isSubmitting && (
                                        <button
                                            type="button"
                                            onClick={() => removeTrackRow(track.id)}
                                            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 p-1.5 rounded-lg hover:bg-[#282828] transition-colors border-none bg-transparent cursor-pointer"
                                            title="Hủy bài hát này"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* NÚT PHÁT HÀNH CUỐI CÙNG */}
                    <div className="flex justify-end pt-4 border-t border-[#232323]">
                        <button
                            type="submit"
                            disabled={isSubmitting || tracks.length === 0}
                            className="bg-emerald-500 hover:bg-emerald-600 text-black font-black px-10 py-4 rounded-full text-base tracking-wide transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2 border-none cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Đang truyền tải lên Cloud S3...
                                </>
                            ) : (
                                "Phát Hành Album Toàn Cầu"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAlbumPage;