import { create } from "zustand";

export const usePlayerStore = create((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [], // Lưu trữ danh sách bài hát đang phát (Album, Playlist, hoặc Top 5...)
  currentIndex: -1, // Vị trí của bài hát hiện tại trong mảng
  isShuffle: false,
  repeatMode: "off", // off | all | one

  // Cập nhật playTrack: Nhận thêm 'newQueue' là danh sách bài hát ngữ cảnh
  playTrack: (track, newQueue = []) => {
    // Tìm xem bài hát này nằm ở đâu trong mảng được truyền vào
    const index = newQueue.findIndex((t) => t.id === track.id);

    set({
      currentTrack: track,
      isPlaying: true,
      queue: newQueue.length > 0 ? newQueue : [track], // Nếu không có mảng, coi như chỉ phát 1 bài
      currentIndex: index !== -1 ? index : 0,
    });
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  // Logic Next: Tăng index lên 1. Nếu hết mảng thì quay lại bài đầu tiên (Vòng lặp)
  playNext: () => {
    const { queue, currentIndex, isShuffle } = get();

    if (queue.length === 0) return;

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);

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
      const randomIndex = Math.floor(Math.random() * queue.length);

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
