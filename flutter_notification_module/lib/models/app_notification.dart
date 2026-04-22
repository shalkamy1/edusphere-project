/// AppNotification Model
///
/// Mirrors the unified JSON payload sent by the backend:
/// {
///   "id":         1,
///   "type":       "grade_published",
///   "title":      "Grade Published",
///   "body":       "Your MATH301 grade is now available.",
///   "data":       { "course_id": 5, "grade": 95 },
///   "read_at":    null,
///   "created_at": "2026-04-20T02:38:00+00:00"
/// }

class AppNotification {
  final int id;
  final String type;
  final String title;
  final String body;
  final Map<String, dynamic>? data;
  final DateTime? readAt;
  final DateTime createdAt;

  const AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    this.data,
    this.readAt,
    required this.createdAt,
  });

  /// Whether this notification has been read.
  bool get isRead => readAt != null;

  /// Time elapsed since notification was created (e.g., "5 min ago").
  String get timeAgo {
    final diff = DateTime.now().difference(createdAt);
    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays == 1) return 'Yesterday';
    return '${diff.inDays}d ago';
  }

  /// Deserialize from the backend API / Pusher payload JSON.
  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id:        json['id'] as int,
      type:      json['type'] as String,
      title:     json['title'] as String,
      body:      json['body'] as String,
      data:      json['data'] as Map<String, dynamic>?,
      readAt:    json['read_at'] != null
          ? DateTime.tryParse(json['read_at'] as String)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  /// Serialize — useful for local caching.
  Map<String, dynamic> toJson() => {
        'id':         id,
        'type':       type,
        'title':      title,
        'body':       body,
        'data':       data,
        'read_at':    readAt?.toIso8601String(),
        'created_at': createdAt.toIso8601String(),
      };

  /// Create a copy with optional field overrides.
  AppNotification copyWith({DateTime? readAt}) {
    return AppNotification(
      id:        id,
      type:      type,
      title:     title,
      body:      body,
      data:      data,
      readAt:    readAt ?? this.readAt,
      createdAt: createdAt,
    );
  }

  // ── Notification Type Constants ─────────────────────────────────────
  static const String typeCourseEnrolled = 'course_enrolled';
  static const String typeGradePublished = 'grade_published';
  static const String typeAnnouncement   = 'announcement';
  static const String typeChatMessage    = 'chat_message';
  static const String typeRecommendation = 'recommendation';
  static const String typeAtRiskAlert    = 'at_risk_alert';

  /// Returns the emoji icon for this notification type.
  String get icon {
    switch (type) {
      case typeCourseEnrolled: return '🎓';
      case typeGradePublished: return '📊';
      case typeAnnouncement:   return '📢';
      case typeChatMessage:    return '💬';
      case typeRecommendation: return '🎯';
      case typeAtRiskAlert:    return '⚠️';
      default:                 return '🔔';
    }
  }

  @override
  String toString() => 'AppNotification(id: $id, type: $type, title: "$title")';

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is AppNotification && id == other.id;

  @override
  int get hashCode => id.hashCode;
}
