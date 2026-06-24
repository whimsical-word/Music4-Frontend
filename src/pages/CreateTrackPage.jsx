import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import trackService from "../features/tracks/trackService";
import categoryService from "../features/categories/categoryService";
import artistService from "../features/artists/artistService";
import { useAuthStore } from "../features/auth/useAuthStore.js";

export function CreateTrackPage() {
    const navigate = useNavigate();

    // --- 1. STATE LƯU DATA THẬT TỪ BACK-END ĐỔ VỀ ---
    const [dbCategories, setDbCategories] = useState([]);
    const [dbArtists, setDbArtists] = useState([]);

    // --- 2. CÁC STATE QUẢN LÝ DỮ LIỆU FORM ---
    const [title, setTitle] = useState("");
    const [albumId, setAlbumId] = useState("");
    const [categoryIds, setCategoryIds] = useState([]);
    const [selectedFeatArtists, setSelectedFeatArtists] = useState([]);
    const [audioFile, setAudioFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // 🔥 Lấy thêm `id` từ AuthStore để làm Route Param khi điều hướng
    const { id, username } = useAuthStore();

    // --- 3. USEEFFECT: GỌI API LẤY DATA THẬT KHI MỞ TRANG ---
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [categoriesRes, artistsRes] = await Promise.all([
                    categoryService.getAllCategories(),
                    artistService.getAllArtists()
                ]);

                setDbCategories(categoriesRes.data || categoriesRes);

                let artistList = [];
                if (artistsRes.data) {
                    artistList = artistsRes.data.content || artistsRes.data;
                } else {
                    artistList = artistsRes.content || artistsRes;
                }
                setDbArtists(Array.isArray(artistList) ? artistList : []);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu từ hệ thống:", error);
            }
        };

        fetchInitialData();
    }, []);

    const handleCategoryChange = (id) => {
        if (categoryIds.includes(id)) {
            setCategoryIds(categoryIds.filter(item => item !== id));
        } else {
            setCategoryIds([...categoryIds, id]);
        }
    };

    const handleAddFeatArtist = (e) => {
        const artistId = parseInt(e.target.value);
        if (!artistId) return;

        const artistObj = dbArtists.find(a => a.id === artistId);
        if (artistObj && !selectedFeatArtists.some(a => a.id === artistId)) {
            setSelectedFeatArtists([...selectedFeatArtists, artistObj]);
        }
        e.target.value = "";
    };

    const handleRemoveFeatArtist = (id) => {
        setSelectedFeatArtists(selectedFeatArtists.filter(a => a.id !== id));
    };

    // --- 4. LUỒNG XỬ LÝ SUBMIT FORM GỬI LÊN BACK-END ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!audioFile) return alert("❌ Vui lòng chọn file âm thanh bài hát!");
        if (!coverImage) return alert("❌ Vui lòng chọn ảnh bìa bài hát!");
        if (categoryIds.length === 0) return alert("❌ Hãy chọn ít nhất một thể loại nhạc!");

        setLoading(true);

        const formData = new FormData();
        formData.append("audioFile", audioFile);
        formData.append("coverImage", coverImage);
        formData.append("title", title);

        if (albumId) {
            formData.append("albumId", parseInt(albumId));
        }

        categoryIds.forEach(id => {
            formData.append("categoryIds", id);
        });

        selectedFeatArtists.forEach(artist => {
            formData.append("artistIds", artist.id);
        });

        try {
            await trackService.createTrack(formData);
            alert("🎉 Tải lên bài hát mới và đồng bộ AWS S3 thành công!");

            // 🔥 Đã cập nhật: Điều hướng về trang cá nhân của nghệ sĩ vừa up
            navigate(`/artist/${id}`);

        } catch (error) {
            console.error("Lỗi đăng bài hát:", error);
            alert(`❌ Tải lên thất bại: ${error.response?.data?.message || "Vui lòng kiểm tra lại thông tin!"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0d131a] text-slate-100 flex items-center justify-center p-6">
            <div className="w-full max-w-xl bg-[#0f1722] border border-white/[0.05] rounded-xl p-8 shadow-2xl backdrop-blur-md">

                <h2 className="text-2xl font-black text-center bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-2">
                    Upload new track
                </h2>

                <p className="text-slate-400 text-sm text-center mb-6">
                    Nghệ sĩ đang đăng nhập:{" "}
                    <span className="text-sky-400 font-semibold bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.05] ml-1">
                        {username ? username : "Đang tải..."}
                    </span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* 1. Tên bài hát */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Tên bài hát</label>
                        <input
                            type="text"
                            placeholder="Nhập tiêu đề bài hát..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full bg-white/[0.04] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                        />
                    </div>

                    {/* 2. Nghệ sĩ hợp tác (Feat) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Nghệ sĩ hợp tác (Feat)</label>
                        <select
                            onChange={handleAddFeatArtist}
                            defaultValue=""
                            className="w-full bg-white/[0.04] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
                        >
                            <option value="" disabled className="bg-[#0f1722]">-- Chọn ca sĩ hợp tác (nếu có) --</option>
                            {Array.isArray(dbArtists) && dbArtists.map(artist => (
                                <option key={artist.id} value={artist.id} className="bg-[#0f1722]">{artist.name}</option>
                            ))}
                        </select>

                        {/* Danh sách Badge tên ca sĩ Feat */}
                        {selectedFeatArtists.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2.5">
                                {selectedFeatArtists.map(artist => (
                                    <span key={artist.id} className="inline-flex items-center gap-1.5 bg-white/[0.06] text-slate-200 text-xs font-medium px-3 py-1.5 rounded-full border border-white/[0.05]">
                                        Feat. {artist.name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFeatArtist(artist.id)}
                                            className="text-slate-400 hover:text-red-400 font-bold ml-1 text-sm focus:outline-none bg-transparent border-none cursor-pointer p-0"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 3. ID Album */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Thuộc Album ID (Nếu có)</label>
                        <input
                            type="number"
                            placeholder="Nhập ID Album nếu bài hát nằm trong Album"
                            value={albumId}
                            onChange={(e) => setAlbumId(e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                        />
                    </div>

                    {/* 4. Thể loại nhạc */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Thể loại nhạc (Chọn nhiều)</label>
                        <div className="flex flex-wrap gap-4 bg-white/[0.02] p-4 rounded-lg border border-white/[0.05] max-h-40 overflow-y-auto custom-scrollbar">
                            {dbCategories.length === 0 ? (
                                <p className="text-slate-500 text-sm">Đang tải danh sách thể loại từ máy chủ...</p>
                            ) : (
                                dbCategories.map((cat) => (
                                    <label key={cat.id} className="flex items-center space-x-2 text-sm text-slate-200 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={categoryIds.includes(cat.id)}
                                            onChange={() => handleCategoryChange(cat.id)}
                                            className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-[#0d131a] border-white/[0.1] cursor-pointer"
                                        />
                                        <span>{cat.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 5. File âm thanh bài hát */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">File âm thanh bài hát (.mp3, .wav)</label>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => setAudioFile(e.target.files[0])}
                            required
                            className="w-full bg-white/[0.04] border border-white/[0.05] rounded-lg px-2 py-1.5 text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white/[0.08] file:text-slate-200 hover:file:bg-white/[0.15] cursor-pointer transition-colors"
                        />
                    </div>

                    {/* 6. File Ảnh bìa bài hát */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Ảnh bìa bài hát (Bắt buộc)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverImage(e.target.files[0])}
                            required
                            className="w-full bg-white/[0.04] border border-white/[0.05] rounded-lg px-2 py-1.5 text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white/[0.08] file:text-slate-200 hover:file:bg-white/[0.15] cursor-pointer transition-colors"
                        />
                    </div>

                    {/* 7. Nhóm nút bấm điều hướng */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
                        <button
                            type="button"
                            onClick={() => navigate("/tracks")}
                            disabled={loading}
                            className="px-5 py-2 rounded-full text-sm font-medium bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] transition-colors border-none cursor-pointer"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-[0_4px_14px_rgba(14,165,233,0.3)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 border-none cursor-pointer"
                        >
                            {loading ? "Đang tải lên AWS S3..." : "Tải Lên Bài Hát"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}