import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // 🔥 Dùng cả useLocation để nhận data edit
import axiosClient from "../app/axios/axiosClient"; // 🔥 Gọi API trực tiếp qua axiosClient
import categoryService from "../features/categories/categoryService";
import artistService from "../features/artists/artistService";
import { useAuthStore } from "../features/auth/useAuthStore.js";
import { Search, X } from "lucide-react";

export function CreateTrackPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // 🔍 KIỂM TRA CHẾ ĐỘ: EDIT HAY CREATE MỚI
    const editTrackData = location.state?.editTrackData;
    const isEditMode = !!editTrackData;

    // --- 1. STATE LƯU DATA TỪ BACK-END ĐỔ VỀ ---
    const [dbCategories, setDbCategories] = useState([]);
    const [dbArtists, setDbArtists] = useState([]);

    // --- 2. CÁC STATE QUẢN LÝ DỮ LIỆU FORM (Khớp 100% với TrackUploadDTO) ---
    const [title, setTitle] = useState(editTrackData?.title || "");
    const [albumId, setAlbumId] = useState(editTrackData?.albumId || "");
    const [duration, setDuration] = useState(editTrackData?.duration || 0); // 🔥 Thêm duration quản lý thời lượng
    const [categoryIds, setCategoryIds] = useState([]);
    const [selectedFeatArtists, setSelectedFeatArtists] = useState([]);
    const [audioFile, setAudioFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // State phục vụ Searchable Dropdown
    const [artistSearch, setArtistSearch] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Lấy thông tin nghệ sĩ đang đăng nhập từ AuthStore
    const { id, username } = useAuthStore();

    // --- 3. USEEFFECT: LOAD DANH SÁCH THỂ LOẠI & NGHỆ SĨ KHI MỞ TRANG ---
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [categoriesRes, artistsRes] = await Promise.all([
                    categoryService.getAllCategories(),
                    artistService.getAllArtistsNoPageable()
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

    // --- 4. USEEFFECT LẤY CHI TIẾT BÀI HÁT CŨ NẾU LÀ CHẾ ĐỘ EDIT ---
    useEffect(() => {
        const fetchFullTrackDetails = async () => {
            if (isEditMode && editTrackData?.id) {
                try {
                    console.log("🛠️ Đang tải chi tiết bài hát cũ, ID:", editTrackData.id);
                    const res = await axiosClient.get(`/tracks/${editTrackData.id}`);
                    const fullTrack = res.data || res;

                    if (fullTrack) {
                        setTitle(fullTrack.title || fullTrack.name || "");
                        setAlbumId(fullTrack.albumId || fullTrack.album?.id || "");
                        setDuration(fullTrack.duration || 0);

                        // Đồng bộ danh sách ID thể loại nhạc cũ
                        if (fullTrack.categories) {
                            const ids = fullTrack.categories.map(cat => typeof cat === 'object' ? cat.id : cat);
                            setCategoryIds(ids);
                        }

                        // Đồng bộ nghệ sĩ hợp tác cũ (loại bỏ chính mình ra khỏi danh sách Feat)
                        if (fullTrack.artists) {
                            const featList = fullTrack.artists.filter(artist => Number(artist.id) !== Number(id));
                            setSelectedFeatArtists(featList);
                        }
                    }
                } catch (error) {
                    console.error("❌ Lỗi hiển thị dữ liệu bài hát cũ:", error);
                }
            }
        };

        fetchFullTrackDetails();
    }, [editTrackData, isEditMode, id]);

    // Tự động đóng dropdown tìm kiếm nghệ sĩ khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Logic tick chọn/bỏ chọn thể loại nhạc
    const handleCategoryChange = (catId) => {
        if (categoryIds.includes(catId)) {
            setCategoryIds(categoryIds.filter(item => item !== catId));
        } else {
            setCategoryIds([...categoryIds, catId]);
        }
    };

    // Logic thêm nghệ sĩ hợp tác từ Dropdown gợi ý
    const handleSelectArtist = (artistObj) => {
        if (artistObj && !selectedFeatArtists.some(a => a.id === artistObj.id)) {
            setSelectedFeatArtists([...selectedFeatArtists, artistObj]);
        }
        setArtistSearch("");
        setIsDropdownOpen(false);
    };

    // Logic gỡ nghệ sĩ hợp tác khỏi danh sách
    const handleRemoveFeatArtist = (artistId) => {
        setSelectedFeatArtists(selectedFeatArtists.filter(a => a.id !== artistId));
    };

    // Lọc danh sách gợi ý nghệ sĩ dựa theo chữ nhập ô search
    const filteredArtists = dbArtists.filter(artist =>
        artist.name.toLowerCase().includes(artistSearch.toLowerCase()) &&
        !selectedFeatArtists.some(selected => selected.id === artist.id) &&
        Number(artist.id) !== Number(id) // Không hiển thị chính mình trong danh sách Feat
    );

    // --- 5. LUỒNG XỬ LÝ SUBMIT FORM (KHỚP HOÀN TOÀN VỚI TRACKUPLOADDTO) ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra điều kiện bắt buộc khi tạo mới
        if (!isEditMode && !audioFile) return alert("❌ Vui lòng chọn file âm thanh bài hát!");
        if (!isEditMode && !coverImage) return alert("❌ Vui lòng chọn ảnh bìa bài hát!");
        if (categoryIds.length === 0) return alert("❌ Hãy chọn ít nhất một thể loại nhạc!");

        setLoading(true);

        // Khởi tạo Multipart FormData gửi lên Backend @ModelAttribute
        const formData = new FormData();
        formData.append("title", title);
        formData.append("artistId", parseInt(id)); // Gửi ID nghệ sĩ đang đăng nhập
        formData.append("duration", parseInt(duration)); // Gửi thời lượng bài hát

        if (albumId) {
            formData.append("albumId", parseInt(albumId));
        }

        // Đóng gói mảng danh mục thể loại (categoryIds)
        categoryIds.forEach(catId => {
            formData.append("categoryIds", catId);
        });

        if (selectedFeatArtists.length === 0) formData.append("artistIds", "");
        // Đóng gói mảng danh sách ID ca sĩ hợp tác (artistIds)
        selectedFeatArtists.forEach(artist => {
            formData.append("artistIds", artist.id);
        });

        // Chỉ thêm file vào form nếu có lựa chọn file mới
        if (audioFile) formData.append("audioFile", audioFile);
        if (coverImage) formData.append("coverImage", coverImage);

        try {
            if (isEditMode) {
                console.log("🚀 Đang gửi PUT Multipart cập nhật dữ liệu...");
                await axiosClient.post(`/tracks/update/${editTrackData.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                alert("🎉 Cập nhật thông tin bài hát thành công!");
            } else {
                console.log("🚀 Đang gửi POST Multipart tải lên bài hát mới...");
                await axiosClient.post("/tracks", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                alert("🎉 Tải lên bài hát mới thành công!");
            }
            // Thành công quay về trang profile nghệ sĩ
            navigate(`/artist/${id}`);
        } catch (error) {
            console.error("❌ Lỗi xử lý thông tin bài hát:", error);
            alert(`❌ Thao tác thất bại: ${error.response?.data?.message || "Vui lòng kiểm tra log console Backend!"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0d131a] text-slate-100 flex items-center justify-center p-6">
            <div className="w-full max-w-xl bg-[#0f1722] border border-white/[0.05] rounded-xl p-8 shadow-2xl backdrop-blur-md">

                <h2 className="text-2xl font-black text-center bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-2">
                    {isEditMode ? "Cập nhật bài hát" : "Upload new track"}
                </h2>

                <p className="text-slate-400 text-sm text-center mb-6">
                    Nghệ sĩ xử lý:{" "}
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

                    {/* 2. Nghệ sĩ hợp tác (Feat) - Searchable Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Nghệ sĩ hợp tác (Feat)</label>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder={selectedFeatArtists.length > 0 ? "Tìm thêm ca sĩ hợp tác khác..." : "Gõ để tìm kiếm ca sĩ hợp tác..."}
                                value={artistSearch}
                                onChange={(e) => {
                                    setArtistSearch(e.target.value);
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                className="w-full bg-white/[0.04] border border-white/[0.05] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                            />
                            <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                                <Search size={16} />
                            </div>
                            {artistSearch && (
                                <button
                                    type="button"
                                    onClick={() => setArtistSearch("")}
                                    className="absolute right-3.5 bg-transparent border-none text-slate-400 hover:text-white cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1.5 bg-[#131c26] border border-white/[0.08] rounded-lg shadow-2xl max-h-56 overflow-y-auto left-0">
                                {filteredArtists.length === 0 ? (
                                    <div className="p-3 text-sm text-slate-500 text-center">
                                        Không tìm thấy nghệ sĩ nào hợp lệ
                                    </div>
                                ) : (
                                    filteredArtists.map((artist) => (
                                        <div
                                            key={artist.id}
                                            onClick={() => handleSelectArtist(artist)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-sky-600/20 hover:text-sky-400 cursor-pointer transition-colors"
                                        >
                                            <span className="font-medium">{artist.name}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {selectedFeatArtists.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2.5">
                                {selectedFeatArtists.map(artist => (
                                    <span key={artist.id} className="inline-flex items-center gap-1.5 bg-sky-500/10 text-sky-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-sky-500/20">
                                        Feat. {artist.name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFeatArtist(artist.id)}
                                            className="text-sky-400/60 hover:text-red-400 font-bold ml-1 text-sm bg-transparent border-none cursor-pointer p-0 flex items-center"
                                        >
                                            <X size={12} />
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
                        <div className="flex flex-wrap gap-4 bg-white/[0.02] p-4 rounded-lg border border-white/[0.05] max-h-40 overflow-y-auto">
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
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                            File âm thanh bài hát (.mp3, .wav) {isEditMode && <span className="text-amber-500/80 font-normal text-xs lowercase">(Không chọn nếu giữ file cũ)</span>}
                        </label>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => setAudioFile(e.target.files[0])}
                            required={!isEditMode} // 🔥 CHỈ BẮT BUỘC KHI TẠO MỚI
                            className="w-full bg-white/[0.04] border border-white/[0.05] rounded-lg px-2 py-1.5 text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white/[0.08] file:text-slate-200 hover:file:bg-white/[0.15] cursor-pointer transition-colors"
                        />
                    </div>

                    {/* 6. File Ảnh bìa bài hát */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                            Ảnh bìa bài hát {isEditMode && <span className="text-amber-500/80 font-normal text-xs lowercase">(Không chọn nếu giữ ảnh cũ)</span>}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverImage(e.target.files[0])}
                            required={!isEditMode} // 🔥 CHỈ BẮT BUỘC KHI TẠO MỚI
                            className="w-full bg-white/[0.04] border border-white/[0.05] rounded-lg px-2 py-1.5 text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white/[0.08] file:text-slate-200 hover:file:bg-white/[0.15] cursor-pointer transition-colors"
                        />
                    </div>

                    {/* 7. Nhóm nút bấm điều hướng */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
                        <button
                            type="button"
                            onClick={() => navigate(`/artist/${id}`)}
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
                            {loading ? "Đang xử lý..." : isEditMode ? "Lưu Thay Đổi" : "Tải Lên Bài Hát"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}