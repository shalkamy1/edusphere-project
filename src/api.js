/**
 * EduSphere API Service
 * Connects frontend to Laravel backend (Sanctum token-based auth)
 */

const API_BASE = 'http://localhost:8000/api';

/**
 * Get the stored auth token from localStorage
 */
export function getToken() {
    return localStorage.getItem('edusphere_token');
}

/**
 * Save token and user data to localStorage
 */
export function saveAuth(token, user) {
    localStorage.setItem('edusphere_token', token);
    localStorage.setItem('edusphere_user', JSON.stringify(user));
}

/**
 * Clear stored auth data
 */
export function clearAuth() {
    localStorage.removeItem('edusphere_token');
    localStorage.removeItem('edusphere_user');
}

/**
 * Get stored user data from localStorage
 */
export function getStoredUser() {
    try {
        const data = localStorage.getItem('edusphere_user');
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

/**
 * Make an authenticated API request
 */
async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    // If 401, token is expired/invalid - clear auth
    if (response.status === 401) {
        clearAuth();
        throw new ApiError('Session expired. Please log in again.', 401);
    }

    return response;
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
    constructor(message, status, errors = {}) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
}

/**
 * Parse error response from Laravel
 */
async function parseError(response) {
    try {
        const data = await response.json();
        // Laravel validation errors come as { message, errors: { field: [messages] } }
        if (data.errors) {
            const firstError = Object.values(data.errors).flat()[0];
            return new ApiError(firstError || data.message || 'An error occurred', response.status, data.errors);
        }
        return new ApiError(data.message || 'An error occurred', response.status);
    } catch {
        return new ApiError('An unexpected error occurred', response.status);
    }
}

// ─── AUTH API FUNCTIONS ──────────────────────────────────────────

/**
 * Login with email and password
 * POST /api/login
 * Returns: { access_token, token_type, user }
 */
export async function login(email, password) {
    const response = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw await parseError(response);
    }

    const data = await response.json();

    // Store token and user data
    saveAuth(data.access_token, data.user);

    return data;
}

/**
 * Logout the current user
 * POST /api/logout
 */
export async function logout() {
    try {
        await apiFetch('/logout', { method: 'POST' });
    } catch (err) {
        // Even if API call fails, clear local auth
        console.warn('Logout API call failed:', err);
    }
    clearAuth();
}

/**
 * Get the current authenticated user
 * GET /api/v1/user
 */
export async function getCurrentUser() {
    const response = await apiFetch('/v1/user');

    if (!response.ok) {
        throw await parseError(response);
    }

    return await response.json();
}

/**
 * Request a password reset link
 * POST /api/forgot-password
 */
export async function forgotPassword(email) {
    const response = await apiFetch('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        throw await parseError(response);
    }

    return await response.json();
}

/**
 * Reset password with token
 * POST /api/reset-password
 */
export async function resetPassword(email, password, passwordConfirmation, token) {
    const response = await apiFetch('/reset-password', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password,
            password_confirmation: passwordConfirmation,
            token,
        }),
    });

    if (!response.ok) {
        throw await parseError(response);
    }

    return await response.json();
}

/**
 * Get Student CGPA
 * GET /api/v1/students/{id}/cgpa
 */
