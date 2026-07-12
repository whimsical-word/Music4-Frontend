import { create } from "zustand";
import axiosClient from "../../app/axios/axiosClient";

export const usePlaylistStore = create((set, get) => ({
    playlists: [],
    isLoading: false,
    error: null,

    // 1. Lấy danh sách playlist cá nhân
    fetchMyPlaylists: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosClient.get("/playlists/my-playlists");
            const data = res.data || res;
            set({ playlists: Array.isArray(data) ? data : [], isLoading: false });
        } catch (err) {
            console.error("Lỗi lấy danh sách playlist:", err);
            set({ error: "Không thể tải danh sách playlist.", isLoading: false });
        }
    },

    // 2. Tạo Playlist mới
    createPlaylist: async (playlistRequest) => {
        try {
            const res = await axiosClient.post("/playlists", playlistRequest);
            const newPlaylist = res.data || res;

            set((state) => ({
                playlists: [newPlaylist, ...state.playlists],
            }));
            return { success: true, data: newPlaylist };
        } catch (err) {
            console.error("Lỗi tạo playlist:", err);
            return { success: false, message: err.response?.data?.message || "Tạo thất bại." };
        }
    },

    // 3. Cập nhật Playlist (Tên & Mô tả)
    updatePlaylist: async (id, playlistRequest) => {
        try {
            const res = await axiosClient.put(`/playlists/${id}`, playlistRequest);
            const updatedPlaylist = res.data || res;

            set((state) => ({
                playlists: state.playlists.map((pl) => (pl.id === id ? updatedPlaylist : pl)),
            }));
            return { success: true };
        } catch (err) {
            console.error("Lỗi cập nhật playlist:", err);
            return { success: false };
        }
    },

    uploadPlaylistImage: async (id, file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            // Gọi đúng endpoint upload ảnh dạng multipart/form-data
            const res = await axiosClient.put(`/playlists/${id}/image`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            const updatedPlaylist = res.data || res;

            // Cập nhật lại state của danh sách playlist để giao diện React tự re-render ảnh mới
            set((state) => ({
                playlists: state.playlists.map((pl) => (pl.id === id ? updatedPlaylist : pl)),
            }));
            return { success: true, data: updatedPlaylist };
        } catch (err) {
            console.error("Lỗi upload ảnh playlist:", err);
            return { success: false, message: err.response?.data?.message || "Upload ảnh thất bại." };
        }
    },

    // 4. Xóa Playlist
    deletePlaylist: async (id) => {
        try {
            await axiosClient.delete(`/playlists/${id}`);
            set((state) => ({
                playlists: state.playlists.filter((pl) => pl.id !== id),
            }));
            return { success: true };
        } catch (err) {
            console.error("Lỗi xóa playlist:", err);
            return { success: false };
        }
    },

    // 5. Thêm bài hát vào Playlist
    addTrackToPlaylist: async (playlistId, trackId) => {
        try {
            await axiosClient.post(`/playlists/${playlistId}/tracks`, { trackId });
            return { success: true, message: "Thêm vào playlist thành công!" };
        } catch (err) {
            console.error("Lỗi thêm track vào playlist:", err);
            return { success: false, message: err.response?.data?.message || "Thêm thất bại." };
        }
    },

    // 6. Xóa bài hát khỏi Playlist
    removeTrackFromPlaylist: async (playlistId, trackId) => {
        try {
            await axiosClient.delete(`/playlists/${playlistId}/tracks/${trackId}`);
            return { success: true, message: "Đã loại bỏ bài hát khỏi playlist." };
        } catch (err) {
            console.error("Lỗi xóa track khỏi playlist:", err);
            return { success: false };
        }
    },
}));