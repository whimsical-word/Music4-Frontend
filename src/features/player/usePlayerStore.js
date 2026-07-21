import { create } from "zustand";

export const usePlayerStore = create((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [], // Lưu trữ danh sách bài hát đang phát (Album, Playlist, hoặc Top 5...)
  currentIndex: -1, // Vị trí của bài hát hiện tại trong mảng
  isShuffle: false,
  repeatMode: "off", // off | all | one
  isFromHistory: false,

  playTrack: (track, queueParam = [], fromHistory = false) => {
    const finalQueue = queueParam.length > 0 ? queueParam : [track];
    const targetIndex = finalQueue.findIndex((t) => t.id === track.id);

    set({
      currentTrack: track,
      queue: finalQueue,
      currentIndex: targetIndex !== -1 ? targetIndex : 0,
      isPlaying: true,
      isFromHistory: fromHistory,
    });
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  // Logic Next: Tăng index lên 1. Nếu hết mảng thì quay lại bài đầu tiên (Vòng lặp)
  playNext: () => {
    const { queue, currentIndex, isShuffle } = get();

    if (queue.length === 0) return;

    if (isShuffle) {
      let randomIndex;
      if (queue.length > 1) {
        do {
          randomIndex = Math.floor(Math.random() * queue.length);
        } while (randomIndex === currentIndex);
      } else {
        randomIndex = 0;
      }
      set({
        currentTrack: queue[randomIndex],
        currentIndex: randomIndex,
        isPlaying: true,
      });
      return;
    }

    const nextIndex = (currentIndex + 1) % queue.length;

    set({
      currentTrack: queue[nextIndex],
      currentIndex: nextIndex,
      isPlaying: true,
    });
  },

  // Logic Prev: Giảm index. Nếu đang ở bài đầu thì lùi về bài cuối cùng
  playPrev: () => {
    const { queue, currentIndex, isShuffle } = get();

    if (queue.length === 0) return;

    if (isShuffle) {
      let randomIndex;
      if (queue.length > 1) {
        do {
          randomIndex = Math.floor(Math.random() * queue.length);
        } while (randomIndex === currentIndex);
      } else {
        randomIndex = 0;
      }
      set({
        currentTrack: queue[randomIndex],
        currentIndex: randomIndex,
        isPlaying: true,
      });
      return;
    }

    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;

    set({
      currentTrack: queue[prevIndex],
      currentIndex: prevIndex,
      isPlaying: true,
    });
  },

  stop: () =>
    set({ currentTrack: null, isPlaying: false, queue: [], currentIndex: -1 }),

  toggleShuffle: () =>
    set((state) => ({
      isShuffle: !state.isShuffle,
    })),

  toggleRepeatMode: () =>
    set((state) => ({
      repeatMode:
        state.repeatMode === "off"
          ? "all"
          : state.repeatMode === "all"
            ? "one"
            : "off",
    })),
}));
