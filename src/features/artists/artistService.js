import axiosClient from '../../app/axios/axiosClient';

const artistService = {
    getAllArtists: async () => {
        // API lấy toàn bộ danh sách nghệ sĩ trong hệ thống
        const response = await axiosClient.get("/artists");
        return response.data;
    }
};
export default artistService;