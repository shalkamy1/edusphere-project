import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNotifications } from '../hooks/useNotifications.js';

/**
 * Icon + color configuration for each notification type.
 * Used in the dropdown list AND the toast popup.
 */
const NOTIF_CONFIG = {
    course_enrolled:  { icon: '🎓', label: 'Enrollment',    color: '#3b82f6', page: 'adddrop'   },
    grade_published:  { icon: '📊', label: 'Grade',         color: '#10b981', page: 'records'   },
    announcement:     { icon: '📢', label: 'Announcement',  color: '#f59e0b', page: 'dashboard'  },
    chat_message:     { icon: '💬', label: 'AI Assistant',  color: '#8b5cf6', page: 'chatbot'   },
    recommendation:   { icon: '🎯', label: 'Recommendation',color: '#ec4899', page: 'adddrop'   },
    at_risk_alert:    { icon: '⚠️',  label: 'Alert',         color: '#ef4444', page: 'records'   },
};

/**
 * Format a date string relative to now (e.g., "5 min ago", "Yesterday").
 */
function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000; // seconds
    if (diff < 60)        return 'Just now';
    if (diff < 3600)      return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 172800)    return 'Yesterday';
    return new Date(dateStr).toLocaleDateString();
}

/**
 * NotificationBell Component
 *
 * Renders a bell button in the topbar with:
 *  - Animated badge showing unread count
 *  - Dropdown panel with notification list
 *  - Mark as read on click, mark all read button
 *  - Delete button per notification
 *  - Load more pagination
 *
 * @param {Object} props
 * @param {number|null} props.userId      - Authenticated user ID (needed for Echo channel)
 * @param {Function}    props.onNavigate  - navigate(path) function from react-router
 * @param {Function}    props.onNewNotif  - Callback when real-time notification arrives (for toast)
 */
export default function NotificationBell({ userId, onNavigate, onNewNotif }) {
    const [open, setOpen] = useState(false);
    const dropdownRef     = useRef(null);

    const {
        notifications,
        unreadCount,
        loading,
        hasMore,
        markAsRead,
        markAllRead,
        removeNotification,
        loadMore,
        addRealtime,
    } = useNotifications(userId);

    // ── Real-time: pass new notifications to parent for toast as well ──────
    // We wrap the addRealtime so the parent (App.jsx) can show a toast
    const handleRealtime = useCallback((notif) => {
        addRealtime(notif);
        onNewNotif?.(notif);
    }, [addRealtime, onNewNotif]);

    // Override Echo listener to also trigger toast (re-subscribes via hook's addRealtime)
    // The useNotifications hook handles Echo internally; onNewNotif is passed via context.

    // ── Close dropdown when clicking outside ──────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Handle notification click: mark read + navigate ───────────────────
    const handleClick = (notif) => {
        if (!notif.read_at) markAsRead(notif.id);
        const cfg = NOTIF_CONFIG[notif.type] || {};
        if (cfg.page && onNavigate) {
            onNavigate('/' + cfg.page);
        }
        setOpen(false);
    };

    // ── Play sound when unread count increases ─────────────────────────────
    const prevUnread = useRef(0);
    useEffect(() => {
        if (unreadCount > prevUnread.current) {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.connect(g); g.connect(ctx.destination);
                o.frequency.value = 880; o.type = 'sine';
                g.gain.setValueAtTime(0.25, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                o.start(); o.stop(ctx.currentTime + 0.35);
            } catch (_) {}
        }
        prevUnread.current = unreadCount;
    }, [unreadCount]);

    return (
        <div className="notif-bell-wrap" ref={dropdownRef}>
            {/* ── Bell Button ─────────────────────────────────────────────── */}
            <button
                id="notification-bell-btn"
                className={`tb-icon-btn tb-bell${open ? ' tb-bell-active' : ''}`}
                onClick={() => setOpen(v => !v)}
                title="Notifications"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
                {/* Bell SVG */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="1.75"
                     strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>

                {/* Unread badge */}
                {unreadCount > 0 && (
                    <span className="notif-badge-count" aria-hidden="true">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* ── Dropdown Panel ──────────────────────────────────────────── */}
            {open && (
                <div className="notif-dropdown" role="dialog" aria-label="Notifications panel">
                    {/* Header */}
                    <div className="notif-dropdown-header">
                        <div className="notif-dropdown-title">
                            <span>🔔</span>
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                                <span className="notif-unread-chip">{unreadCount}</span>
                            )}
                        </div>
                        <div className="notif-dropdown-actions">
                            {unreadCount > 0 && (
                                <button
                                    id="notif-mark-all-btn"
                                    className="notif-action-btn"
                                    onClick={(e) => { e.stopPropagation(); markAllRead(); }}
                                    title="Mark all as read"
                                >
                                    ✓ All Read
                                </button>
                            )}
                            <button
                                className="notif-close-btn"
                                onClick={() => setOpen(false)}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="notif-dropdown-body">
                        {loading && notifications.length === 0 ? (
                            <div className="notif-loading">
                                <div className="notif-spinner" />
                                <span>Loading notifications…</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="notif-empty">
                                <div className="notif-empty-icon">🔕</div>
                                <div className="notif-empty-text">You're all caught up!</div>
                                <div className="notif-empty-sub">No notifications yet</div>
                            </div>
                        ) : (
                            <>
                                {notifications.map(notif => {
                                    const cfg     = NOTIF_CONFIG[notif.type] || { icon: '📌', color: '#6b7280' };
                                    const isUnread = !notif.read_at;

                                    return (
                                        <div
                                            key={notif.id}
                                            id={`notif-item-${notif.id}`}
                                            className={`notif-item-row${isUnread ? ' notif-item-unread' : ''}`}
                                            onClick={() => handleClick(notif)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={e => e.key === 'Enter' && handleClick(notif)}
                                        >
                                            {/* Unread dot indicator */}
                                            {isUnread && <span className="notif-unread-dot" aria-label="Unread" />}

                                            {/* Type icon */}
                                            <div
                                                className="notif-type-icon"
                                                style={{ background: cfg.color + '20', color: cfg.color }}
                                            >
                                                {cfg.icon}
                                            </div>

                                            {/* Content */}
                                            <div className="notif-content">
                                                <div className="notif-item-title">{notif.title}</div>
                                                <div className="notif-item-body">{notif.body}</div>
                                                <div className="notif-item-time">
                                                    <span
                                                        className="notif-type-chip"
                                                        style={{ background: cfg.color + '15', color: cfg.color }}
                                                    >
                                                        {cfg.label}
                                                    </span>
                                                    <span>{timeAgo(notif.created_at)}</span>
                                                </div>
                                            </div>

                                            {/* Delete button */}
                                            <button
                                                className="notif-delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeNotification(notif.id);
                                                }}
                                                title="Delete notification"
                                                aria-label="Delete notification"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    );
                                })}

                                {/* Load more */}
                                {hasMore && (
                                    <button
                                        id="notif-load-more-btn"
                                        className="notif-load-more"
                                        onClick={(e) => { e.stopPropagation(); loadMore(); }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Loading…' : 'Load more notifications'}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
