/**
 * Notification API Functions for EduSphere
 * Add these exports to src/api.js
 *
 * These functions communicate with NotificationController endpoints.
 * All require a valid Sanctum Bearer token.
 */

// ─── NOTIFICATION API FUNCTIONS ──────────────────────────────────────────────

/**
 * Get paginated notifications for the authenticated user.
 * GET /api/v1/notifications?page={page}&unread={unreadOnly}
 *
 * @param {number} page - Page number (default: 1)
 * @param {boolean} unreadOnly - If true, only fetch unread notifications
 * @returns {{ notifications, unread_count, pagination }}
 */
export async function getNotifications(page = 1, unreadOnly = false) {
    const params = new URLSearchParams({ page });
    if (unreadOnly) params.append('unread', 'true');
    const response = await apiFetch(`/v1/notifications?${params}`);
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Get only the unread notification count (for bell badge).
 * GET /api/v1/notifications/unread-count
 *
 * @returns {{ count: number }}
 */
export async function getUnreadCount() {
    const response = await apiFetch('/v1/notifications/unread-count');
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Mark a single notification as read.
 * POST /api/v1/notifications/{id}/read
 *
 * @param {number} id - Notification ID
 */
export async function markNotificationRead(id) {
    const response = await apiFetch(`/v1/notifications/${id}/read`, { method: 'POST' });
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Mark all notifications as read.
 * POST /api/v1/notifications/read-all
 */
export async function markAllNotificationsRead() {
    const response = await apiFetch('/v1/notifications/read-all', { method: 'POST' });
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Delete a notification permanently.
 * DELETE /api/v1/notifications/{id}
 *
 * @param {number} id - Notification ID
 */
export async function deleteNotification(id) {
    const response = await apiFetch(`/v1/notifications/${id}`, { method: 'DELETE' });
    if (!response.ok) throw await parseError(response);
    return await response.json();
}
