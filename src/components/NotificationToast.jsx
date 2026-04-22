import React, { useState, useEffect, useRef } from 'react';

/**
 * Notification type → icon + accent color (matches NotificationBell config)
 */
const NOTIF_CONFIG = {
    course_enrolled:  { icon: '🎓', color: '#3b82f6' },
    grade_published:  { icon: '📊', color: '#10b981' },
    announcement:     { icon: '📢', color: '#f59e0b' },
    chat_message:     { icon: '💬', color: '#8b5cf6' },
    recommendation:   { icon: '🎯', color: '#ec4899' },
    at_risk_alert:    { icon: '⚠️', color: '#ef4444' },
};

/**
 * SingleToast — one animated toast notification popup.
 *
 * Auto-dismisses after `duration` ms.
 * Has a progress bar that shrinks to zero over the duration.
 */
function SingleToast({ notif, onDismiss, onNavigate }) {
    const [visible, setVisible]       = useState(false); // controls slide-in
    const [dismissing, setDismissing]  = useState(false); // controls slide-out
    const timerRef = useRef(null);

    const cfg = NOTIF_CONFIG[notif.type] || { icon: '🔔', color: '#6b7280' };
    const DURATION = 5000; // 5 seconds

    // Mount → trigger slide-in animation
    useEffect(() => {
        const raf = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    // Auto-dismiss after DURATION
    useEffect(() => {
        timerRef.current = setTimeout(() => dismiss(), DURATION);
        return () => clearTimeout(timerRef.current);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const dismiss = () => {
        setDismissing(true);
        setTimeout(() => onDismiss(notif.id), 350); // wait for slide-out anim
    };

    const handleClick = () => {
        dismiss();
        const page = {
            course_enrolled: 'adddrop',
            grade_published: 'records',
            announcement:    'dashboard',
            chat_message:    'chatbot',
            recommendation:  'adddrop',
            at_risk_alert:   'records',
        }[notif.type] || 'dashboard';
        onNavigate?.('/' + page);
    };

    return (
        <div
            id={`toast-${notif.id}`}
            className={`notif-toast${visible ? ' notif-toast-in' : ''}${dismissing ? ' notif-toast-out' : ''}`}
            onClick={handleClick}
            role="alert"
            aria-live="polite"
        >
            {/* Progress bar */}
            <div
                className="toast-progress"
                style={{
                    background: cfg.color,
                    animationDuration: `${DURATION}ms`,
                }}
            />

            {/* Content */}
            <div className="toast-inner">
                {/* Icon */}
                <div
                    className="toast-icon"
                    style={{ background: cfg.color + '20', color: cfg.color }}
                >
                    {cfg.icon}
                </div>

                {/* Text */}
                <div className="toast-text">
                    <div className="toast-title">{notif.title}</div>
                    <div className="toast-body">{notif.body}</div>
                </div>

                {/* Dismiss × */}
                <button
                    className="toast-close"
                    onClick={(e) => { e.stopPropagation(); dismiss(); }}
                    aria-label="Dismiss notification"
                >
                    ×
                </button>
            </div>
        </div>
    );
}

/**
 * NotificationToast Container
 *
 * Renders a stack of toast notifications in the bottom-right corner.
 * New toasts slide in; dismissed ones slide out.
 *
 * Usage in App.jsx:
 *   <NotificationToast toasts={realtimeToasts} onDismiss={dismissToast} onNavigate={navigate} />
 *
 * @param {Object}   props
 * @param {Object[]} props.toasts      - Array of notification objects to show
 * @param {Function} props.onDismiss   - Called with the notification id to remove it
 * @param {Function} props.onNavigate  - navigate(path) function
 */
export default function NotificationToast({ toasts = [], onDismiss, onNavigate }) {
    if (toasts.length === 0) return null;

    return (
        <div className="notif-toast-container" aria-label="Notification toasts">
            {toasts.map(notif => (
                <SingleToast
                    key={notif.id}
                    notif={notif}
                    onDismiss={onDismiss}
                    onNavigate={onNavigate}
                />
            ))}
        </div>
    );
}
