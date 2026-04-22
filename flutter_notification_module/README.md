# EduSphere Notification Module — Flutter Integration Guide

## Overview

هذا المجلد يحتوي على الكود الكامل لنظام الـ Notifications في Flutter.
الكود جاهز للنسخ مباشرةً في أي Flutter project.

## Files

```
lib/
├── models/
│   └── app_notification.dart      → AppNotification model (fromJson / toJson)
├── services/
│   └── notification_service.dart  → Pusher/Reverb connection (Singleton)
├── providers/
│   └── notification_provider.dart → Riverpod state management
└── widgets/
    └── notification_widgets.dart  → NotificationBell + NotificationSheet + SnackBar
```

## Dependencies (pubspec.yaml)

```yaml
dependencies:
  pusher_channels_flutter: ^2.0.0     # Pusher protocol (Reverb-compatible)
  flutter_riverpod: ^2.4.0            # State management
  http: ^1.1.0                        # REST API calls
```

## Quick Start

### 1. Initialize in your login flow

```dart
// After successful login:
final notifArgs = NotificationArgs(
  userId:  userData.id.toString(),
  token:   userData.sanctumToken,
  baseUrl: 'http://localhost:8000/api/v1',
);
```

### 2. Add bell to AppBar

```dart
AppBar(
  actions: [
    NotificationBell(args: notifArgs),
    // ...
  ],
)
```

### 3. Show SnackBar on real-time notification

```dart
// In your init state:
NotificationService.instance.stream.listen((notif) {
  showNotificationSnackBar(context, notif);
});
```

### 4. Cleanup on logout

```dart
await NotificationService.instance.dispose();
```

## Reverb Connection Details

The Flutter app connects to the same Reverb server as the React frontend:

| Setting    | Value               |
|------------|---------------------|
| Host       | `localhost` (dev)   |
| Port       | `8080`              |
| App Key    | `edusphere-key-2026`|
| Channel    | `private-notifications.{userId}` |
| Event      | `NewNotification`   |

## Auth Flow

The Pusher auth endpoint hits:
```
POST http://localhost:8000/broadcasting/auth
Authorization: Bearer {sanctumToken}
```

The backend responds with the channel auth signature if the user owns the channel.

## Notification Types

| Type               | Icon | Description                      |
|--------------------|------|----------------------------------|
| `course_enrolled`  | 🎓   | Student enrolled in a course     |
| `grade_published`  | 📊   | Grade published                  |
| `announcement`     | 📢   | Admin/Doctor announcement        |
| `chat_message`     | 💬   | AI chatbot reply                 |
| `recommendation`   | 🎯   | AI course recommendation         |
| `at_risk_alert`    | ⚠️   | Student at academic risk (doctor)|

## Sending Test Notifications (Laravel Tinker)

```php
# php artisan tinker

$user = \App\Models\User::find(1);
app(\App\Services\NotificationService::class)->send(
    user:  $user,
    type:  'grade_published',
    title: 'Grade Published 📊',
    body:  'Your MATH301 Midterm grade is available.',
    data:  ['course_id' => 5, 'grade' => 92.5]
);
```
