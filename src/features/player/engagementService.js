import axiosClient from '../../app/axios/axiosClient';

export const engagementService = {
    // 1. LẤY DANH SÁCH BÌNH LUẬN CỦA BÀI HÁT
    getCommentsByTrack: async (trackId) => {
        const res = await axiosClient.get(`/comments/track/${trackId}`);
        return res.data || res || [];
    },

    // 2. THÊM BÌNH LUẬN MỚI
    addComment: async (trackId, content, userId) => {
        // Gửi Object đúng cấu hình CommentRequest mà Backend đang yêu cầu
        const res = await axiosClient.post('/comments', {
            trackId: Number(trackId),
            userId: userId ? Number(userId) : null, // 🟢 Đính kèm userId chuẩn chỉnh
            artistId: null,
            content: content
        });
        return res.data || res;
    },

    // 3. XỬ LÝ CLICK THẢ TIM (Gửi dạng /favorites/toggle/1 theo PathVariable)
    toggleLikeTrack: async (trackId) => {
        const res = await axiosClient.post(`/favorites/toggle/${trackId}`);
        return res.data || res;
    },


    // 4. KIỂM TRA TRẠNG THÁI TIM HIỆN TẠI
    checkIsLiked: async (trackId) => {
        try {
            const res = await axiosClient.get('/favorites/me');
            const favoriteList = res.data || res || [];

            const isLiked = favoriteList.some(fav => {
                if (!fav) return false;
                if (fav.trackId == trackId || fav.id == trackId) return true;
                if (fav.track && fav.track.id == trackId) return true;
                return false;
            });
            return { liked: isLiked };
        } catch (error) {
            console.error("Lỗi kiểm tra trạng thái tim:", error);
            return { liked: false };
        }
    },
    getFavoritesMeRaw: async () => {
        const res = await axiosClient.get('/favorites/me');
        return res.data || res || []; // Trả về mảng chứa danh sách bài hát đã thích
    }
};
