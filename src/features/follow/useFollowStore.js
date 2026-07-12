import { create } from 'zustand';
import axiosClient from '../../app/axios/axiosClient';
import { useAuthStore } from '../auth/useAuthStore'; // Hãy chắc chắn path này đã đúng sau khi fix lỗi import

export const useFollowStore = create((set, get) => ({
    followedArtistIds: [], // Lưu mảng ID nghệ sĩ đã follow: [1, 2, 5...]
    isLoadingFollow: false,

    // Lấy danh sách ID các nghệ sĩ đã follow từ backend
    fetchFollowedArtists: async () => {
        const userId = useAuthStore.getState().userId;
        if (!userId) return;
        try {
            const res = await axiosClient.get(`/follows/user/${userId}`);
            const data = res.data || [];

            // Trích xuất id nghệ sĩ và ép về kiểu Number
            const ids = data.map(item => Number(item.id || item.artistId || (item.artist && item.artist.id)));
            set({ followedArtistIds: ids });
        } catch (error) {
            console.error("Lỗi lấy danh sách follow:", error);
        }
    },

    // Xử lý bật/tắt follow (Toggle)
    toggleFollowArtist: async (artistId) => {
        const { followedArtistIds } = get();
        const cleanArtistId = Number(artistId);
        const isFollowing = followedArtistIds.includes(cleanArtistId);
        const userId = useAuthStore.getState().userId;

        if (!userId) {
            console.error("User chưa đăng nhập hoặc không tìm thấy userId!");
            return;
        }

        // Optimistic UI cập nhật nhanh giao diện trước
        if (isFollowing) {
            set({ followedArtistIds: followedArtistIds.filter(id => id !== cleanArtistId) });
        } else {
            set({ followedArtistIds: [...followedArtistIds, cleanArtistId] });
        }

        try {
            await axiosClient.post(`/follows/toggle?userId=${userId}&artistId=${cleanArtistId}`);
        } catch (error) {
            console.error("Lỗi xử lý follow phía server:", error);
            set({ followedArtistIds }); // Hoàn tác (rollback) trạng thái nếu lỗi API
        }
    }
}));