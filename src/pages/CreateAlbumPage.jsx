import React, {useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import {
    FolderPlus,
    Image as ImageIcon,
    Music,
    Trash2,
    Plus,
    CheckCircle,
    AlertCircle,
    Loader2, Search, X,
} from "lucide-react";
import axiosClient from "../app/axios/axiosClient";
import { useAuthStore } from "../features/auth/useAuthStore";

const CreateAlbumPage = () => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();

  // --- State quản lý thông tin Album ---
  const [albumName, setAlbumName] = useState("");
  const [albumCoverFile, setAlbumCoverFile] = useState(null); // Lưu file thật để dành lúc bấm nút mới up
  const [albumCoverPreview, setAlbumCoverPreview] = useState(null);
  const [albumCoverProgress, setAlbumCoverProgress] = useState(0);


    // Thay thế hoặc bổ sung các state này vào component
    const [artistSearch, setArtistSearch] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleRemoveFeatArtist = (artistId) => {
        setSelectedFeatArtists(selectedFeatArtists.filter(a => a.id !== artistId));
    };

    // Logic chọn nghệ sĩ (cập nhật cho từng track)
    const addFeatArtist = (trackId, artist) => {
        setTracks((prev) =>
            prev.map((t) => {
                if (t.id === trackId && !t.artistIds.includes(artist.id)) {
                    return { ...t, artistIds: [...t.artistIds, artist.id] };
                }
                return t;
            })
        );
    };

    // Logic xóa nghệ sĩ
    const removeFeatArtist = (trackId, artistId) => {
        setTracks((prev) =>
            prev.map((t) => {
                if (t.id === trackId) {
                    return { ...t, artistIds: t.artistIds.filter((id) => id !== artistId) };
                }
                return t;
            })
        );
    };

  // --- State lưu danh sách dữ liệu từ Backend ---
  const [dbArtists, setDbArtists] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);

  // Danh mục cứng để test
  const mockCategories = [
    { id: 1, name: "Pop" },
    { id: 2, name: "Rock" },
    { id: 3, name: "Rap/HipHop" },
    { id: 4, name: "Ballad" },
  ];

  // --- Mảng Quản Lý Trạng Thái Bài Hát ---
  const [tracks, setTracks] = useState([]);

    const dropdownRef = useRef(null);
    const albumDropdownRef = useRef(null);
    const [isAlbumDropdownOpen, setIsAlbumDropdownOpen] = useState(false);
    const [selectedFeatArtists, setSelectedFeatArtists] = useState([]);
    const [activeDropdownId, setActiveDropdownId] = useState(null);

    const filteredArtists = dbArtists.filter(artist =>
        artist.name.toLowerCase().includes(artistSearch.toLowerCase()) &&
        !selectedFeatArtists.some(selected => selected.id === artist.id) &&
        Number(artist.id) !== Number(userId) // Không hiển thị chính mình trong danh sách Feat
    );

    const handleSelectArtist = (artistObj) => {
        if (artistObj && !selectedFeatArtists.some(a => a.id === artistObj.id)) {
            setSelectedFeatArtists([...selectedFeatArtists, artistObj]);
        }
        setArtistSearch("");
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Nếu click ra ngoài dropdown thì reset state
            if (activeDropdownId !== null && !event.target.closest('.relative')) {
                setActiveDropdownId(null);
                setArtistSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activeDropdownId]);

  // Lấy danh sách nghệ sĩ đổ vào Dropdown Feat Artist
  useEffect(() => {
    const fetchArtists = async () => {
      try {
          const catRes = await axiosClient.get("/categories"); // Thay đổi đường dẫn nếu cần
          setCategories(catRes.data || []);
        const res = await axiosClient.get("/artists/all");
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

      const newTracksEntries = files.map((file) => {
          const trackId = Math.random().toString(36).substring(2, 9);

          return {
              id: trackId,
              title: file.name.replace(/\.[^/.]+$/, ""),
              file: file,
              duration: 0,
              artistId: userId || 7,
              artistIds: [],      // Dùng để gửi ID lên Backend
              featArtists: [],    // 🔥 THÊM TRƯỜNG NÀY: Dùng để lưu Object {id, name} hiển thị trên UI
              categoryIds: [],
              fileName: file.name,
              progress: 0,
              status: "idle",
          };
      });

      setTracks((prev) => [...prev, ...newTracksEntries]);
  };

  // 🌟 BƯỚC 3: Cập nhật thông tin chữ nghĩa tự do khi người dùng chỉnh sửa trên UI
  const updateTrackMetadata = (trackId, field, value) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, [field]: value } : t)),
    );
  };

  const handleCategoryToggle = (trackId, categoryId) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          const currentCats = [...t.categoryIds];
          const index = currentCats.indexOf(categoryId);
          if (index > -1) currentCats.splice(index, 1);
          else currentCats.push(categoryId);
          return { ...t, categoryIds: currentCats };
        }
        return t;
      }),
    );
  };

  const handleFeatArtistsChange = (trackId, options) => {
    const selectedIds = Array.from(options).map((opt) => parseInt(opt.value));
    updateTrackMetadata(trackId, "artistIds", selectedIds);
  };

  const removeTrackRow = (trackId) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
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

      const invalidTrack = tracks.find((track) => track.categoryIds.length === 0);
      if (invalidTrack) {
          alert(`Bài hát "${invalidTrack.title}" chưa được chọn thể loại (Category). Vui lòng chọn ít nhất 1 thể loại!`);
          return;
      }

    try {
      setIsSubmitting(true);

      // === PHẦN I: UPLOAD ẢNH BÌA LÊN S3 TRƯỚC ===
      let finalCoverKey = "";
      setAlbumCoverProgress(1); // Bật trạng thái đang up ảnh bìa

      const coverFormData = new FormData();
      coverFormData.append("file", albumCoverFile);
      coverFormData.append("type", "images");

      const coverRes = await axiosClient.post(
        "/tracks/upload-temp",
        coverFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setAlbumCoverProgress(percent);
          },
        },
      );
      finalCoverKey = coverRes.data.s3Key;

      // === PHẦN II: UPLOAD TUẦN TỰ TỪNG BÀI HÁT TRONG DANH SÁCH ===
      const cleanTracksPayload = [];

      // Sử dụng vòng lặp for...of để đẩy từng bài lên (Tránh bị nghẽn băng thông mạng nếu đẩy cùng lúc quá nhiều file dung lượng lớn)
      for (let track of tracks) {
        // Cập nhật giao diện bài này đang được upload
        setTracks((prev) =>
          prev.map((t) =>
            t.id === track.id ? { ...t, status: "uploading", progress: 1 } : t,
          ),
        );

        const trackFormData = new FormData();
        trackFormData.append("file", track.file); // Lấy file thật đã giữ lại ở Bước 2 ra up
        trackFormData.append("type", "tracks");

        try {
          const trackRes = await axiosClient.post(
            "/tracks/upload-temp",
            trackFormData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              onUploadProgress: (progressEvent) => {
                const percent = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                setTracks((prev) =>
                  prev.map((t) =>
                    t.id === track.id ? { ...t, progress: percent } : t,
                  ),
                );
              },
            },
          );

          // Đánh dấu bài hát này up thành công trên UI
          setTracks((prev) =>
            prev.map((t) =>
              t.id === track.id
                ? { ...t, status: "success", progress: 100 }
                : t,
            ),
          );

          // Đóng gói dữ liệu sạch chuẩn bị gửi JSON Bulk
          cleanTracksPayload.push({
            title: track.title,
            audioFileKey: trackRes.data.s3Key, // Lấy S3 Key vừa sinh ra
            duration: trackRes.data.duration || 0, // Lấy thời lượng Backend đo được
            artistId: track.artistId,
            artistIds: track.artistIds,
            categoryIds: track.categoryIds,
          });
        } catch (trackError) {
          // Nếu có 1 bài lỗi, đánh dấu đỏ trên UI và dừng tiến trình phát hành để đảm bảo tính an toàn dữ liệu
          setTracks((prev) =>
            prev.map((t) =>
              t.id === track.id ? { ...t, status: "error", progress: 0 } : t,
            ),
          );
          throw new Error(`Lỗi khi tải bài hát: ${track.fileName}`);
        }
      }

      // === PHẦN III: TẠO ALBUM TRONG DATABASE VÀ HOÀN TẤT ===
      // 1. Tạo Album lấy albumId
      const albumFormData = new FormData();
      albumFormData.append("albumTitle", albumName);
      albumFormData.append("artistId", userId);
      albumFormData.append("coverImageKey", finalCoverKey);

      const albumRes = await axiosClient.post("/albums", albumFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const generatedAlbumId = albumRes.data.id;

      // 2. Gom tất cả ném vào API Bulk-Json
      const finalBulkPayload = {
        albumId: generatedAlbumId,
        coverImageKey: finalCoverKey,
        tracks: cleanTracksPayload,
      };

      await axiosClient.post("/tracks/bulk-json", finalBulkPayload);

      alert(
        "🎉 Album và toàn bộ danh sách nhạc đã được phát hành thành công!",
      );
      navigate(`/artist/${userId}`);
    } catch (error) {
      console.error("Lỗi trong quá trình phát hành:", error);
      alert(
        error.message ||
          "Phát hành thất bại, bồ vui lòng kiểm tra lại kết nối mạng hệ thống nha!",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0d131a] min-h-screen text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Tiêu đề trang */}
        <div className="flex items-center gap-3 mb-8 border-b border-white/[0.05] pb-4">
          <FolderPlus
            size={36}
            className="text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.2)]"
          />
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Studio Phát Hành Album
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Luồng lưu trữ thông minh: Tiết kiệm băng thông, chống file rác AWS
              S3
            </p>
          </div>
        </div>

        <form onSubmit={handlePublishAlbum} className="space-y-8">
          {/* KHỐI THÔNG TIN ALBUM VÀ ẢNH BÌA */}
          <div className="bg-[#0f1722] p-6 rounded-2xl border border-white/[0.05] grid grid-cols-1 md:grid-cols-4 gap-6 items-center shadow-xl">
            <div className="flex flex-col items-center">
              <div className="w-40 aspect-square bg-white/[0.02] rounded-xl border-2 border-dashed border-white/[0.1] focus-within:border-sky-500 relative overflow-hidden group flex items-center justify-center cursor-pointer transition-all">
                {albumCoverPreview ? (
                  <>
                    <img
                      src={albumCoverPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {isSubmitting && albumCoverProgress < 100 && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs font-bold text-sky-400 backdrop-blur-sm">
                        Đang tải... {albumCoverProgress}%
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-2 text-slate-400 group-hover:text-slate-200 transition-colors">
                    <ImageIcon
                      size={32}
                      className="mx-auto mb-1 text-sky-400"
                    />
                    <span className="text-[11px] block font-medium">
                      Chọn ảnh bìa Album
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={isSubmitting}
                  onChange={handleAlbumCoverChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              {albumCoverProgress === 100 && (
                <span className="text-[10px] text-sky-400 font-bold mt-2 flex items-center gap-1">
                  ✓ Đã lên Cloud
                </span>
              )}
            </div>

            <div className="md:col-span-3 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Tên Album
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="Nhập tên đĩa nhạc của bồ..."
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.05] focus:border-sky-500 rounded-xl px-4 py-3 text-white text-lg font-bold outline-none transition-all disabled:opacity-50 placeholder-slate-600"
                />
              </div>

              {/* NÚT CHỌN FILE NHẠC */}
              <div className="relative inline-block">
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="bg-sky-500 hover:bg-sky-600 font-bold px-6 py-3 rounded-full text-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50 text-white shadow-[0_4px_14px_rgba(14,165,233,0.3)] border-none"
                >
                  <Plus size={16} /> Chọn bài hát từ máy (Giữ Ctrl chọn nhiều
                  file)
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
            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-200">
              <Music size={22} className="text-sky-400" /> Bản ghi trong hàng
              đợi thiết lập ({tracks.length})
            </h3>

            {tracks.length === 0 && (
              <div className="border border-white/[0.05] bg-[#0f1722] p-12 text-center rounded-2xl text-slate-500 shadow-inner">
                <Music
                  size={48}
                  className="mx-auto mb-2 opacity-10 text-sky-400"
                />
                <p className="text-sm">
                  Chưa có bài hát nào được nạp. Hãy chọn file nhạc ở phía trên
                  bồ nhé!
                </p>
              </div>
            )}

            <div className="space-y-4">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="bg-[#0f1722] border border-white/[0.05] rounded-xl p-5 space-y-4 shadow-lg relative group transition-all hover:border-white/[0.1]"
                >
                  {/* Hàng thanh trạng thái tiến trình (Chỉ thực sự chạy % khi bấm nút Phát hành) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.05] pb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="bg-white/[0.06] w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-sky-400 border border-white/[0.05]">
                        {index + 1}
                      </span>
                      <p className="text-xs text-slate-400 font-mono truncate">
                        Tệp: {track.fileName}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-64">
                      <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden border border-white/[0.02]">
                        <div
                          className={`h-full transition-all duration-300 ${track.status === "success" ? "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.4)]" : track.status === "error" ? "bg-red-500" : track.status === "uploading" ? "bg-blue-500 animate-pulse" : "bg-slate-700"}`}
                          style={{
                            width: `${track.status === "idle" ? 0 : track.progress}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold whitespace-nowrap min-w-[40px] text-right">
                        {track.status === "idle" && (
                          <span className="text-slate-500 text-[10px]">
                            Đang chờ...
                          </span>
                        )}
                        {track.status === "uploading" && (
                          <span className="text-blue-400">
                            {track.progress}%
                          </span>
                        )}
                        {track.status === "success" && (
                          <CheckCircle
                            size={14}
                            className="inline text-sky-400"
                          />
                        )}
                        {track.status === "error" && (
                          <AlertCircle
                            size={14}
                            className="inline text-red-400"
                          />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Điền thông tin Meta Data (Người dùng điền thoải mái lúc nào cũng được) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                        Tiêu đề hiển thị
                      </label>
                      <input
                        type="text"
                        disabled={isSubmitting}
                        value={track.title}
                        onChange={(e) =>
                          updateTrackMetadata(track.id, "title", e.target.value)
                        }
                        className="w-full bg-white/[0.04] border border-white/[0.05] focus:border-sky-500 rounded-lg px-3 py-2 text-white text-sm outline-none transition-all disabled:opacity-50"
                      />
                    </div>

                      <div className="relative">
                          <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                              Nghệ sĩ hợp tác (Feat)
                          </label>

                          <input
                              type="text"
                              placeholder="Tìm nghệ sĩ..."
                              className="w-full bg-white/[0.04] border border-white/[0.05] rounded-lg px-3 py-2 text-sm text-white focus:border-sky-500 outline-none"
                              // Chỉ hiện chữ tìm kiếm nếu đang mở đúng ô của bài hát đó
                              value={activeDropdownId === track.id ? artistSearch : ""}
                              onFocus={() => {
                                  setActiveDropdownId(track.id);
                                  setArtistSearch("");
                              }}
                              onChange={(e) => setArtistSearch(e.target.value)}
                          />

                          {activeDropdownId === track.id && (
                              <div className="absolute z-50 w-full bg-[#131c26] border border-white/[0.1] mt-1 rounded-lg max-h-40 overflow-y-auto shadow-2xl">
                                  {dbArtists
                                      .filter(a =>
                                          a.name.toLowerCase().includes(artistSearch.toLowerCase()) &&
                                          !track.artistIds.includes(a.id) // Ngăn không cho chọn nghệ sĩ đã có trong list
                                      )
                                      .map(artist => (
                                          <div
                                              key={artist.id}
                                              className="p-3 text-xs hover:bg-sky-500/20 cursor-pointer text-slate-200"
                                              onClick={() => {
                                                  setTracks(prev => prev.map(t => t.id === track.id ? {
                                                      ...t,
                                                      featArtists: [...t.featArtists, artist],
                                                      artistIds: [...t.artistIds, artist.id]
                                                  } : t));
                                                  setActiveDropdownId(null); // Đóng dropdown sau khi chọn
                                                  setArtistSearch("");
                                              }}
                                          >
                                              {artist.name}
                                          </div>
                                      ))}
                              </div>
                          )}

                          {/* Hiển thị Tag */}
                          <div className="flex flex-wrap gap-2 mt-2">
                              {track.featArtists && track.featArtists.map(artist => (
                                  <span key={artist.id} className="bg-sky-500/20 text-sky-300 px-2 py-1 rounded text-[10px] flex items-center gap-1">
                {artist.name}
                                      <X size={10} className="cursor-pointer hover:text-red-400" onClick={() => {
                                          setTracks(prev => prev.map(t => t.id === track.id ? {
                                              ...t,
                                              featArtists: t.featArtists.filter(a => a.id !== artist.id),
                                              artistIds: t.artistIds.filter(id => id !== artist.id)
                                          } : t));
                                      }} />
            </span>
                              ))}
                          </div>
                      </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                            <span>Thể loại phân phối</span>
                            {/* Hiển thị cảnh báo màu đỏ nếu chưa chọn */}
                            {track.categoryIds.length === 0 && (
                                <span className="text-red-400 font-normal normal-case text-[10px]">
                                    * Vui lòng chọn thể loại
                                  </span>
                            )}
                        </label>
                        <div className="flex flex-wrap gap-2 pt-0.5">
                            {categories.map((cat) => {
                                const isChecked = track.categoryIds.includes(cat.id);
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() => handleCategoryToggle(track.id, cat.id)}
                                        className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all border-none cursor-pointer disabled:opacity-50 
            ${isChecked
                                            ? "bg-sky-500 text-white font-bold shadow-[0_2px_8px_rgba(14,165,233,0.3)]"
                                            : "bg-white/[0.04] text-slate-400 border border-white/[0.02] hover:bg-white/[0.08] hover:text-slate-200"
                                        }`}
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
                      className="absolute top-2 right-2 text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors border-none bg-transparent cursor-pointer"
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
          <div className="flex justify-end pt-4 border-t border-white/[0.05]">
            <button
              type="submit"
              disabled={isSubmitting || tracks.length === 0}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black px-10 py-4 rounded-full text-base tracking-wide transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2 border-none cursor-pointer shadow-[0_4px_20px_rgba(14,165,233,0.3)]"
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
