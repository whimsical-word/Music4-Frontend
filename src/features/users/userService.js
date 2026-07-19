import axiosClient from "../../app/axios/axiosClient.js";

export const userService = {
    updateUser: async (id, {img, name}) => {
        const response = await axiosClient.patch(`users/${id}`,
            { img, name }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
        return response;
    },

    getUserById: async (id) => {
        const response = await axiosClient.get(`users/${id}`);
        return response;
    }
}