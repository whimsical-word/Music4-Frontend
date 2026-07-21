import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

// Hàm hỗ trợ đọc JSON an toàn từ localStorage
const getSafeParsedJSON = (key) => {
    try {
        const item = localStorage.getItem(key);
        if (!item || item === "undefined" || item === "null") return null;
        return JSON.parse(item);
    } catch (e) {
        return null;
    }
};

export const useAuthStore = create((set) => ({
    userId: localStorage.getItem('userId') || null,
    username: localStorage.getItem('username') || null,
    img: localStorage.getItem('userImg') || null,
    // ✅ Đã sửa: Dùng hàm đọc an toàn thay vì trực tiếp JSON.parse()
    name: getSafeParsedJSON('name'),
    role: localStorage.getItem('role') || 'listener',
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,
    error: null,

    loginSuccess: (accessToken, refreshToken, id, username, img, role) => {
        const payload = jwtDecode(accessToken);
        const name = payload?.name || null;

        let finalRole = (role || '').replace('ROLE_', '').toLowerCase();
        if (finalRole === 'user') finalRole = 'listener';

        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        if (id) localStorage.setItem('userId', id);

        // ✅ Chỉ stringify khi name thực sự tồn tại
        if (name) {
            localStorage.setItem('name', JSON.stringify(name));
        } else {
            localStorage.removeItem('name');
        }

        if (username) localStorage.setItem('username', username);
        if (finalRole) localStorage.setItem('role', finalRole);
        if (img && img !== 'null') localStorage.setItem('userImg', img);

        set({
            userId: id,
            username: username,
            img: img && img !== 'null' ? img : null,
            name: name,
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
            name: null,
            role: 'listener',
            isAuthenticated: false,
            error: null
        });
    },

    setAuthError: (errorMsg) => set({ error: errorMsg }),
    setLoading: (isLoading) => set({ isLoading }),

    loginWithGoogle: (token) => {
        try {
            const payload = jwtDecode(token);
            if (!payload) {
                set({ error: "Token Google không hợp lệ." });
                return false;
            }

            let finalRole = (payload.role || "listener")
                .replace("ROLE_", "")
                .toLowerCase();
            if (finalRole === "user") finalRole = "listener";

            const finalUserId = payload.id ? String(payload.id) : null;
            const finalUsername = payload.sub || null;
            const name = payload.name ? String(payload.name) : null;

            if (finalUserId) localStorage.setItem("userId", finalUserId);
            if (finalUsername) localStorage.setItem("username", finalUsername);
            localStorage.setItem("accessToken", token);

            // ✅ Chỉ lưu name nếu có giá trị
            if (name) {
                localStorage.setItem("name", JSON.stringify(name));
            } else {
                localStorage.removeItem("name");
            }

            if (payload.img && payload.img !== 'null') localStorage.setItem("userImg", payload.img);

            set({
                userId: finalUserId,
                username: finalUsername,
                img: payload.img && payload.img !== 'null' ? payload.img : null,
                name: name,
                role: finalRole,
                isAuthenticated: true,
                error: null,
            });

            return true;
        } catch (err) {
            set({ error: "Lỗi giải mã token Google." });
            return false;
        }
    },

    updateProfile: (newName, newImg) => {
        set((state) => {
            if (newName) localStorage.setItem('username', newName);
            if (newImg && newImg !== 'null') {
                localStorage.setItem('userImg', newImg);
            }

            return {
                username: newName || state.username,
                img: newImg && newImg !== 'null' ? newImg : state.img
            };
        });
    },
}));