export async function getStudentCGPA(studentId) {
    if (!studentId) throw new Error("Student ID is required");
    const response = await apiFetch(`/v1/students/${studentId}/cgpa`);
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Get Student Transcript
 * GET /api/v1/students/{id}/transcript
 */
export async function getStudentTranscript(studentId) {
    if (!studentId) throw new Error("Student ID is required");
    const response = await apiFetch(`/v1/students/${studentId}/transcript`);
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Get Student Weekly Timetable/Schedule
 * GET /api/v1/student/schedule
 */
export async function getStudentSchedule() {
    const response = await apiFetch(`/v1/student/schedule`);
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Get Student Today's Classes
 * GET /api/v1/student/schedule/today
 */
export async function getStudentTodayClasses() {
    const response = await apiFetch(`/v1/student/schedule/today`);
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Get Student Service Requests
 * GET /api/v1/student/requests
 */
export async function getStudentRequests(type = null) {
    const url = type ? `/v1/student/requests?request_type=${type}` : `/v1/student/requests`;
    const response = await apiFetch(url);
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Create a new Student Request
 * POST /api/v1/student/requests
 */
export async function createStudentRequest(type, details) {
    const response = await apiFetch(`/v1/student/requests`, {
        method: 'POST',
        body: JSON.stringify({ request_type: type, details }),
    });
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Get Student Academic and Attendance Warnings
 * GET /api/v1/student/warnings
 */
export async function getStudentWarnings() {
    const response = await apiFetch(`/v1/student/warnings`);
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Get all raw student course enrollments
 * GET /api/v1/student-courses?student_id={studentId}&per_page=all
 */
export async function getStudentCourses(studentId) {
    if (!studentId) throw new Error("Student ID is required");
    const response = await apiFetch(`/v1/student-courses?student_id=${studentId}&per_page=all`);
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Get Student Curriculum dynamically computed
 * GET /api/v1/students/{studentId}/curriculum
 */
export async function getStudentCurriculum(studentId) {
    if (!studentId) throw new Error("Student ID is required");
    const response = await apiFetch(`/v1/students/${studentId}/curriculum`);
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Get available courses for student registration
 * GET /api/v1/student/registration/courses
 */
export async function getAvailableCourses() {
    const response = await apiFetch(`/v1/student/registration/courses`);
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Register for a course section
 * POST /api/v1/student/registration/register
 */
export async function registerCourse(teacherCourseId) {
    const response = await apiFetch(`/v1/student/registration/register`, {
        method: 'POST',
        body: JSON.stringify({ teacher_course_id: teacherCourseId }),
    });
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Drop a course section (delete StudentCourse record)
 * DELETE /api/v1/student-courses/{id}
 */
export async function dropCourse(studentCourseId) {
    const response = await apiFetch(`/v1/student-courses/${studentCourseId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Get AI-powered academic advising for a student
 * POST /api/v1/advisor/recommend/{studentId}
 */
export async function adviseStudent(studentId, message) {
    if (!studentId) throw new Error("Student ID is required");
    const response = await apiFetch(`/v1/advisor/recommend/${studentId}`, {
        method: 'POST',
        body: JSON.stringify({ message }),
    });
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Record attendance via QR Token
 * POST /api/v1/attendance/scan
 */
export async function scanAttendanceQR(token) {
    const response = await apiFetch(`/v1/attendance/scan`, {
        method: 'POST',
        body: JSON.stringify({ token }),
    });
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

// ─── PROFILE API FUNCTIONS ───────────────────────────────────────────

/**
 * Get the authenticated user's full profile (includes student data)
 * GET /api/v1/profile
 */
export async function getProfile() {
    const response = await apiFetch('/v1/profile');
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Update the authenticated user's display name
 * PATCH /api/v1/profile
 */
export async function updateProfile(name) {
    const response = await apiFetch('/v1/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name }),
    });
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Change the current user's password
 * POST /api/v1/profile/change-password
 */
export async function changePassword(currentPassword, newPassword, newPasswordConfirmation) {
    const response = await apiFetch('/v1/profile/change-password', {
        method: 'POST',
        body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
            new_password_confirmation: newPasswordConfirmation,
        }),
    });
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Upload a profile picture for the authenticated user
 * POST /api/v1/profile/picture
 */
export async function uploadProfilePicture(file) {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE}/v1/profile/picture`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
    });
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

// ─── NOTIFICATION API FUNCTIONS ──────────────────────────────────────────────

/**
 * Get paginated notifications for the authenticated user.
 * GET /api/v1/notifications?page={page}&unread={unreadOnly}
 *
 * @param {number}  page       - Page number (default: 1)
 * @param {boolean} unreadOnly - If true, only fetch unread notifications
 * @returns {{ success, data: { notifications, unread_count, pagination } }}
 */
export async function getNotifications(page = 1, unreadOnly = false) {
    const params = new URLSearchParams({ page });
    if (unreadOnly) params.append('unread', 'true');
    const response = await apiFetch(`/v1/notifications?${params}`);
    if (!response.ok) throw await parseError(response);
    return await response.json();
}

/**
 * Get only the unread count for the bell badge.
 * GET /api/v1/notifications/unread-count
 *
 * @returns {{ success, data: { count: number } }}
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
 * Delete a single notification permanently.
 * DELETE /api/v1/notifications/{id}
 *
 * @param {number} id - Notification ID
 */
export async function deleteNotificationById(id) {
    const response = await apiFetch(`/v1/notifications/${id}`, { method: 'DELETE' });
    if (!response.ok) throw await parseError(response);
    return await response.json();
}
