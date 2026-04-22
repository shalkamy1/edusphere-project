import { useState, useEffect, useRef, useCallback } from 'react';
import {
    getNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotificationById,
    getToken,
} from '../api.js';

/**
 * useNotifications — Custom React Hook
 *
 * Manages the full notification lifecycle for a single user:
 *  1. Fetches notifications from the REST API on mount
 *  2. Optionally connects to Laravel Reverb via LaravelEcho for real-time updates
 *  3. Exposes functions to mark read, mark all read, and delete
 *
 * Compatible with:
 *  - Laravel Reverb (WebSocket server)
 *  - Laravel Echo (client library)
 *  - Graceful fallback if Echo/Reverb is unavailable (REST-only mode)
 *
 * @param {number|null} userId - The authenticated user's ID
 * @returns {{
 *   notifications: AppNotification[],
 *   unreadCount: number,
 *   loading: boolean,
 *   page: number,
 *   hasMore: boolean,
 *   markAsRead: (id: number) => void,
 *   markAllRead: () => void,
 *   removeNotification: (id: number) => void,
 *   loadMore: () => void,
 *   addRealtime: (n: AppNotification) => void,
 * }}
 */
export function useNotifications(userId) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount]     = useState(0);
    const [loading, setLoading]             = useState(true);
    const [page, setPage]                   = useState(1);
    const [hasMore, setHasMore]             = useState(false);

    // Reference to the Echo channel so we can unsubscribe on cleanup
    const channelRef = useRef(null);
    // Track mount state to avoid setting state after unmount
    const mountedRef = useRef(true);

    // ── Fetch from REST API ────────────────────────────────────────────────

    /**
     * Load the first page of notifications.
     * Called on mount and after markAllRead.
     */
    const fetchNotifications = useCallback(async (resetPage = true) => {
        if (!userId) return;
        try {
            setLoading(true);
            const targetPage = resetPage ? 1 : page;
            const res = await getNotifications(targetPage);
            if (!mountedRef.current) return;

            if (res.success) {
                const { notifications: items, unread_count, pagination } = res.data;
                if (resetPage) {
                    setNotifications(items);
                    setPage(1);
                } else {
                    // Append for "load more" pagination
                    setNotifications(prev => [...prev, ...items]);
                }
                setUnreadCount(unread_count);
                setHasMore(pagination.current_page < pagination.last_page);
            }
        } catch (err) {
            // Silently fail — notifications are non-critical
            console.warn('[useNotifications] Failed to fetch notifications:', err.message);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, [userId, page]);

    // Initial load
    useEffect(() => {
        mountedRef.current = true;
        fetchNotifications(true);
        return () => { mountedRef.current = false; };
    }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Load More (Pagination) ─────────────────────────────────────────────
    const loadMore = useCallback(() => {
        if (hasMore && !loading) {
            setPage(prev => prev + 1);
        }
    }, [hasMore, loading]);

    useEffect(() => {
        if (page > 1) fetchNotifications(false);
    }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Laravel Echo Real-time Listener ───────────────────────────────────
    useEffect(() => {
        if (!userId) return;

        // Attempt to connect to Reverb via Laravel Echo
        // Echo is initialized globally in main.jsx (if reverb is available)
        // If window.Echo doesn't exist, we skip silently → REST-only mode
        const Echo = window.Echo;
        if (!Echo) {
            console.info('[useNotifications] Laravel Echo not available — REST-only mode');
            return;
        }

        try {
            // Subscribe to the private channel for this user
            const channel = Echo.private(`notifications.${userId}`);
            channelRef.current = channel;

            // Listen for the NewNotification broadcast event
            // broadcastAs() in the Event returns 'NewNotification'
            channel.listen('.NewNotification', (payload) => {
                if (!mountedRef.current) return;

                // Add the real-time notification to the TOP of the list
                setNotifications(prev => [payload, ...prev]);

                // Increment unread badge
                setUnreadCount(prev => prev + 1);
            });

            // Handle connection errors gracefully
            channel.error((error) => {
                console.warn('[useNotifications] Echo channel error:', error);
            });

        } catch (err) {
            console.warn('[useNotifications] Echo subscription failed:', err.message);
        }

        // Cleanup: unsubscribe when component unmounts or userId changes
        return () => {
            try {
                if (channelRef.current && window.Echo) {
                    window.Echo.leave(`notifications.${userId}`);
                    channelRef.current = null;
                }
            } catch (_) {}
        };
    }, [userId]);

    // ── Actions ───────────────────────────────────────────────────────────

    /**
     * Mark a single notification as read (optimistic update + API call).
     */
    const markAsRead = useCallback(async (id) => {
        // Optimistic UI update — immediately show as read
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await markNotificationRead(id);
        } catch (err) {
            console.warn('[useNotifications] markAsRead failed:', err.message);
            // Revert on failure
            fetchNotifications(true);
        }
    }, [fetchNotifications]);

    /**
     * Mark ALL notifications as read.
     */
    const markAllRead = useCallback(async () => {
        // Optimistic update
        const now = new Date().toISOString();
        setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? now })));
        setUnreadCount(0);

        try {
            await markAllNotificationsRead();
        } catch (err) {
            console.warn('[useNotifications] markAllRead failed:', err.message);
            fetchNotifications(true);
        }
    }, [fetchNotifications]);

    /**
     * Remove a notification from the list and delete it from the server.
     */
    const removeNotification = useCallback(async (id) => {
        // Find the notification before removing (to revert if needed)
        const target = notifications.find(n => n.id === id);

        // Optimistic removal
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (target && !target.read_at) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        try {
            await deleteNotificationById(id);
        } catch (err) {
            console.warn('[useNotifications] deleteNotification failed:', err.message);
            // Re-insert on failure
            if (target) {
                setNotifications(prev => [target, ...prev].sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                ));
            }
        }
    }, [notifications]);

    /**
     * Manually inject a real-time notification (used by NotificationToast parent).
     */
    const addRealtime = useCallback((notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
    }, []);

    return {
        notifications,
        unreadCount,
        loading,
        page,
        hasMore,
        markAsRead,
        markAllRead,
        removeNotification,
        loadMore,
        addRealtime,
    };
}
