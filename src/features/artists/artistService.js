import axiosClient from '../../app/axios/axiosClient';

const artistService = {
    getAllArtists: async () => {
        // API lấy toàn bộ danh sách nghệ sĩ trong hệ thống
        const response = await axiosClient.get("/artists");
        return response.data;
    },

    getAllArtistsNoPageable: async () => {
        // API lấy toàn bộ danh sách nghệ sĩ trong hệ thống
        const response = await axiosClient.get("/artists/all");
        return response.data;
    },

    updateTrack: async (id, formData) => {
        try {
            const response = await axiosClient.put(`/tracks/update/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data || response;
        } catch (error) {
            console.error(`[trackService] Lỗi khi cập nhật bài hát ID ${id}:`, error);
            throw error;
        }
    },

    getTrackById: async (id) => {
        try {
            const response = await axiosClient.get(`/tracks/${id}`);
            return response.data || response;
        } catch (error) {
            console.error(`[trackService] Lỗi khi lấy chi tiết bài hát ID ${id}:`, error);
            throw error;
        }
    },
};
export default artistService;