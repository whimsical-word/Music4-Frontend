import React, { useRef, useEffect, useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Repeat1,
  Repeat,
  Shuffle,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";
import { usePlayerStore } from "../../features/player/usePlayerStore";
import { useAuthStore } from "../../features/auth/useAuthStore";
import axiosClient from "../../app/axios/axiosClient";
import MusicImage from "./MusicImage.jsx";
import { useNavigate } from "react-router-dom";

// GIỚI HẠN THỜI GIAN NGHE THỬ CHO GUEST (30 GIÂY)
const PREVIEW_LIMIT = 30;

const MusicPlayer = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(0);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // STATE ĐỂ QUẢN LÝ TRẠNG THÁI ẨN/HIỆN CỦA THANH BAR
  const [isMinimized, setIsMinimized] = useState(false);

  // STATE ĐỂ QUẢN LÝ MODAL YÊU CẦU ĐĂNG NHẬP
  const [showGuestModal, setShowGuestModal] = useState(false);

  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeatMode,
  } = usePlayerStore();

  const { isAuthenticated, userId } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      usePlayerStore.getState().stop();
    }
  }, [isAuthenticated]);

  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1); // Mặc định âm lượng 100% (1.0)

  // CÁC BIẾN REF ĐỂ THEO DÕI THỜI GIAN NGHE THỰC TẾ
  const lastTimeRef = useRef(0);
  const accumulatedTimeRef = useRef(0);
  const hasRecordedViewRef = useRef(false);
  const hasSavedHistoryRef = useRef(false);
  const lastSyncPositionRef = useRef(0);

  // RESET LẠI BỘ ĐẾM KHI CHUYỂN BÀI HÁT MỚI
  useEffect(() => {
    lastTimeRef.current = 0;
    accumulatedTimeRef.current = 0;
    hasRecordedViewRef.current = false;
    hasSavedHistoryRef.current = false;
    lastSyncPositionRef.current = 0;
  }, [currentTrack?.id]);

  const getStreamUrl = (trackId) => {
    if (!trackId) return "";
    const baseUrl = "http://localhost:8080/api/tracks";
    return isAuthenticated
      ? `${baseUrl}/stream/${trackId}`
      : `${baseUrl}/stream/preview/${trackId}`;
  };

  // Xử lý đồng bộ Volume (Chạy riêng khi volume đổi)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = volume === 0;
    }
  }, [volume]);

  const updateVolume = (clientX, element) => {
    const rect = element.getBoundingClientRect();

    const newVolume = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width),
    );

    setVolume(newVolume);
  };

  const handleVolumeMouseDown = (e) => {
    setIsDraggingVolume(true);
    updateVolume(e.clientX, e.currentTarget);
  };

  const volumeBarRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingVolume || !volumeBarRef.current) return;

      updateVolume(e.clientX, volumeBarRef.current);
    };

    const handleMouseUp = () => {
      setIsDraggingVolume(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingVolume]);

  const handleProgressHover = (e) => {
    if (!audioRef.current || !isFinite(audioRef.current.duration)) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;

    const percentage = Math.max(0, Math.min(1, x / rect.width));

    const previewTime = percentage * audioRef.current.duration;

    setHoverTime(previewTime);
    setHoverPosition(x);
  };

  const handleProgressLeave = () => {
    setHoverTime(null);
  };

  // Xử lý Play/Pause và Chuyển bài
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
  }, [isPlaying, currentTrack]);

  // Sync Playback Position (Đồng bộ thời gian nghe mỗi 10 giây)
  useEffect(() => {
    let syncInterval;

    // Chỉ chạy khi user đã đăng nhập, đang có bài hát, và bài hát đang play
    if (isAuthenticated && userId && currentTrack && isPlaying) {
      console.log(
        `[DEBUG - PLAY] Bắt đầu interval sync-time cho bài: ${currentTrack.name}`,
      );
      syncInterval = setInterval(async () => {
        if (audioRef.current) {
          const currentPosition = Math.floor(audioRef.current.currentTime);
          console.log(
            `[DEBUG - SYNC] Chuẩn bị đồng bộ thời gian. Position hiện tại: ${currentPosition}s`,
          );
          // Chỉ gửi nếu đã nghe
          if (currentPosition > 0) {
            try {
              await axiosClient.put("/tracking/sync-time", {
                userId: userId,
                trackId: currentTrack.id,
                position: currentPosition,
              });
              console.log("[DEBUG - SYNC] Đồng bộ thời gian thành công!");
            } catch (error) {
              console.error("[DEBUG - ERROR] Lỗi đồng bộ thời gian:", error);
            }
          }
        }
      }, 10000);
    }

    // Cleanup function: Tự động dọn dẹp interval khi đổi bài hoặc pause
    return () => {
      if (syncInterval) {
        console.log("[DEBUG - PLAY] Dọn dẹp interval sync-time.");
        clearInterval(syncInterval);
      }
    };
  }, [isAuthenticated, userId, currentTrack, isPlaying]);

  // THUẬT TOÁN ANTI-CHEAT & SYNC TIME
  const handleTimeUpdate = async () => {
    if (audioRef.current) {
      const currentVal = audioRef.current.currentTime;
      const durationReal = audioRef.current.duration;

      // CHẶN GUEST KHI NGHE TỚI GIÂY THỨ 30
      if (!isAuthenticated && currentVal >= PREVIEW_LIMIT) {
        audioRef.current.pause();
        usePlayerStore.setState({ isPlaying: false });
        audioRef.current.currentTime = 0;
        setShowGuestModal(true);
        return;
      }

      setCurrentTime(currentVal);
      if (durationReal) {
        setProgress((currentVal / durationReal) * 100);
      }

      const currentSecond = Math.floor(currentVal);
      // Nếu chạm mốc chia hết cho 10 (10, 20, 30, 40, 50...) và chưa đồng bộ mốc này
      if (
        currentSecond > 0 &&
        currentSecond % 10 === 0 &&
        currentSecond !== lastSyncPositionRef.current
      ) {
        lastSyncPositionRef.current = currentSecond; // Khóa lại để không gọi API trùng lặp

        if (isAuthenticated && userId && currentTrack) {
          console.log(
            `[DEBUG - SYNC] Chuẩn bị đồng bộ thời gian. Position hiện tại: ${currentSecond}s`,
          );
          // Dùng then/catch thay cho await để không block luồng đếm thời gian thực của Audio
          axiosClient
            .put("/tracking/sync-time", {
              userId: userId,
              trackId: currentTrack.id,
              position: currentSecond,
            })
            .then(() =>
              console.log("[DEBUG - SYNC] Đồng bộ thời gian thành công!"),
            )
            .catch((error) =>
              console.error("[DEBUG - ERROR] Lỗi đồng bộ thời gian:", error),
            );
        }
      }

      // Bắt đầu tính toán thời gian nghe thực
      const timeDifference = currentVal - lastTimeRef.current;

      // Nếu nhảy < 1.5 giây tức là nhạc đang chạy bình thường (không tua)
      if (timeDifference > 0 && timeDifference <= 0.5) {
        accumulatedTimeRef.current += timeDifference;
      }
      lastTimeRef.current = currentVal;

      // LƯU LỊCH SỬ SAU 10 GIÂY THỰC TẾ
      if (
        accumulatedTimeRef.current >= 10 && // Đã nghe thực tế đủ 10 giây
        !hasSavedHistoryRef.current // Chưa lưu lịch sử cho bài này
      ) {
        hasSavedHistoryRef.current = true; // Khóa cờ lại

        if (isAuthenticated && userId && currentTrack) {
          console.log("[DEBUG - TRACKING] Nghe đủ 10s. Gọi API lưu lịch sử...");
          try {
            await axiosClient.post("/tracking/history", {
              trackId: currentTrack.id,
              userId: userId,
            });
            await axiosClient.put("/tracking/sync-time", {
              trackId: currentTrack.id,
              userId: userId,
              position: Math.floor(currentVal),
            });

            console.log("[SUCCESS] Đã lưu bài hát vào lịch sử!");
          } catch (error) {
            console.error(
              "[DEBUG - ERROR] Lỗi khi gọi API lưu lịch sử:",
              error,
            );
          }
        }
      }

      // In log theo dõi quá trình nghe (Cứ mỗi ~5 giây in 1 lần để đỡ spam)
      if (Math.floor(currentVal) % 5 === 0 && Math.floor(currentVal) !== 0) {
        console.log(
          `[DEBUG - TRACKING] Tiến trình: ${Math.floor(accumulatedTimeRef.current)}s / ${Math.floor(durationReal)}s`,
        );
      }

      // Kiểm tra xem đã nghe đủ 100% thời lượng chưa
      if (
        durationReal > 0 &&
        accumulatedTimeRef.current >= durationReal * 1 && // Nghe full
        !hasRecordedViewRef.current // Chưa cộng view bao giờ
      ) {
        console.log(
          "[DEBUG - TRACKING] Đã đạt đủ điều kiện thời gian nghe! Kiểm tra Auth...",
        );
        hasRecordedViewRef.current = true; // Khóa lại, không cộng đúp nữa

        if (isAuthenticated && userId && currentTrack) {
          console.log(
            `[DEBUG - TRACKING] Auth hợp lệ (User: ${userId}). Gọi API tăng view...`,
          );
          try {
            await axiosClient.post("/tracking/play", {
              trackId: currentTrack.id,
              userId: userId,
            });
            console.log(
              "[SUCCESS] Đã nghe full bài hát, tăng View thành công!",
            );
          } catch (error) {
            console.error("[DEBUG - ERROR] Lỗi khi gọi API tăng view:", error);
          }
        } else {
          console.warn(
            "[DEBUG - WARN] Bị chặn tăng view do: Thiếu isAuthenticated HOẶC userId HOẶC currentTrack!",
          );
        }
      }
    }
  };

  // Khi kết thúc bài -> Lưu lịch sử -> TỰ ĐỘNG NEXT BÀI TIẾP THEO
  const handleTrackEnded = async () => {
    const audio = audioRef.current;

    // Nếu là Guest mà chạy hết bài (dưới 30s) thì cũng chặn và bung Modal
    if (!isAuthenticated) {
      usePlayerStore.setState({ isPlaying: false });
      audio.currentTime = 0;
      setShowGuestModal(true);
      return;
    }

    // RESET VỊ TRÍ VỀ 0 SAU KHI NGHE HẾT BÀI
    if (isAuthenticated && userId && currentTrack) {
      try {
        await axiosClient.put("/tracking/sync-time", {
          trackId: currentTrack.id,
          userId: userId,
          position: 0,
        });
        console.log(
          "[DEBUG] Bài hát kết thúc. Đã reset playback_position về 0.",
        );
      } catch (error) {
        console.error("Lỗi reset vị trí:", error);
      }
    }

    accumulatedTimeRef.current = 0;
    hasSavedHistoryRef.current = false;
    hasRecordedViewRef.current = false;

    const { repeatMode, currentIndex, queue, isFromHistory } =
      usePlayerStore.getState();

    // NẾU PHÁT TỪ TRANG LỊCH SỬ -> HẾT BÀI LÀ DỪNG
    if (isFromHistory) {
      if (isAuthenticated && userId && currentTrack) {
        try {
          await axiosClient.put("/tracking/sync-time", {
            trackId: currentTrack.id,
            userId: userId,
            position: 0,
          });
        } catch (error) {
          console.error("Lỗi reset vị trí:", error);
        }
      }

      usePlayerStore.setState({ isPlaying: false });
      accumulatedTimeRef.current = 0;
      hasSavedHistoryRef.current = false;
      hasRecordedViewRef.current = false;
      return;
    }

    if (repeatMode === "one") {
      audio.currentTime = 0;
      audio.play();
      return;
    }

    if (repeatMode === "off") {
      if (currentIndex === queue.length - 1) {
        usePlayerStore.setState({
          isPlaying: false,
        });
        return;
      }
    }

    playNext();
  };

  // Kiểm tra xem bài hát này có lưu vị trí nghe cũ không (playbackPosition)
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      // Lấy thời lượng thực tế của file audio
      setDuration(audioRef.current.duration);

      // Chạy tiếp logic cũ
      if (currentTrack.playbackPosition) {
        audioRef.current.currentTime = currentTrack.playbackPosition;
      }
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * audioRef.current.duration;

      // GUEST KHÔNG ĐƯỢC TUA QUÁ GIỚI HẠN 30S
      if (!isAuthenticated && newTime >= PREVIEW_LIMIT) {
        audioRef.current.pause();
        usePlayerStore.setState({ isPlaying: false });
        setShowGuestModal(true);
        return;
      }

      if (isFinite(newTime)) {
        audioRef.current.currentTime = newTime;
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlay]);

  if (!currentTrack) return null;

  return (
    <>
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className={`fixed right-6 z-[101] p-2 bg-[#282828] text-[#a7a7a7] hover:text-white hover:bg-[#3e3e3e] rounded-full shadow-lg transition-all duration-300 ${
          isMinimized ? "bottom-4" : "bottom-28"
        }`}
        title={isMinimized ? "Hiện trình phát nhạc" : "Ẩn trình phát nhạc"}
      >
        {isMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      <div
        className={`fixed bottom-0 left-0 right-0 h-24 bg-[#181818] border-t border-[#282828] flex items-center justify-between px-6 z-[100] transition-transform duration-300 ${
          isMinimized ? "translate-y-full" : "translate-y-0 animate-fadeIn"
        }`}
      >
        <audio
          ref={audioRef}
          src={currentTrack?.id ? getStreamUrl(currentTrack.id) : ""}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleTrackEnded}
          onLoadedMetadata={handleLoadedMetadata}
          loop={repeatMode === "one"}
          onError={(e) => {
            console.error("Lỗi không thể tải nguồn nhạc:", e.target.error);
          }}
        />

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

        <div className="flex flex-col items-center justify-center w-2/4 gap-2">
          <div className="flex items-center gap-5">
            <button
              onClick={toggleShuffle}
              className={`border-none bg-transparent cursor-pointer transition-colors ${
                isShuffle ? "text-green-500" : "text-[#a7a7a7] hover:text-white"
              }`}
            >
              <Shuffle size={18} />
            </button>

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

            <button
              onClick={playNext}
              className="text-[#a7a7a7] hover:text-white transition-colors cursor-pointer border-none bg-transparent"
            >
              <SkipForward size={20} />
            </button>

            <button
              onClick={toggleRepeatMode}
              className={`border-none bg-transparent cursor-pointer transition-colors ${
                repeatMode !== "off"
                  ? "text-green-500"
                  : "text-[#a7a7a7] hover:text-white"
              }`}
            >
              {repeatMode === "one" ? (
                <Repeat1 size={18} />
              ) : (
                <Repeat size={18} />
              )}
            </button>
          </div>

          <div className="w-full max-w-md flex items-center gap-3 group">
            <span className="text-[11px] font-mono text-[#a7a7a7] min-w-[35px] text-right">
              {formatTime(currentTime)}
            </span>

            <div
              className="group h-1.5 flex-1 bg-[#3e3e3e] rounded-full cursor-pointer relative"
              onClick={handleSeek}
              onMouseMove={handleProgressHover}
              onMouseLeave={handleProgressLeave}
            >
              {hoverTime !== null && (
                <>
                  <div
                    className="absolute top-0 left-0 h-full bg-white/30 rounded-full pointer-events-none z-10"
                    style={{
                      width: `${hoverPosition}px`,
                    }}
                  />
                  <div
                    className="absolute -top-10 px-2 py-1 text-xs rounded bg-[#282828] text-white shadow-lg whitespace-nowrap z-30 pointer-events-none"
                    style={{
                      left: `${hoverPosition}px`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    {formatTime(hoverTime)}
                  </div>
                </>
              )}

              <div
                className="absolute top-0 left-0 h-full bg-white group-hover:bg-blue-500 transition-colors rounded-full z-20"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <span className="text-[11px] font-mono text-[#a7a7a7] min-w-[35px] text-left">
              {formatTime(
                !isAuthenticated
                  ? PREVIEW_LIMIT
                  : duration || currentTrack?.duration,
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end w-1/4 gap-3 text-[#a7a7a7]">
          {volume === 0 ? (
            <VolumeX
              size={20}
              className="cursor-pointer hover:text-white transition-colors"
              onClick={() => setVolume(1)}
            />
          ) : volume <= 0.3 ? (
            <Volume
              size={20}
              className="cursor-pointer hover:text-white transition-colors"
              onClick={() => setVolume(0)}
            />
          ) : volume <= 0.7 ? (
            <Volume1
              size={20}
              className="cursor-pointer hover:text-white transition-colors"
              onClick={() => setVolume(0)}
            />
          ) : (
            <Volume2
              size={20}
              className="cursor-pointer hover:text-white transition-colors"
              onClick={() => setVolume(0)}
            />
          )}

          <div
            ref={volumeBarRef}
            className="w-24 h-1.5 bg-[#3e3e3e] rounded-full cursor-pointer group relative"
            onMouseDown={handleVolumeMouseDown}
          >
            <div
              className="h-full bg-white group-hover:bg-blue-500 transition-colors rounded-full relative"
              style={{ width: `${volume * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL BẮT BUỘC ĐĂNG NHẬP DÀNH CHO GUEST */}
      {showGuestModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#181818] border border-[#3e3e3e] p-8 rounded-2xl w-[90%] max-w-md shadow-2xl text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-500 flex items-center justify-center rounded-full mb-5 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Lock size={32} />
            </div>
            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
              Khám phá không giới hạn
            </h3>
            <p className="text-sm text-[#a7a7a7] mb-8 leading-relaxed px-2">
              Bạn đang sử dụng phiên bản dùng thử 30 giây. Hãy đăng nhập tài
              khoản miễn phí để mở khóa toàn bộ bài hát, tạo danh sách phát,
              tương tác cộng đồng và nhiều đặc quyền khác!
            </p>
            <div className="flex w-full gap-4">
              <button
                onClick={() => setShowGuestModal(false)}
                className="flex-1 py-3.5 px-4 rounded-full text-sm font-bold text-white bg-transparent border border-[#3e3e3e] hover:border-[#a7a7a7] hover:bg-white/5 transition-all cursor-pointer"
              >
                Bỏ qua
              </button>
              <button
                onClick={() => {
                  setShowGuestModal(false);
                  navigate("/login");
                }}
                className="flex-1 py-3.5 px-4 rounded-full text-sm font-bold text-black bg-white hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all cursor-pointer border-none"
              >
                Đăng nhập ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const formatTime = (seconds) => {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (s === 60) return `${m + 1}:00`;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export default MusicPlayer;
