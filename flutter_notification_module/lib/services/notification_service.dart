import 'dart:async';
import 'dart:convert';
import 'package:pusher_channels_flutter/pusher_channels_flutter.dart';
import 'app_notification.dart';

/// NotificationService — Singleton for EduSphere Flutter app
///
/// Manages the Pusher/Reverb WebSocket connection for real-time notifications.
///
/// Usage:
///   final service = NotificationService.instance;
///   await service.init(userId: '42', token: 'sanctum-token-here');
///   service.stream.listen((notification) {
///     // Handle real-time notification
///   });
///   // When done:
///   service.dispose();
///
/// Reverb Configuration (from backend .env):
///   REVERB_APP_KEY=edusphere-key-2026
///   REVERB_HOST=localhost
///   REVERB_PORT=8080
///
class NotificationService {
  // ── Singleton ─────────────────────────────────────────────────────
  static final NotificationService instance = NotificationService._();
  NotificationService._();

  // ── Internal State ────────────────────────────────────────────────
  final PusherChannelsFlutter _pusher = PusherChannelsFlutter.getInstance();
  final StreamController<AppNotification> _controller =
      StreamController<AppNotification>.broadcast();

  bool _initialized = false;
  String? _currentUserId;

  // ── Public API ────────────────────────────────────────────────────

  /// Real-time notification stream.
  /// Listen to this stream to receive notifications as they arrive.
  Stream<AppNotification> get stream => _controller.stream;

  /// Whether the service is connected to Reverb.
  bool get isConnected => _initialized;

  /// Initialize and connect to Reverb for the given user.
  ///
  /// [userId]  — The authenticated user's ID (used for the private channel)
  /// [token]   — Sanctum Bearer token (for private channel auth)
  /// [host]    — Reverb host (default: localhost for dev, your domain for prod)
  /// [port]    — Reverb port (default: 8080)
  Future<void> init({
    required String userId,
    required String token,
    String host  = 'localhost',
    int    port  = 8080,
    String scheme = 'http',
  }) async {
    if (_initialized && _currentUserId == userId) return; // Already connected

    // Cleanup any previous connection
    if (_initialized) await dispose();

    _currentUserId = userId;

    await _pusher.init(
      apiKey:    'edusphere-key-2026', // Must match REVERB_APP_KEY in .env
      cluster:   'mt1',               // Reverb doesn't use clusters, but required
      host:      host,
      wsPort:    port,
      wssPort:   443,
      useTLS:    scheme == 'https',
      activityTimeout:  120000,
      pongTimeout:      30000,

      // Auth for private channels: hits /broadcasting/auth with the Sanctum token
      authEndpoint:     '$scheme://$host:${scheme == 'https' ? 443 : port}/broadcasting/auth',
      authParams: {
        'headers': {
          'Authorization': 'Bearer $token',
          'Accept':        'application/json',
        },
      },

      onEvent: (event) {
        // Only process our specific event name
        if (event.eventName == 'NewNotification') {
          _handleEvent(event);
        }
      },

      onConnectionStateChange: (current, previous) {
        print('[NotificationService] Pusher state: $previous → $current');
      },

      onError: (message, code, error) {
        print('[NotificationService] Pusher error: $message (code: $code)');
      },
    );

    // Subscribe to the private channel: notifications.{userId}
    // Pusher prefixes private channels with "private-"
    await _pusher.subscribe(
      channelName: 'private-notifications.$userId',
    );

    await _pusher.connect();
    _initialized = true;

    print('[NotificationService] Connected. Listening on private-notifications.$userId');
  }

  /// Clean up the connection.
  /// Call this in the app's dispose() or when the user logs out.
  Future<void> dispose() async {
    if (!_initialized) return;

    try {
      if (_currentUserId != null) {
        await _pusher.unsubscribe(
          channelName: 'private-notifications.$_currentUserId',
        );
      }
      await _pusher.disconnect();
    } catch (_) {}

    _initialized = false;
    _currentUserId = null;
    print('[NotificationService] Disconnected from Reverb');
  }

  // ── Private ───────────────────────────────────────────────────────

  /// Parse and emit a PusherEvent as an AppNotification.
  void _handleEvent(PusherEvent event) {
    try {
      final data = event.data != null
          ? json.decode(event.data!) as Map<String, dynamic>
          : <String, dynamic>{};

      final notification = AppNotification.fromJson(data);
      _controller.add(notification);

      print('[NotificationService] Received: ${notification.title}');
    } catch (e) {
      print('[NotificationService] Failed to parse event: $e');
    }
  }
}
