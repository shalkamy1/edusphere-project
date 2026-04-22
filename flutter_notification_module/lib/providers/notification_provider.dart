import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../models/app_notification.dart';
import '../services/notification_service.dart';

/// ── State Definition ──────────────────────────────────────────────────────

class NotificationState {
  final List<AppNotification> notifications;
  final int unreadCount;
  final bool loading;
  final int currentPage;
  final bool hasMore;

  const NotificationState({
    this.notifications = const [],
    this.unreadCount   = 0,
    this.loading       = true,
    this.currentPage   = 1,
    this.hasMore       = false,
  });

  NotificationState copyWith({
    List<AppNotification>? notifications,
    int?  unreadCount,
    bool? loading,
    int?  currentPage,
    bool? hasMore,
  }) {
    return NotificationState(
      notifications: notifications ?? this.notifications,
      unreadCount:   unreadCount   ?? this.unreadCount,
      loading:       loading       ?? this.loading,
      currentPage:   currentPage   ?? this.currentPage,
      hasMore:       hasMore       ?? this.hasMore,
    );
  }
}

/// ── Notifier ──────────────────────────────────────────────────────────────

class NotificationNotifier extends StateNotifier<NotificationState> {
  NotificationNotifier({
    required this.userId,
    required this.token,
    required this.baseUrl,
  }) : super(const NotificationState()) {
    _init();
  }

  final String userId;
  final String token;
  final String baseUrl; // e.g., 'http://localhost:8000/api/v1'

  // ── Initialization ─────────────────────────────────────────────────

  Future<void> _init() async {
    // 1. Fetch initial notifications from REST API
    await fetchNotifications();

    // 2. Connect to Reverb for real-time updates
    await NotificationService.instance.init(
      userId: userId,
      token:  token,
    );

    // 3. Listen to real-time stream
    NotificationService.instance.stream.listen((notification) {
      _onRealtime(notification);
    });
  }

  // ── REST API ───────────────────────────────────────────────────────

  Map<String, String> get _headers => {
        'Authorization': 'Bearer $token',
        'Accept':        'application/json',
        'Content-Type':  'application/json',
      };

  /// Fetch paginated notifications from the backend.
  Future<void> fetchNotifications({int page = 1}) async {
    state = state.copyWith(loading: true);

    try {
      final uri = Uri.parse('$baseUrl/notifications?page=$page');
      final res = await http.get(uri, headers: _headers);

      if (res.statusCode == 200) {
        final json     = jsonDecode(res.body) as Map<String, dynamic>;
        final data     = json['data']       as Map<String, dynamic>;
        final items    = (data['notifications'] as List)
            .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
            .toList();
        final pag      = data['pagination'] as Map<String, dynamic>;
        final unread   = data['unread_count'] as int;

        state = state.copyWith(
          notifications: page == 1 ? items : [...state.notifications, ...items],
          unreadCount:   unread,
          loading:       false,
          currentPage:   page,
          hasMore:       pag['current_page'] < pag['last_page'],
        );
      }
    } catch (e) {
      print('[NotificationNotifier] fetchNotifications error: $e');
      state = state.copyWith(loading: false);
    }
  }

  /// Load the next page of notifications.
  Future<void> loadMore() async {
    if (state.hasMore && !state.loading) {
      await fetchNotifications(page: state.currentPage + 1);
    }
  }

  /// Mark a single notification as read.
  Future<void> markAsRead(int id) async {
    // Optimistic update
    _updateNotif(id, isRead: true);

    try {
      await http.post(
        Uri.parse('$baseUrl/notifications/$id/read'),
        headers: _headers,
      );
    } catch (_) {
      _updateNotif(id, isRead: false); // Revert
    }
  }

  /// Mark all notifications as read.
  Future<void> markAllRead() async {
    final now = DateTime.now();
    state = state.copyWith(
      notifications: state.notifications
          .map((n) => n.isRead ? n : n.copyWith(readAt: now))
          .toList(),
      unreadCount: 0,
    );

    try {
      await http.post(
        Uri.parse('$baseUrl/notifications/read-all'),
        headers: _headers,
      );
    } catch (_) {
      await fetchNotifications(); // Revert from server
    }
  }

  /// Delete a notification.
  Future<void> deleteNotification(int id) async {
    final removed = state.notifications.firstWhere((n) => n.id == id);
    state = state.copyWith(
      notifications: state.notifications.where((n) => n.id != id).toList(),
      unreadCount:   removed.isRead
          ? state.unreadCount
          : (state.unreadCount - 1).clamp(0, 9999),
    );

    try {
      await http.delete(
        Uri.parse('$baseUrl/notifications/$id'),
        headers: _headers,
      );
    } catch (_) {
      await fetchNotifications(); // Revert from server
    }
  }

  // ── Private Helpers ────────────────────────────────────────────────

  /// Handle a new real-time notification from the WebSocket stream.
  void _onRealtime(AppNotification notification) {
    state = state.copyWith(
      notifications: [notification, ...state.notifications],
      unreadCount:   state.unreadCount + 1,
    );
  }

  void _updateNotif(int id, {required bool isRead}) {
    final now = DateTime.now();
    state = state.copyWith(
      notifications: state.notifications.map((n) {
        if (n.id != id) return n;
        return n.copyWith(readAt: isRead ? now : null);
      }).toList(),
      unreadCount: isRead
          ? (state.unreadCount - 1).clamp(0, 9999)
          : state.unreadCount + 1,
    );
  }

  @override
  void dispose() {
    NotificationService.instance.dispose();
    super.dispose();
  }
}

/// ── Provider ──────────────────────────────────────────────────────────────

/// NotificationProvider factory — create it after login with user credentials.
///
/// Usage in your widget:
///   final provider = notificationProvider(
///     userId:  authState.userId.toString(),
///     token:   authState.token,
///     baseUrl: 'http://localhost:8000/api/v1',
///   );
///   final notifState = ref.watch(provider);
final notificationProvider = StateNotifierProvider.family<
    NotificationNotifier, NotificationState, NotificationArgs>(
  (ref, args) => NotificationNotifier(
    userId:  args.userId,
    token:   args.token,
    baseUrl: args.baseUrl,
  ),
);

/// Arguments for the notification provider family.
class NotificationArgs {
  final String userId;
  final String token;
  final String baseUrl;

  const NotificationArgs({
    required this.userId,
    required this.token,
    required this.baseUrl,
  });

  @override
  bool operator ==(Object other) =>
      other is NotificationArgs && userId == other.userId;

  @override
  int get hashCode => userId.hashCode;
}
