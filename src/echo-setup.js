/**
 * Laravel Echo Setup for EduSphere
 *
 * This file initializes Laravel Echo with Laravel Reverb (WebSocket) support.
 * Import this ONCE in your main.jsx before the React app renders.
 *
 * Usage:
 *   import './echo-setup.js'; // at the top of main.jsx
 *
 * If Reverb is not running, Echo gracefully fails and the app continues in
 * REST-only mode (notifications load from DB but no real-time updates).
 *
 * Flutter compat note:
 *   Reverb uses the Pusher protocol. Flutter's pusher_channels_flutter
 *   connects with the same REVERB_APP_KEY on ws://localhost:8080.
 */

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally (Laravel Echo requires this)
window.Pusher = Pusher;

// Get config from Vite env (reads from backend .env via Vite)
const REVERB_APP_KEY = import.meta.env.VITE_REVERB_APP_KEY ?? 'edusphere-key-2026';
const REVERB_HOST    = import.meta.env.VITE_REVERB_HOST    ?? 'localhost';
const REVERB_PORT    = import.meta.env.VITE_REVERB_PORT    ?? '8080';
const REVERB_SCHEME  = import.meta.env.VITE_REVERB_SCHEME  ?? 'http';

try {
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key:         REVERB_APP_KEY,
        wsHost:      REVERB_HOST,
        wsPort:      parseInt(REVERB_PORT),
        wssPort:     443,                    // for production HTTPS
        forceTLS:    REVERB_SCHEME === 'https',
        enabledTransports: ['ws', 'wss'],    // prefer WebSocket over polling

        /**
         * Auth endpoint for private channels.
         *
         * Laravel Sanctum sends the Bearer token in the Authorization header.
         * The backend's /api/broadcasting/auth route uses this to verify channel access.
         */
        authEndpoint: 'http://localhost:8000/api/broadcasting/auth',
        auth: {
            headers: {
                // Get the Sanctum token from localStorage
                Authorization: `Bearer ${localStorage.getItem('edusphere_token') ?? ''}`,
                Accept: 'application/json',
            },
        },
    });

    console.info('[Echo] Connected to Reverb WebSocket server');
} catch (err) {
    console.warn('[Echo] Reverb not available — real-time notifications disabled', err.message);
    // window.Echo remains undefined → useNotifications hook falls back to REST-only mode
}
