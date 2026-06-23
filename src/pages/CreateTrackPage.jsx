import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import trackService from "../features/tracks/trackService";
import categoryService from "../features/categories/categoryService";
import artistService from "../features/artists/artistService";
import {useAuthStore} from "../features/auth/useAuthStore.js";

export function CreateTrackPage() {
    const navigate = useNavigate();

    // --- 1. STATE LƯU DATA THẬT TỪ BACK-END ĐỔ VỀ ---
    const [dbCategories, setDbCategories] = useState([]); // Danh sách thể loại từ DB
    const [dbArtists, setDbArtists] = useState([]);       // Danh sách ca sĩ từ DB để chọn Feat

    // --- 2. CÁC STATE QUẢN LÝ DỮ LIỆU FORM ---
    const [title, setTitle] = useState("");
    const [albumId, setAlbumId] = useState("");
    const [categoryIds, setCategoryIds] = useState([]);
    const [selectedFeatArtists, setSelectedFeatArtists] = useState([]); // Lưu mảng các Object ca sĩ phụ: [{id: 1, name: 'Suboi'}]
    const [audioFile, setAudioFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const { username } = useAuthStore();

    // --- 3. USEEFFECT: GỌI API LẤY DATA THẬT KHI MỞ TRANG ---
    useEffect(() => {

        const fetchInitialData = async () => {
            try {
                // Gọi đồng thời cả 2 API lấy Thể loại và Ca sĩ
                const [categoriesRes, artistsRes] = await Promise.all([
                    categoryService.getAllCategories(),
                    artistService.getAllArtists() // 💡 Nếu bồ làm xong API /all thì đổi thành artistService.getAllArtistsWithoutPagination() nha
                ]);

                // Gán dữ liệu thật vào state categories
                setDbCategories(categoriesRes.data || categoriesRes);

                let artistList = [];

                // 🔥 XỬ LÝ LỖI SẬP MAP Ở ĐÂY:
                // Nếu artistsRes.data là Object phân trang, lấy mảng nằm trong .content, nếu không thì lấy mảng thuần
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

    // Xử lý chọn/bỏ chọn Thể loại nhạc (Checkbox)
    const handleCategoryChange = (id) => {
        if (categoryIds.includes(id)) {
            setCategoryIds(categoryIds.filter(item => item !== id));
        } else {
            setCategoryIds([...categoryIds, id]);
        }
    };

    // Xử lý khi chọn thêm một Ca sĩ hợp tác (Feat) từ Dropdown
    const handleAddFeatArtist = (e) => {
        const artistId = parseInt(e.target.value);
        if (!artistId) return;

        const artistObj = dbArtists.find(a => a.id === artistId);
        // Kiểm tra điều kiện để không thêm trùng ca sĩ phụ
        if (artistObj && !selectedFeatArtists.some(a => a.id === artistId)) {
            setSelectedFeatArtists([...selectedFeatArtists, artistObj]);
        }
        e.target.value = ""; // Reset trạng thái ô select về mặc định
    };

    // Xóa ca sĩ Feat khỏi danh sách đã chọn
    const handleRemoveFeatArtist = (id) => {
        setSelectedFeatArtists(selectedFeatArtists.filter(a => a.id !== id));
    };

    // --- 4. LUỒNG XỬ LÝ SUBMIT FORM GỬI LÊN BACK-END ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra nhanh các trường bắt buộc ở Client
        if (!audioFile) return alert("❌ Vui lòng chọn file âm thanh bài hát!");
        if (!coverImage) return alert("❌ Vui lòng chọn ảnh bìa bài hát!");
        if (categoryIds.length === 0) return alert("❌ Hãy chọn ít nhất một thể loại nhạc!");

        setLoading(true);

        const formData = new FormData();

        // 1. Đính kèm 2 RequestParam File
        formData.append("audioFile", audioFile);
        formData.append("coverImage", coverImage);

        // 2. Đính kèm TrackUploadDTO dữ liệu cơ bản
        formData.append("title", title);

        // *Lưu ý bảo mật: Không cần gửi artistId của ca sĩ chính, Back-end tự nhận diện qua SecurityContext
        if (albumId) {
            formData.append("albumId", parseInt(albumId));
        }

        // 3. Đính kèm mảng danh sách Thể loại (Category IDs)
        categoryIds.forEach(id => {
            formData.append("categoryIds", id);
        });

        // 4. Đính kèm mảng danh sách ID của các ca sĩ Feat phụ (artistIds)
        selectedFeatArtists.forEach(artist => {
            formData.append("artistIds", artist.id);
        });

        try {
            // Gửi dữ liệu FormData qua API
            await trackService.createTrack(formData);
            alert("🎉 Tải lên bài hát mới và đồng bộ AWS S3 thành công!");
            navigate("/tracks");
        } catch (error) {
            console.error("Lỗi đăng bài hát:", error);
            alert(`❌ Tải lên thất bại: ${error.response?.data?.message || "Vui lòng kiểm tra lại thông tin!"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-6">
            <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">

                <h2 className="text-2xl font-bold text-center text-emerald-500 mb-2">
                    Upload new track
                </h2>

                {/* Hiển thị thông tin nghệ sĩ đang đăng nhập */}
                <p className="text-zinc-500 text-sm text-center mb-6">
                    Nghệ sĩ đang đăng nhập:{" "}
                    <span className="text-emerald-400 font-semibold bg-zinc-800/50 px-2.5 py-1 rounded-md border border-zinc-800 ml-1">
                        {username ? username : "Đang tải..."}
                    </span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* 1. Tên bài hát */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Tên bài hát</label>
                        <input
                            type="text"
                            placeholder="Nhập tiêu đề bài hát..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    {/* 2. Nghệ sĩ hợp tác (Feat) - Dropdown data thật */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Nghệ sĩ hợp tác (Feat)</label>
                        <select
                            onChange={handleAddFeatArtist}
                            defaultValue=""
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                        >
                            <option value="" disabled>-- Chọn ca sĩ hợp tác (nếu có) --</option>
                            {Array.isArray(dbArtists) && dbArtists.map(artist => (
                                <option key={artist.id} value={artist.id}>{artist.name}</option>
                            ))}
                        </select>

                        {/* Danh sách Badge tên ca sĩ Feat */}
                        {selectedFeatArtists.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2.5">
                                {selectedFeatArtists.map(artist => (
                                    <span key={artist.id} className="inline-flex items-center gap-1.5 bg-zinc-800 text-zinc-200 text-xs font-medium px-3 py-1.5 rounded-full border border-zinc-700">
                                        Feat. {artist.name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFeatArtist(artist.id)}
                                            className="text-zinc-500 hover:text-red-400 font-bold ml-1 text-sm focus:outline-none"
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
                        <label className="block text-sm font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Thuộc Album ID (Nếu có)</label>
                        <input
                            type="number"
                            placeholder="Nhập ID Album nếu bài hát nằm trong Album"
                            value={albumId}
                            onChange={(e) => setAlbumId(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    {/* 4. Thể loại nhạc (Chọn nhiều từ DB) */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Thể loại nhạc (Chọn nhiều)</label>
                        <div className="flex flex-wrap gap-4 bg-zinc-800 p-4 rounded-lg border border-zinc-700 max-h-40 overflow-y-auto custom-scrollbar">
                            {dbCategories.length === 0 ? (
                                <p className="text-zinc-500 text-sm">Đang tải danh sách thể loại từ máy chủ...</p>
                            ) : (
                                dbCategories.map((cat) => (
                                    <label key={cat.id} className="flex items-center space-x-2 text-sm text-zinc-200 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={categoryIds.includes(cat.id)}
                                            onChange={() => handleCategoryChange(cat.id)}
                                            className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-zinc-900 border-zinc-600 cursor-pointer"
                                        />
                                        <span>{cat.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 5. File âm thanh bài hát */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">File âm thanh bài hát (.mp3, .wav)</label>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => setAudioFile(e.target.files[0])}
                            required
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-700 file:text-zinc-200 hover:file:bg-zinc-600 cursor-pointer"
                        />
                    </div>

                    {/* 6. File Ảnh bìa bài hát */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Ảnh bìa bài hát (Bắt buộc)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverImage(e.target.files[0])}
                            required
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-700 file:text-zinc-200 hover:file:bg-zinc-600 cursor-pointer"
                        />
                    </div>

                    {/* 7. Nhóm nút bấm điều hướng */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                        <button
                            type="button"
                            onClick={() => navigate("/tracks")}
                            disabled={loading}
                            className="px-5 py-2 rounded-full text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-full text-sm font-bold bg-emerald-500 text-black hover:bg-emerald-400 shadow-md transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Đang tải lên AWS S3..." : "Tải Lên Bài Hát"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}