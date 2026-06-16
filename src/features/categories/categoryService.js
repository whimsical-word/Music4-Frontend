import axiosClient from '../../app/axios/axiosClient';

const categoryService = {
    getAllCategories: async () => {
        // Giả sử API lấy toàn bộ Category của bồ là GET /categories hoặc GET /api/categories
        const response = await axiosClient.get("/categories");
        return response.data;
    }
};
export default categoryService;