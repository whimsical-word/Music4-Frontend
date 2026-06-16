import axiosClient from '../../app/axios/axiosClient';

const trackService = {
    // API lấy toàn bộ bài hát bản chi tiết (Cho trang AllTracksPage của bạn)
    getAllTracksDetail: async () => {
        const response = await axiosClient.get('/tracks');
        return response.data; // Trả về mảng List<TrackDetailResponseDTO> từ Back-End
    },

    // API lấy Top 5 bài hát view cao nhất (Cho trang HomePage nếu cần dùng sau này)
    getTop5MostViewed: async () => {
        const response = await axiosClient.get('/tracks/top5-views');
        return response.data;
    },

    createTrack: async (formData) => {
        const response = await axiosClient.post('/tracks', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Bắt buộc để Spring Boot bóc tách file
            },
        });
        return response.data;
    }
};

export default trackService;