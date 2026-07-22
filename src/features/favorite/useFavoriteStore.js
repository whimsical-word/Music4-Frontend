import { create } from 'zustand';
import axiosClient from '../../app/axios/axiosClient';

export const useFavoriteStore = create((set, get) => ({
    likedTracks: [], // Chứa danh sách các FavoriteResponseDTO
    isLoading: false,

    // 1. Tải danh sách bài hát đã thích từ Backend
    fetchLikedTracks: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosClient.get('/favorites/me');
            const data = res.data || res || [];
            set({ likedTracks: data, isLoading: false });
        } catch (error) {
            console.error("Lỗi tải danh sách bài hát đã thích:", error);
            set({ isLoading: false });
        }
    },

    // 2. Kiểm tra trạng thái thích của một trackId (Dựa trên Local State)
    isTrackLiked: (trackId) => {
        return get().likedTracks.some(fav => Number(fav.trackId) === Number(trackId));
    },

    // 3. Đảo trạng thái trực tiếp trên UI ngay khi bấm nút (Không cần F5)
    toggleTrackInStore: (track, isLiked) => {
        const { likedTracks } = get();
        if (isLiked) {
            // Nếu được thích -> Map dữ liệu sang cấu trúc FavoriteResponseDTO rồi đẩy vào mảng
            const newFav = {
                trackId: track.id,
                trackName: track.name,
                img: track.img
            };
            set({ likedTracks: [newFav, ...likedTracks] });
        } else {
            // Nếu bỏ thích -> Lọc bỏ dựa trên trackId
            set({ likedTracks: likedTracks.filter(fav => Number(fav.trackId) !== Number(track.id)) });
        }
    },
    clearFavoriteStore: () => set({ likedTracks: [], isLoading: false }),
}));