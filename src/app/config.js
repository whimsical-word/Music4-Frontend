// Origin của API Gateway (không có dấu "/" cuối, không có "/api").
// Dev: http://localhost:8080 | Prod (Vercel): đặt biến VITE_API_ORIGIN.
export const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080').replace(/\/+$/, '')

// Tương thích ngược: VITE_API_BASE_URL cũ (dùng cho OAuth2 Google) giờ trỏ về API_ORIGIN.
export const API_BASE_URL = `${API_ORIGIN}/api`

export const getAccessToken = () => localStorage.getItem('accessToken')
