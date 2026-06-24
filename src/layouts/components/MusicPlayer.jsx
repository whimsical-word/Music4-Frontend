import React, { useRef, useEffect, useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
} from "lucide-react";
import { usePlayerStore } from "../../features/player/usePlayerStore";
import { useAuthStore } from "../../features/auth/useAuthStore";
import axiosClient from "../../app/axios/axiosClient";
import MusicImage from "./MusicImage.jsx";
import { useNavigate } from "react-router-dom";

const MusicPlayer = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(0);

  // 1. Rút thêm playNext, playPrev từ Store
  const { currentTrack, isPlaying, togglePlay, playNext, playPrev } =
    usePlayerStore();
  const { isAuthenticated, id: userId } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      usePlayerStore.getState().stop();
    }
  }, [isAuthenticated]);

  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1); // Mặc định âm lượng 100% (1.0)

  const getStreamUrl = (trackId) => {
    if (!trackId) return "";
    const baseUrl = "http://localhost:8080/api/tracks";
    return isAuthenticated
      ? `${baseUrl}/stream/${trackId}`
      : `${baseUrl}/stream/preview/${trackId}`;
  };

  // 2a. Xử lý đồng bộ Volume (Chạy riêng khi volume đổi)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = volume === 0;
    }
  }, [volume]);

  // 2b. Xử lý Play/Pause và Chuyển bài (Chuyển đổi mượt mà)
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.log("Trình duyệt chặn Auto-play hoặc đợi tương tác:", error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]); // Theo dõi sát sao 2 biến này

  // Sync Playback Position (Đồng bộ thời gian nghe mỗi 10 giây)
  useEffect(() => {
    let syncInterval;

    // Chỉ chạy khi user đã đăng nhập, đang có bài hát, và bài hát đang play
    if (isAuthenticated && userId && currentTrack && isPlaying) {
      syncInterval = setInterval(async () => {
        if (audioRef.current) {
          const currentPosition = Math.floor(audioRef.current.currentTime);
          // Chỉ gửi nếu đã nghe
          if (currentPosition > 0) {
            try {
              await axiosClient.put("/tracking/sync-time", {
                userId: userId,
                trackId: currentTrack.id,
                position: currentPosition,
              });
            } catch (error) {
              console.error("Lỗi đồng bộ thời gian:", error);
            }
          }
        }
      }, 10000); // 10 giây gửi 1 lần
    }

    // Cleanup function: Tự động dọn dẹp interval khi đổi bài hoặc pause
    return () => {
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    };
  }, [isAuthenticated, userId, currentTrack, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      const duration = audioRef.current.duration;
      if (duration)
        setProgress((audioRef.current.currentTime / duration) * 100);
    }
  };

  // Khi kết thúc bài -> Lưu lịch sử -> TỰ ĐỘNG NEXT BÀI TIẾP THEO
  const handleTrackEnded = async () => {
    if (isAuthenticated && currentTrack && userId) {
      try {
        await axiosClient.post("/tracking/play", {
          trackId: currentTrack.id,
          userId: userId,
        });
      } catch (error) {
        console.error("Lỗi khi lưu lịch sử:", error);
      }
    }
    playNext(); // Gọi hàm next bài mượt mà
  };

  // Kiểm tra xem bài hát này có lưu vị trí nghe cũ không (playbackPosition)
  const handleLoadedMetadata = () => {
    if (audioRef.current && currentTrack.playbackPosition) {
      audioRef.current.currentTime = currentTrack.playbackPosition;
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * audioRef.current.duration;

      if (isFinite(newTime)) {
        audioRef.current.currentTime = newTime;
      }
    }
  };

  // XỬ LÝ CLICK CHỈNH ÂM LƯỢNG
  const handleVolumeChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, clickX / rect.width)); // Đảm bảo giá trị luôn từ 0 đến 1
    setVolume(newVolume);
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#181818] border-t border-[#282828] flex items-center justify-between px-6 z-[100] animate-fadeIn">
      <audio
        ref={audioRef}
        src={currentTrack?.id ? getStreamUrl(currentTrack.id) : ""}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onError={(e) => {
          console.error("Lỗi không thể tải nguồn nhạc:", e.target.error);
        }}
      />

      {/* KHU VỰC 1: THÔNG TIN BÀI HÁT */}
      <div className="flex items-center gap-4 w-1/4">
        <div className="w-14 h-14 rounded-md overflow-hidden bg-[#282828] shrink shadow-md">
          <MusicImage
            src={currentTrack.img}
            type="track"
            alt={currentTrack.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h4 className="text-white text-sm font-bold truncate">
            {currentTrack.name}
          </h4>
          <p className="text-xs text-[#a7a7a7] truncate">
            {currentTrack.artists && currentTrack.artists.length > 0
              ? currentTrack.artists.map((artist, idx) => (
                  <span key={artist.id}>
                    <span
                      onClick={() => navigate(`/artist/${artist.id}`)}
                      className="hover:text-white hover:underline cursor-pointer transition-all"
                    >
                      {artist.name}
                    </span>
                    {idx < currentTrack.artists.length - 1 && ", "}
                  </span>
                ))
              : "Nghệ sĩ hệ thống"}
          </p>
        </div>
      </div>

      {/* KHU VỰC 2: CONTROLS & TIẾN TRÌNH */}
      <div className="flex flex-col items-center justify-center w-2/4 gap-2">
        <div className="flex items-center gap-6">
          {/* Gắn sự kiện playPrev vào nút SkipBack */}
          <button
            onClick={playPrev}
            className="text-[#a7a7a7] hover:text-white transition-colors cursor-pointer border-none bg-transparent"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:scale-105 transition-transform cursor-pointer border-none shadow-lg"
          >
            {isPlaying ? (
              <Pause size={16} fill="black" className="text-black" />
            ) : (
              <Play size={16} fill="black" className="text-black ml-0.5" />
            )}
          </button>

          {/* Gắn sự kiện playNext vào nút SkipForward */}
          <button
            onClick={playNext}
            className="text-[#a7a7a7] hover:text-white transition-colors cursor-pointer border-none bg-transparent"
          >
            <SkipForward size={20} />
          </button>
        </div>

        <div className="w-full max-w-md flex items-center gap-3 group">
          <span className="text-[11px] font-mono text-[#a7a7a7] min-w-8.75 text-right">
            {formatTime(currentTime)}
          </span>
          <div
            className="h-1.5 flex-1 bg-[#3e3e3e] rounded-full overflow-hidden cursor-pointer relative"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-white group-hover:bg-blue-500 transition-colors relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
          <span className="text-[11px] font-mono text-[#a7a7a7] min-w-[35px]">
            {formatTime}
          </span>
        </div>
      </div>

      {/* KHU VỰC 3: ÂM LƯỢNG */}
      <div className="flex items-center justify-end w-1/4 gap-3 text-[#a7a7a7]">
        {/* Đổi icon nếu tắt tiếng hoàn toàn */}
        {volume === 0 ? (
          <VolumeX
            size={20}
            className="cursor-pointer hover:text-white transition-colors"
            onClick={() => setVolume(1)}
          />
        ) : (
          <Volume2
            size={20}
            className="cursor-pointer hover:text-white transition-colors"
            onClick={() => setVolume(0)}
          />
        )}

        {/* Thanh kéo Âm lượng đã được biến thành thanh có thể Click */}
        <div
          className="w-24 h-1.5 bg-[#3e3e3e] rounded-full cursor-pointer group relative"
          onClick={handleVolumeChange} // Gọi hàm tính toán âm lượng khi click
        >
          <div
            className="h-full bg-white group-hover:bg-blue-500 transition-colors rounded-full relative"
            style={{ width: `${volume * 100}%` }} // Chỉnh độ dài thanh dựa vào biến volume
          >
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatTime = (seconds) => {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export default MusicPlayer;
