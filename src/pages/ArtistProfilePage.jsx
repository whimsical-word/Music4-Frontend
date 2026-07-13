import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Pencil,
  Play,
  Activity,
  Camera,
  Edit2,
  X,
  Trash2,
  Heart,
  Music,
  Pause,
  Mic2,
  Disc,
  Headphones,
  Users,
  MessageSquare,
  TrendingUp,
    MoreHorizontal,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import axiosClient from "../app/axios/axiosClient";
import { useAuthStore } from "../features/auth/useAuthStore";
import { usePlayerStore } from "../features/player/usePlayerStore";
import MusicImage from "../layouts/components/MusicImage";
import { useFollowStore } from "../features/follow/useFollowStore";
import TrackEngagementModal from "../layouts/components/TrackEngagementModal";


const ArtistProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playTrack = usePlayerStore((state) => state.playTrack);

    const { userId, role } = useAuthStore();
    const isOwner = role === "artist" && Number(userId) === Number(id);
    const { followedArtistIds, toggleFollowArtist, fetchFollowedArtists } = useFollowStore();

  const [artistInfo, setArtistInfo] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [chartPeriod, setChartPeriod] = useState(7);

  // Các State phục vụ cho Modal Chỉnh sửa hồ sơ
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [selectedCover, setSelectedCover] = useState(null);
  const [previewCover, setPreviewCover] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const isFollowing = followedArtistIds.includes(Number(id));

  const [selectedTrack, setSelectedTrack] = useState(null);

    const [followers, setFollowers] = useState([]);
    const [isFollowerModalOpen, setIsFollowerModalOpen] = useState(false);

    const fetchFollowers = async () => {
        try {
            const res = await axiosClient.get(`/artists/${id}/followers`);
            setFollowers(res.data);
            setIsFollowerModalOpen(true);
        } catch (error) {
            console.error("Lỗi lấy danh sách người theo dõi:", error);
            alert("Không thể tải danh sách người theo dõi.");
        }
    };

    useEffect(() => {
        if (userId) {
            fetchFollowedArtists();
        }
    }, [userId]);

  useEffect(() => {
    const fetchArtistData = async () => {
      setIsLoading(true);
      try {
        // 1. Lấy thông tin chi tiết của nghệ sĩ
        const artistRes = await axiosClient.get(`/artists/${id}`);
        setArtistInfo(artistRes.data);
        setEditName(artistRes.data.name);

        // 2. Lấy danh sách Album và bóc tách dữ liệu an toàn (Chống lỗi Page/Object wrap)
        const albumsRes = await axiosClient.get(`/albums/artist/${id}`);
        let albumList = [];
        if (albumsRes.data) {
          albumList =
            albumsRes.data.content || albumsRes.data.data || albumsRes.data;
        } else {
          albumList = albumsRes.content || albumsRes;
        }
        setAlbums(Array.isArray(albumList) ? albumList : []);

        // 3. Lấy danh sách Bài hát và bóc tách dữ liệu an toàn
        const tracksRes = await axiosClient.get(`/tracks/artist/${id}`);
        let trackList = [];
        if (tracksRes.data) {
          trackList =
            tracksRes.data.content || tracksRes.data.data || tracksRes.data;
        } else {
          trackList = tracksRes.content || tracksRes;
        }
        setTracks(Array.isArray(trackList) ? trackList : []);

        const statsRes = await axiosClient.get(
          `/analytics/artist/${id}/overview`,
        );
        console.log(JSON.stringify(statsRes.data, null, 2));
        setStats(statsRes.data);
      } catch (error) {
        console.error("Lỗi tải thông tin nghệ sĩ, album hoặc bài hát:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [id, isOwner]);

    const handleFollowToggle = async () => {
        if (!userId) {
            alert("Vui lòng đăng nhập để thực hiện tính năng này!");
            return;
        }
        try {
            await toggleFollowArtist(Number(id));
        } catch (error) {
            console.error("Lỗi khi thay đổi trạng thái theo dõi:", error);
        }
    };
  const handlePlayTrack = (track) => {
    if (playingTrackId === track.id) {
      setPlayingTrackId(null);
    } else {
      setPlayingTrackId(track.id);
      playTrack(track); // Gọi xuống trình phát nhạc tổng của dự án
    }
  };

  const handleEditTrack = (track) => {
    // Chuyển hướng sang trang upload kèm theo toàn bộ Object thông tin của bài hát đó thông qua React Router State
    navigate("/studio/upload", {
      state: { editTrackData: track },
    });
  };

    const handleDeleteAlbum = async (albumId, albumName) => {
        const isConfirm = window.confirm(
            `❗ Bạn có chắc chắn muốn xóa album "${albumName}" không?\nCác bài hát trong album sẽ không bị xóa mà sẽ trở thành bài hát đơn lẻ.`
        );
        if (!isConfirm) return;

        try {
            await axiosClient.delete(`/albums/${albumId}`); // Đảm bảo URL khớp với API của bạn
            alert("🎉 Đã xóa album thành công!");

            // Cập nhật State để xóa album khỏi giao diện ngay lập tức
            setAlbums((prevAlbums) => prevAlbums.filter((album) => album.id !== albumId));

            // Giảm số lượng album trên UI
            if (artistInfo) {
                setArtistInfo((prev) => ({
                    ...prev,
                    albumTotal: Math.max(0, prev.albumTotal - 1),
                }));
            }
        } catch (error) {
            console.error("Lỗi khi xóa album:", error);
            alert(`❌ Xóa album thất bại: ${error.response?.data?.message || "Vui lòng kiểm tra lại!"}`);
        }
    };

  // Hàm xử lý xóa bài hát (Chỉ thực hiện được nếu là chính chủ)
  const handleDeleteTrack = async (trackId, trackName) => {
    const isConfirm = window.confirm(
      `❗ Bạn có chắc chắn muốn xóa bài hát "${trackName}" không?\nHành động này sẽ xóa vĩnh viễn bài hát dưới Database và dọn sạch file trên AWS S3.`,
    );
    if (!isConfirm) return;

    try {
      // Gọi API DELETE bài hát lên Back-end
      await axiosClient.delete(`/tracks/${trackId}`);
      alert("🎉 Đã xóa bài hát và dọn dẹp dữ liệu Cloud S3 thành công!");

      // Cập nhật State tại chỗ để bài hát biến mất ngay lập tức trên giao diện
      setTracks((prevTracks) =>
        prevTracks.filter((track) => track.id !== trackId),
      );

      // Giảm số lượng tổng bài hát hiển thị trên UI đi 1 đơn vị
      if (artistInfo) {
        setArtistInfo((prev) => ({
          ...prev,
          trackTotal: Math.max(0, prev.trackTotal - 1),
        }));
      }
    } catch (error) {
      console.error("Lỗi khi xóa bài hát:", error);
      alert(
        `❌ Xóa bài hát thất bại: ${error.response?.data?.message || "Vui lòng kiểm tra lại hệ thống!"}`,
      );
    }
  };

  // Hàm xử lý cập nhật thông tin hồ sơ nghệ sĩ
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("name", editName);
      if (selectedAvatar) formData.append("img", selectedAvatar);
      if (selectedCover) formData.append("cover", selectedCover);

      await axiosClient.patch(`/artists/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Cập nhật hồ sơ Nghệ sĩ thành công!");
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      alert("Cập nhật thất bại.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getChartData = () => {
    const data = stats?.chartData || [];
    const sliced = data.slice(-chartPeriod);

    if (sliced.length < chartPeriod) {
      const padding = chartPeriod - sliced.length;
      const startDate = sliced[0]?.day ? new Date(sliced[0].day) : new Date();
      const padded = Array.from({ length: padding }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() - (padding - i));
        return { day: d.toISOString(), views: 0, likes: 0 };
      });
      return [...padded, ...sliced];
    }
    return sliced;
  };

  const getChartSummary = () => {
    const data = stats?.chartData || [];
    const current = data.slice(-chartPeriod);
    const prev = data.slice(-chartPeriod * 2, -chartPeriod);
    const totalViews = current.reduce((s, d) => s + (d.views || 0), 0);
    const totalLikes = current.reduce((s, d) => s + (d.likes || 0), 0);
    const prevViews = prev.reduce((s, d) => s + (d.views || 0), 0);
    const prevLikes = prev.reduce((s, d) => s + (d.likes || 0), 0);
    const viewsDelta =
      prevViews > 0
        ? Math.round(((totalViews - prevViews) / prevViews) * 100)
        : null;
    const likesDelta =
      prevLikes > 0
        ? Math.round(((totalLikes - prevLikes) / prevLikes) * 100)
        : null;
    return { totalViews, totalLikes, viewsDelta, likesDelta };
  };

  if (isLoading)
    return (
      <div className="bg-[#0a0f14] min-h-screen p-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-sky-500 rounded-full animate-spin"></div>
      </div>
    );
  if (!artistInfo)
    return (
      <div className="bg-[#0a0f14] min-h-screen p-20 text-center text-slate-400">
        Không tìm thấy thông tin nghệ sĩ.
      </div>
    );

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-[#0f1722] p-6 rounded-xl border border-white/[0.05] flex items-center gap-4">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center ${color}`}
      >
        <Icon size={24} />
      </div>

      <div>
        <p className="text-slate-400 text-sm mb-1">{title}</p>

        <h3 className="text-2xl font-bold text-white">
          {(value || 0).toLocaleString()}
        </h3>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-[#07192c] via-[#0d131a] to-[#0a0f14] min-h-screen text-white font-sans pb-32 relative">
      {/* 1. KHU VỰC ẢNH BÌA VÀ AVATAR CỦA NGHỆ SĨ */}
      <div className="relative h-[40vh] min-h-[350px] flex items-end p-8">
        <div className="absolute inset-0 z-0">
          <MusicImage
            src={artistInfo.cover || artistInfo.img}
            type="artist"
            className="w-full h-full object-cover blur-md opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d131a] via-[#0d131a]/80 to-transparent"></div>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="w-48 h-48 rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.6)] overflow-hidden border-4 border-white/[0.06] relative group bg-[#16222f]">
            <MusicImage
              src={artistInfo.img}
              type="artist"
              className="w-full h-full object-cover"
            />

            {/* NÚT MỞ MODAL SỬA HỒ SƠ DÀNH CHO CHÍNH CHỦ */}
            {isOwner && (
              <div
                onClick={() => setIsEditModalOpen(true)}
                className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer backdrop-blur-xs"
              >
                <Edit2 size={28} className="text-sky-400 mb-1" />
                <span className="text-white text-xs font-bold tracking-wide">
                  Sửa hồ sơ
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-5xl md:text-7xl font-black mb-3 tracking-tighter bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              {artistInfo.name}
            </h1>
              <div className="flex items-center gap-6">
                  {!isOwner && (
                      <button
                          onClick={handleFollowToggle}
                          onMouseEnter={() => setIsBtnHovered(true)}
                          onMouseLeave={() => setIsBtnHovered(false)}
                          className={`px-6 py-2 font-bold uppercase text-xs hover:scale-105 transition-all cursor-pointer rounded-full min-w-[140px] text-center border bg-transparent ${
                              isFollowing
                                  ? "border-sky-500 bg-sky-500/10 text-sky-400 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10"
                                  : "border-white/20 text-white hover:text-sky-400 hover:border-sky-400"
                          }`}
                      >
                          {isFollowing ? (isBtnHovered ? "Hủy theo dõi" : "Đang theo dõi") : "Theo dõi"}
                      </button>
                  )}
              </div>
            <p className="text-sm text-slate-400 font-medium mt-2">
              {artistInfo.trackTotal || 0} Bài hát •{" "}
              {artistInfo.albumTotal || 0} Album
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 relative z-10 space-y-12">
        {/* 2. BẢNG THỐNG KÊ TỔNG QUAN (CHỈ HIỂN THỊ DÀNH RIÊNG CHO CHÍNH CHỦ) */}
        {isOwner && stats && (
          <section className="space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold flex items-center gap-3">
                <TrendingUp className="text-sky-500" />
                Tổng quan dữ liệu của bạn
              </h2>

              <p className="text-slate-400 mt-2">
                Theo dõi hiệu suất các sản phẩm của bạn trên hệ thống.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard
                title="Tổng lượt nghe"
                value={stats.totalViews}
                icon={Headphones}
                color="bg-sky-500/10 text-sky-500"
              />

              <StatCard
                title="Tổng lượt thích"
                value={stats.totalFavorites}
                icon={Heart}
                color="bg-rose-500/10 text-rose-500"
              />

                <div onClick={fetchFollowers} className="cursor-pointer transition-transform hover:scale-[1.02]">
                    <StatCard
                        title="Tổng người theo dõi"
                        value={stats.totalFollowers}
                        icon={Users}
                        color="bg-amber-500/10 text-amber-500"
                    />
                </div>

              <StatCard
                title="Tổng bình luận"
                value={stats.totalComments}
                icon={MessageSquare}
                color="bg-emerald-500/10 text-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-[#0f1722] rounded-xl p-6 border border-white/[0.05]">
                {/* Header: title + period tabs */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-medium text-base text-white">
                      Lượt tương tác
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {chartPeriod} ngày gần nhất
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {[7, 14, 30].map((p) => (
                      <button
                        key={p}
                        onClick={() => setChartPeriod(p)}
                        className={`text-xs px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                          chartPeriod === p
                            ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                            : "bg-transparent text-slate-500 border-white/[0.06] hover:text-slate-300 hover:border-white/[0.12]"
                        }`}
                      >
                        {p}N
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex gap-4 mb-4">
                  <span className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-3 h-0.5 bg-sky-400 rounded-full inline-block" />
                    Lượt nghe
                  </span>
                  <span className="flex items-center gap-2 text-xs text-slate-400">
                    <span
                      className="w-3 inline-block"
                      style={{
                        height: "2px",
                        background:
                          "repeating-linear-gradient(90deg,#f43f5e 0,#f43f5e 4px,transparent 4px,transparent 7px)",
                      }}
                    />
                    Lượt thích
                  </span>
                </div>

                {/* Chart */}
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getChartData()}
                      margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="gradViews"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#0ea5e9"
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="100%"
                            stopColor="#0ea5e9"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="gradLikes"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#f43f5e"
                            stopOpacity={0.12}
                          />
                          <stop
                            offset="100%"
                            stopColor="#f43f5e"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        stroke="#ffffff"
                        strokeOpacity={0.04}
                        vertical={false}
                      />

                      <XAxis
                        dataKey="day"
                        stroke="#64748b"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) =>
                          new Date(v).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                          })
                        }
                      />

                      <YAxis
                        stroke="#64748b"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                        allowDecimals={false}
                        width={48}
                        tickFormatter={(v) =>
                          v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
                        }
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 10,
                          fontSize: 12,
                        }}
                        labelFormatter={(v) =>
                          new Date(v).toLocaleDateString("vi-VN", {
                            weekday: "short",
                            day: "2-digit",
                            month: "2-digit",
                          })
                        }
                        formatter={(value, name) => [
                          value.toLocaleString("vi-VN"),
                          name === "views" ? "Lượt nghe" : "Lượt thích",
                        ]}
                      />

                      <Line
                        type="monotone"
                        dataKey="views"
                        name="Lượt nghe"
                        stroke="#0ea5e9"
                        strokeWidth={4}
                        dot={false}
                        activeDot={{
                          r: 8,
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="likes"
                        name="Lượt thích"
                        stroke="#f43f5e"
                        strokeDasharray="5 3"
                        strokeWidth={4}
                        dot={false}
                        activeDot={{
                          r: 8,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {(() => {
                  const { totalViews, totalLikes, viewsDelta, likesDelta } =
                    getChartSummary();
                  return (
                    <div className="flex gap-6 mt-5 pt-4 border-t border-white/[0.05]">
                      <div>
                        <p className="text-lg font-medium text-sky-400">
                          {totalViews.toLocaleString("vi-VN")}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tổng lượt nghe
                        </p>
                        {viewsDelta !== null && (
                          <p
                            className={`text-xs mt-0.5 ${viewsDelta >= 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {viewsDelta >= 0 ? "↑" : "↓"} {Math.abs(viewsDelta)}
                            % so với kỳ trước
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-medium text-rose-400">
                          {totalLikes.toLocaleString("vi-VN")}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tổng lượt thích
                        </p>
                        {likesDelta !== null && (
                          <p
                            className={`text-xs mt-0.5 ${likesDelta >= 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {likesDelta >= 0 ? "↑" : "↓"} {Math.abs(likesDelta)}
                            % so với kỳ trước
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="bg-[#0f1722] rounded-xl p-6 border border-white/[0.05]">
                <h3 className="font-bold text-lg mb-6">Top bài hát</h3>

                <div className="space-y-4">
                  {stats.topTracks?.map((track, index) => (
                    <div key={track.id} className="flex gap-4 items-center">
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center font-bold text-white
          ${
            index === 0
              ? "bg-yellow-500"
              : index === 1
                ? "bg-gray-400"
                : index === 2
                  ? "bg-amber-700"
                  : "bg-sky-500/20 text-sky-500"
          }`}
                      >
                        #{index + 1}
                      </div>

                      <div className="flex-1">
                        <p className="font-medium truncate">{track.name}</p>

                        <div className="text-xs text-slate-400 mt-1 flex gap-3">
                          <span>
                            {track.viewCount.toLocaleString()} lượt nghe
                          </span>
                          <span>{track.favoriteCount} lượt thích</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. NÚT PLAY ALL */}
        <div className="px-4 py-1 flex items-center gap-270">
          <button
            onClick={() => tracks.length > 0 && handlePlayTrack(tracks[0])}
            className="w-14 h-14 bg-sky-500 hover:bg-sky-400 rounded-full flex items-center justify-center text-white shadow-[0_4px_18px_rgba(14,165,233,0.3)] hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
          >
            <Play size={26} fill="white" className="ml-1" />
          </button>
          {isOwner && stats && (
            <div className="mt-8 pt-6 border-t border-white/[0.05] flex flex-col gap-4 font-medium">
              <button
                onClick={() => navigate("/studio/upload")}
                className="flex items-center gap-4 hover:text-sky-400 transition-all group w-full text-left bg-transparent border-none outline-none cursor-pointer p-0"
              >
                <div className="bg-white/[0.04] border border-white/[0.02] group-hover:bg-white/[0.08] group-hover:text-sky-400 p-1.5 rounded-lg text-slate-300 transition-colors">
                  <Mic2 size={18} />
                </div>
                Tạo Bài hát mới
              </button>
              <button
                onClick={() => navigate("/studio/album")}
                className="flex items-center gap-4 hover:text-sky-400 transition-all group w-full text-left bg-transparent border-none outline-none cursor-pointer p-0"
              >
                <div className="bg-white/[0.04] border border-white/[0.02] group-hover:bg-white/[0.08] group-hover:text-sky-400 p-1.5 rounded-lg text-slate-300 transition-colors">
                  <Disc size={18} />
                </div>
                Tạo Album mới
              </button>
            </div>
          )}
        </div>

          {/* 4. DANH SÁCH BÀI HÁT ĐÃ PHÁT HÀNH */}
          <section>
              <h2 className="text-xl font-bold mb-6 text-slate-200">
                  Bài hát đã phát hành
              </h2>
              {tracks.length > 0 ? (
                  <div className="bg-[#111a24]/30 border border-white/[0.04] p-4 rounded-xl space-y-1 backdrop-blur-sm">
                      {tracks.map((track, index) => (
                          <div
                              key={track.id}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.05] transition-colors group cursor-pointer"
                              onClick={() => handlePlayTrack(track)}
                          >
                              {/* Khối bên trái: Số thứ tự, Ảnh nhỏ, Tên bài hát */}
                              <div className="flex items-center gap-4 flex-1 min-w-0">
            <span className="text-slate-500 font-medium w-6 text-center group-hover:hidden">
              {index + 1}
            </span>
                                  <div className="hidden group-hover:flex text-sky-400 w-6 justify-center">
                                      {playingTrackId === track.id ? (
                                          <Pause size={16} fill="currentColor" />
                                      ) : (
                                          <Play size={16} fill="currentColor" />
                                      )}
                                  </div>

                                  <div className="w-10 h-10 rounded overflow-hidden bg-[#16222f] flex-shrink-0 shadow-sm">
                                      <MusicImage
                                          src={track.img}
                                          type="track"
                                          className="w-full h-full object-cover"
                                      />
                                  </div>

                    <div className="truncate">
                      <p
                        className={`font-semibold truncate transition-colors ${playingTrackId === track.id ? "text-sky-400" : "text-white group-hover:text-sky-400"}`}
                      >
                        {track.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                          {track.artists?.map(a => a.name).join(', ') || "Nghệ sĩ"}
                      </p>
                    </div>
                  </div>

                              {/* Khối bên phải: Lượt nghe, Thời lượng, Các nút thao tác */}
                              <div className="flex items-center gap-6 ml-4">
            <span className="text-xs text-slate-400 hidden sm:block">
              {track.viewCount?.toLocaleString() || 0} lượt nghe
            </span>
                                  <span className="text-sm text-slate-400 hidden md:block font-mono">
              {track.duration
                  ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, "0")}`
                  : "--:--"}
            </span>

                                  {/* 🟢 NÚT BA CHẤM KÍCH HOẠT MODAL TƯƠNG TÁC (ĐÃ ĐƯỢC CHUẨN HÓA DỮ LIỆU ĐỂ TRÁNH LỖI MODAL) */}
                                  {userId && (
                                      <button
                                          type="button"
                                          onClick={(e) => {
                                              e.stopPropagation(); // Chặn hành vi click dòng gây phát nhạc

                                              // Ép dữ liệu chuẩn hóa gửi sang Modal (bù đắp các trường bị thiếu từ API Artist)
                                              const normalizedTrack = {
                                                  ...track,
                                                  // Nếu track không có artist list, tự lấy thông tin artistInfo của trang gán vào
                                                  artists: track.artists && track.artists.length > 0
                                                      ? track.artists
                                                      : [{ id: artistInfo.id, name: artistInfo.name }],
                                              };

                                              setSelectedTrack(normalizedTrack); // Kích hoạt mở Modal tương tác phẳng
                                          }}
                                          className="text-slate-400 hover:text-sky-400 bg-transparent border-none cursor-pointer transition-all p-2 rounded-full hover:bg-white/[0.05]"
                                          title="Mở bảng tương tác (Thích, Bình luận, Playlist)"
                                      >
                                          <MoreHorizontal size={18} />
                                      </button>
                                  )}

                                  {/* NÚT UPDATE BÀI HÁT (Chỉ hiển thị khi là chủ sở hữu kênh) */}
                                  {track.artists?.find((a) => a.role === "MAIN") &&
                                      Number(
                                          track.artists.find((a) => a.role === "MAIN").id,
                                      ) === Number(userId) && (
                                          <button
                                              type="button"
                                              onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleEditTrack(track);
                                              }}
                                              className="text-slate-400 hover:text-sky-400 p-2 rounded-full hover:bg-white/[0.08] transition-colors cursor-pointer bg-transparent border-none"
                                              title="Chỉnh sửa bài hát"
                                          >
                                              <Pencil size={18} />
                                          </button>
                                      )}

                                  {/* NÚT XÓA BÀI HÁT (Chỉ hiển thị khi là chủ sở hữu kênh) */}
                                  {track.artists?.find((a) => a.role === "MAIN") &&
                                      Number(
                                          track.artists.find((a) => a.role === "MAIN").id,
                                      ) === Number(userId) && (
                                          <button
                                              type="button"
                                              onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteTrack(track.id, track.name);
                                              }}
                                              className="text-slate-400 hover:text-red-400 p-2 rounded-full hover:bg-white/[0.08] transition-colors cursor-pointer bg-transparent border-none"
                                              title="Xóa bài hát"
                                          >
                                              <Trash2 size={18} />
                                          </button>
                                      )}
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p className="text-slate-400 text-sm bg-[#111a24]/20 p-4 rounded-xl border border-white/[0.04]">
                      Nghệ sĩ này chưa đăng bài hát nào.
                  </p>
              )}
          </section>

          {/* 5. DANH SÁCH ALBUM CỦA NGHỆ SĨ */}
          <section>
              <h2 className="text-xl font-bold mb-6 hover:text-sky-400 transition-colors cursor-pointer inline-block">
                  Album
              </h2>
              {albums.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {albums.map((album) => (
                          <div
                              key={album.id}
                              className="bg-[#111a24]/40 border border-white/[0.04] p-4 rounded-xl hover:bg-white/[0.06] transition-all duration-300 group cursor-pointer shadow-md relative"
                          >
                              {/* NÚT XÓA ALBUM - GÓC DƯỚI BÊN PHẢI */}
                              {isOwner && (
                                  <button
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteAlbum(album.id, album.name);
                                      }}
                                      className="absolute bottom-4 right-4 z-20 p-2 bg-black/50 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-all cursor-pointer border-none"
                                      title="Xóa album"
                                  >
                                      <Trash2 size={16} />
                                  </button>
                              )}

                              <div
                                  onClick={() => navigate(`/albums/${album.id}`)}
                                  className="relative aspect-square w-full mb-4 rounded-lg overflow-hidden bg-[#16222f] shadow-md"
                              >
                                  <MusicImage
                                      src={album.img}
                                      type="album"
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-xs">
                                      <button className="w-10 h-10 bg-sky-600 hover:bg-sky-500 rounded-full flex items-center justify-center shadow-md border-none cursor-pointer text-white transition-colors">
                                          <Play
                                              size={18}
                                              fill="currentColor"
                                              className="ml-0.5"
                                          />
                                      </button>
                                  </div>
                              </div>
                              <h4 className="font-bold text-white truncate text-sm mb-1 group-hover:text-sky-400 transition-colors">
                                  {album.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                                  {album.uploadDate
                                      ? new Date(album.uploadDate).getFullYear()
                                      : "----"}{" "}
                                  • Album
                              </p>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p className="text-slate-400 text-sm bg-[#111a24]/20 p-4 rounded-xl border border-white/[0.04]">
                      Nghệ sĩ này chưa phát hành album nào.
                  </p>
              )}
          </section>
      </div>

      {/* 6. MODAL POPUP CHỈNH SỬA THÔNG TIN */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fadeIn backdrop-blur-sm">
          <div className="bg-[#0f1722] border border-white/[0.06] p-6 rounded-2xl w-[500px] shadow-2xl relative text-white">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer bg-transparent border-none z-20 transition-colors"
            >
              <X size={22} />
            </button>
            <h2 className="text-xl font-bold mb-6 text-slate-100">
              Chi tiết hồ sơ Nghệ sĩ
            </h2>

            <form
              onSubmit={handleUpdateProfile}
              className="flex flex-col gap-6"
            >
              {/* ĐỔI ẢNH BÌA (COVER) */}
              <div className="relative h-32 w-full rounded-xl overflow-hidden bg-[#16222f] group shadow-inner border border-white/[0.04]">
                {previewCover ? (
                  <img
                    src={previewCover}
                    alt="Cover Preview"
                    className="w-full h-full object-cover group-hover:brightness-50 transition-all"
                  />
                ) : (
                  <MusicImage
                    src={artistInfo.cover || artistInfo.img}
                    type="artist"
                    className="w-full h-full object-cover group-hover:brightness-50 transition-all"
                  />
                )}
                <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer bg-black/40 transition-opacity">
                  <Camera size={26} className="text-sky-400" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedCover(file);
                        setPreviewCover(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
                <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-slate-300 font-bold tracking-widest uppercase border border-white/[0.05]">
                  ẢNH BÌA
                </div>
              </div>

              {/* ĐỔI AVATAR */}
              <div className="flex justify-center -mt-16 relative z-10">
                <label className="relative w-28 h-28 rounded-full cursor-pointer group shadow-2xl border-4 border-[#0f1722] hover:border-sky-500 transition-all bg-[#0a0f14]">
                  {previewAvatar ? (
                    <img
                      src={previewAvatar}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover rounded-full group-hover:brightness-50 transition-all"
                    />
                  ) : (
                    <MusicImage
                      src={artistInfo.img}
                      type="artist"
                      className="w-full h-full rounded-full group-hover:brightness-50 transition-all"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full bg-black/40 transition-opacity">
                    <Camera size={22} className="text-sky-400" />
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedAvatar(file);
                        setPreviewAvatar(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              </div>

              {/* ĐỔI TÊN */}
              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">
                  Tên Nghệ sĩ
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#1a2332]/60 border border-white/[0.06] focus:border-sky-500 rounded-xl px-4 py-3 text-white outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_4px_14px_rgba(14,165,233,0.2)] disabled:opacity-50 cursor-pointer border-none mt-2"
              >
                {isUpdating ? "Đang lưu dữ liệu..." : "Lưu thay đổi"}
              </button>
            </form>
          </div>
        </div>
      )}
        {isFollowerModalOpen && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                <div className="bg-[#182232] border border-white/[0.1] w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">Người theo dõi</h3>
                        <button
                            onClick={() => setIsFollowerModalOpen(false)}
                            className="text-slate-400 hover:text-white"
                        >✕</button>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto pr-2">
                        {followers.length > 0 ? followers.map(user => (
                            <div key={user.id} className="flex items-center gap-3 py-2 border-b border-white/[0.05]">
                                <img src={user.img || '/default-avatar.png'} className="w-10 h-10 rounded-full object-cover" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">{user.name}</span>
                                    <span className="text-xs text-slate-400">@{user.username}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-slate-500 text-sm">Chưa có ai theo dõi bạn.</p>
                        )}
                    </div>
                </div>
            </div>
        )}
        {selectedTrack && (
            <TrackEngagementModal
                track={selectedTrack}
                onClose={() => setSelectedTrack(null)}
            />
        )}
    </div>
  );
};

export default ArtistProfilePage;
