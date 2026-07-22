import axios from "axios";
import { useErrorStore } from "../../features/error/useErrorStore";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================
// Request Interceptor
// =========================
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// =========================
// Token Refresh Queue
// =========================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// =========================
// Response Interceptor
// =========================
axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // =========================================
    // 401 - Access Token hết hạn
    // =========================================
    if (
      status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/refresh") &&
      !originalRequest?.url?.includes("/auth/logout")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
          });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const oldRefreshToken = localStorage.getItem("refreshToken");

        if (!oldRefreshToken) {
          throw new Error("No refresh token available");
        }

        const res = await axios.post("http://localhost:8080/api/auth/refresh", {
          refreshToken: oldRefreshToken,
        });

        const { accessToken, refreshToken } = res.data;

        localStorage.setItem("accessToken", accessToken);

        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);

        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        localStorage.clear();

        // Không cần window.location.href
        // Nếu muốn 401 page:
        useErrorStore.getState().setErrorStatus(401);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // =========================================
    // 403 - Forbidden
    // =========================================
    if (status === 403) {
      console.error("403 Forbidden:", error.response?.data);

      useErrorStore.getState().setErrorStatus(403);

      return Promise.reject(error);
    }

    // =========================================
    // 404 - Not Found
    // =========================================
    if (status === 404) {
      console.error("404 Not Found:", error.response?.data);

      useErrorStore.getState().setErrorStatus(404);

      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
