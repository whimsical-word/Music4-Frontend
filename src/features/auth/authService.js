import axiosClient from "../../app/axios/axiosClient.js";

export const authService = {
    createForgotPwRequest: async (email) => {
        const response = await axiosClient.post('auth/forgot-password', email, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    },

    resetPassword: async ({token, newPassword}) => {
        const response = await axiosClient.post('auth/reset-password',
            { token, newPassword }, {
            headers: {
                'Content-Type': 'application/json',
            }
            });
        return response;
    }
}