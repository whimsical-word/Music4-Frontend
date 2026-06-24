import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    userId: localStorage.getItem('userId') || null,
    username: localStorage.getItem('username') || null,
    img: localStorage.getItem('userImg') || null,
    role: localStorage.getItem('role') || 'listener',
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,
    error: null,

    // Hứng thêm id và img từ file LoginPage truyền sang
    loginSuccess: (accessToken, refreshToken, id, username, img, role) => {
        let finalRole = role.replace('ROLE_', '').toLowerCase();
        if (finalRole === 'user') finalRole = 'listener';

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', id);
        localStorage.setItem('username', username);
        localStorage.setItem('role', finalRole);
        if (img && img !== 'null') localStorage.setItem('userImg', img);

        set({
            userId: id,
            username: username,
            img: img && img !== 'null' ? img : null,
            role: finalRole,
            isAuthenticated: true,
            error: null
        });
    },

    logout: () => {
        localStorage.clear();
        set({
            userId: null,
            username: null,
            img: null,
            role: 'listener',
            isAuthenticated: false,
            error: null
        });
    },

    setAuthError: (errorMsg) => set({ error: errorMsg }),
    setLoading: (isLoading) => set({ isLoading }),
}));

