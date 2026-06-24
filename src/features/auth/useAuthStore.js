import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    // 🔥 ĐỔI TẠI ĐÂY: Dùng id làm key quản lý duy nhất trong State thay vì userId
    id: localStorage.getItem('userId') || null,
    username: localStorage.getItem('username') || null,
    img: localStorage.getItem('userImg') || null,
    role: localStorage.getItem('role') || 'listener',
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,
    error: null,

    loginSuccess: (accessToken, refreshToken, id, username, img, role) => {
        let finalRole = role.replace('ROLE_', '').toLowerCase();
        if (finalRole === 'user') finalRole = 'listener';

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', id); // Key dưới localStorage giữ nguyên ko sao cả
        localStorage.setItem('username', username);
        localStorage.setItem('role', finalRole);
        if (img && img !== 'null') localStorage.setItem('userImg', img);

        set({
            id: id, // Cập nhật chính xác vào key id ở trên
            username: username,
            img: img && img !== 'null' ? img : null,
            role: finalRole,
            isAuthenticated: true,
            error: null
        });
    },

    logout: () => {
        localStorage.clear();
        // Clear sạch sẽ key id về null để người sau không bị dính dữ liệu
        set({ id: null, username: null, img: null, role: 'listener', isAuthenticated: false, error: null });
    },

    setAuthError: (errorMsg) => set({ error: errorMsg }),
    setLoading: (isLoading) => set({ isLoading }),
}));