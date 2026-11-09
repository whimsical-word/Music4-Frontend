import { useEffect, useState } from 'react';
import axiosClient from '../../app/axios/axiosClient';
import { API_ORIGIN, getAccessToken } from '../../app/config';

// Một kết nối SSE duy nhất cho mỗi userId, dùng chung giữa Navbar / NotificationBell.
const shared = { key: null, source: null, listeners: new Set() };

const subscribe = (userId, listener) => {
    shared.listeners.add(listener);
    if (!shared.source || shared.key !== userId) {
        shared.source?.close();
        const token = encodeURIComponent(getAccessToken() || '');
        const source = new EventSource(
            `${API_ORIGIN}/api/notifications/subscribe/${userId}?token=${token}`
        );
        source.addEventListener('NEW_TRACK', (event) => {
            const noti = JSON.parse(event.data);
            shared.listeners.forEach((fn) => fn(noti));
        });
        source.onerror = (err) => console.error('Lỗi kết nối SSE:', err);
        shared.source = source;
        shared.key = userId;
    }
    return () => {
        shared.listeners.delete(listener);
        if (shared.listeners.size === 0) {
            shared.source?.close();
            shared.source = null;
            shared.key = null;
        }
    };
};

export const useNotifications = (userId, enabled = true) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!enabled || !userId) return;
        let cancelled = false;

        axiosClient.get(`/notifications/user/${userId}`)
            .then((res) => { if (!cancelled) setNotifications(res.data); })
            .catch((err) => console.error('Lỗi lấy thông báo cũ:', err));

        const unsubscribe = subscribe(userId, (noti) =>
            setNotifications((prev) => [noti, ...prev])
        );
        return () => { cancelled = true; unsubscribe(); };
    }, [userId, enabled]);

    return [notifications, setNotifications];
};
