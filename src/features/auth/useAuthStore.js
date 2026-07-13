import { create } from 'zustand';

const decodeJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const useAuthStore = create((set) => ({
    userId: localStorage.getItem('userId') || null,
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

  loginWithGoogle: (token) => {
    const payload = decodeJwt(token);
    if (!payload) {
      set({ error: "Token Google không hợp lệ." });
      return false;
    }

    let finalRole = (payload.role || "listener")
        .replace("ROLE_", "")
        .toLowerCase();
    if (finalRole === "user") finalRole = "listener";

    // Dùng chung key với loginSuccess → không xung đột
    localStorage.setItem("accessToken", token);
    localStorage.setItem("userId", payload.id ?? "");
    localStorage.setItem("username", payload.sub ?? "");
    localStorage.setItem("role", finalRole);
    if (payload.img) localStorage.setItem("userImg", payload.img);

    set({
      id: payload.id ?? null,
      username: payload.sub ?? null,
      img: payload.img ?? null,
      role: finalRole,
      isAuthenticated: true,
      error: null,
    });

    return true;
  },
}));
