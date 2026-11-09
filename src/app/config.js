// Hỗ trợ cả VITE_API_URL lẫn VITE_API_BASE_URL, fallback http://localhost:8080 nếu biến môi trường chưa được set
const rawEnvUrl =
  import.meta.env.VITE_API_ORIGIN ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";

const trimmedUrl = String(rawEnvUrl).replace(/\/+$/, "");

// Đảm bảo không bị lặp /api nếu biến môi trường đã có sẵn /api
export const API_URL = trimmedUrl.endsWith("/api")
  ? trimmedUrl.slice(0, -4)
  : trimmedUrl;

export const API_BASE = `${API_URL}/api`;
export const MEDIA_BASE = `${API_BASE}/media`;

export const getAccessToken = () => localStorage.getItem("accessToken");

const withToken = (url) => {
  const token = getAccessToken();
  return token ? `${url}${url.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}` : url;
};

// Ảnh / file media: gọi qua /api/media/file?key=<key> (công khai không cần token)
export const getMediaUrl = (key) => {
  if (!key || key === "null") return "";
  if (/^https?:\/\//i.test(key)) return key;
  const cleanKey = String(key).replace(/^\/+/, "");
  return `${MEDIA_BASE}/file?key=${encodeURIComponent(cleanKey)}`;
};

// Stream nhạc: thẻ <audio> không gửi Bearer header nên đính kèm ?token=<access_token>
// Gọi qua content-service (/api/tracks/stream/<id>), service sẽ 302 redirect sang media-service stream S3
export const getStreamUrl = (trackId, authenticated = true) => {
  if (!trackId) return "";
  const baseUrl = `${API_BASE}/tracks/stream`;
  const url = authenticated
    ? `${baseUrl}/${trackId}`
    : `${baseUrl}/preview/${trackId}`;
  return withToken(url);
};
