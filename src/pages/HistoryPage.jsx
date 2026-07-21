import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../app/axios/axiosClient";
import { useAuthStore } from "../features/auth/useAuthStore";
import { usePlayerStore } from "../features/player/usePlayerStore";
import MusicImage from "../layouts/components/MusicImage";
import { AppPagination } from "../layouts/components/AppPagination";

const HistoryPage = () => {
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.userId);

  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();

  const [historyTracks, setHistoryTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchHistory = async (page) => {
      if (!userId) return;
      setIsLoading(true);
      try {
        // Gọi API lấy lịch sử nghe nhạc của User
        const response = await axiosClient.get(
          `/tracking/history/${userId}?page=${page}&size=20`,
        );
        setHistoryTracks(response.data.content);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Lỗi tải lịch sử nghe nhạc:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory(currentPage);
  }, [userId, currentPage]);

  const handlePlayClick = (track) => {
    if (currentTrack && currentTrack.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, historyTracks, true);
    }
  };

  return (
    <div className="bg-[#121212] min-h-screen text-white p-8 pb-32">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-[#a7a7a7] hover:text-white mb-8 bg-transparent border-none cursor-pointer"
      >
        <ArrowLeft size={20} /> Quay lại
      </button>

      <h1 className="text-4xl font-black mb-8 tracking-tight">
        Lịch sử nghe nhạc
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#282828] border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : historyTracks.length > 0 ? (
        <div className="w-full text-[#a7a7a7] text-sm">
          {historyTracks.map((track, index) => {
            // Kiểm tra xem bài hát này có đang là bài hiện tại hay không
            const isCurrentThisTrack =
              currentTrack && currentTrack.id === track.id;

            return (
              <div
                key={`${track.id}-${index}`}
                onClick={() => handlePlayClick(track)}
                className={`flex items-center gap-4 p-3 rounded-xl transition-colors cursor-pointer group ${
                  isCurrentThisTrack
                    ? "bg-[#2a2a2a] text-white"
                    : "hover:bg-[#282828]"
                }`}
              >
                <div className="w-12 h-12 relative flex-shrink-0 rounded-md overflow-hidden bg-[#282828]">
                  <MusicImage
                    src={track.img}
                    type="track"
                    className="w-full h-full"
                  />
                  {/* Hiển thị nút Play/Pause tùy theo trạng thái thực tế */}
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isCurrentThisTrack
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {isCurrentThisTrack && isPlaying ? (
                      <Pause
                        size={16}
                        fill="currentColor"
                        className="text-white"
                      />
                    ) : (
                      <Play
                        size={16}
                        fill="currentColor"
                        className="text-white ml-0.5"
                      />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-semibold truncate ${isCurrentThisTrack ? "text-blue-400" : "text-white"}`}
                  >
                    {track.name}
                  </h4>
                  <p className="text-xs text-[#a7a7a7] truncate flex gap-1 items-center">
                    {track.artists && track.artists.length > 0
                      ? track.artists.map((artist, idx) => (
                          <span key={artist.id}>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/artist/${artist.id}`);
                              }}
                              className="hover:text-blue-500 hover:underline cursor-pointer transition-colors text-gray-400 font-medium"
                            >
                              {artist.name}
                            </span>
                            {idx < track.artists.length - 1 && ", "}
                          </span>
                        ))
                      : "Nghệ sĩ hệ thống"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="bg-[#282828] px-2.5 py-1 rounded-full text-xs border border-[#3e3e3e]">
                    {track.viewCount || 0} views
                  </span>
                </div>
              </div>
            );
          })}
          {totalPages > 0 && (
            <div className="mt-8 flex justify-center">
              <AppPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(newPage) => setCurrentPage(newPage)}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#181818] rounded-xl p-8 border border-dashed border-[#3e3e3e] text-center">
          <p className="text-[#a7a7a7]">Bạn chưa nghe bài hát nào gần đây.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
