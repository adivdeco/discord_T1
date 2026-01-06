# AI Chatting & Notifications Integration Guide

## Overview

This AI-powered notification system analyzes user behavior patterns and uses Google Gemini LLM to generate personalized, contextual notifications that feel natural and non-intrusive.

## Architecture

```
Discord Events
    ↓
Activity Logger (ActivityLog Model)
    ↓
Behavioral Signal Converter (SignalConverter)
    ↓
Context Builder (ContextBuilder)
    ↓
Gemini LLM Engine (GeminiLLMEngine)
    ↓
Notification Policy (NotificationPolicy)
    ↓
Scheduler → Send Notification
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @google/generative-ai node-cron
```

### 2. Configure Environment Variables

Add to your `.env` file:

```env
GEMINI_API_KEY=AIzaSyDRCpBltcHlCX0oFvdfsw1xFkoLD7Ce7hQ
```

### 3. Integrate into Backend

In your `backend/index.js`:

```javascript
const NotificationScheduler = require('./services/NotificationScheduler');
const notificationRoutes = require('./routes/notificationRoutes');

// Initialize notification scheduler
const notificationScheduler = new NotificationScheduler();
notificationScheduler.initialize();

// Add notification routes
app.use('/api/notifications', notificationRoutes);
```

## Core Components

### 1. Activity Logging

Log user activities as they happen in Discord:

```javascript
// When user sends a message
await axios.post('/api/notifications/log-activity', {
  userId: 'user_id',
  serverId: 'server_id',
  eventType: 'message_sent',
  metadata: { channelId: 'channel_id', messageId: 'msg_id' }
});

// When user joins voice
await axios.post('/api/notifications/log-activity', {
  userId: 'user_id',
  serverId: 'server_id',
  eventType: 'voice_joined',
  metadata: { duration: 3600 } // 1 hour in seconds
});
```

#### Event Types Supported:
- `message_sent`
- `user_joined`
- `user_left`
- `reaction_added`
- `voice_joined`
- `voice_left`
- `command_used`
- `role_changed`
- `inactivity_detected`

### 2. Signal Converter

Automatically converts raw events into behavioral signals:

```javascript
const SignalConverter = require('./services/SignalConverter');

const signals = SignalConverter.buildSignals(userData, activityLogs);
// Returns:
// {
//   inactivityLevel: 'high' | 'medium' | 'low',
//   engagementTrend: 'increasing' | 'stable' | 'dropping',
//   userMood: 'frustrated' | 'neutral' | 'positive',
//   topicInterests: ['channel_id_1', 'channel_id_2'],
//   socialState: 'isolated' | 'active' | 'social'
// }
```

### 3. Context Builder

Creates structured context for LLM decision making:

```javascript
const ContextBuilder = require('./services/ContextBuilder');

const context = await ContextBuilder.buildContextWindow(userId, serverId);
// Returns comprehensive user profile, recent behavior, and server context
```

### 4. Gemini LLM Engine

Makes intelligent notification decisions:

```javascript
const GeminiLLMEngine = require('./services/GeminiLLMEngine');

const llmEngine = new GeminiLLMEngine();
const result = await llmEngine.makeNotificationDecision(userId, serverId);

// Result includes:
// {
//   decision: {
//     shouldNotify: boolean,
//     priority: 'low' | 'medium' | 'high',
//     tone: 'friendly' | 'hype' | 'calm' | 'encouraging',
//     message: 'Personalized message',
//     reason: 'Why this decision was made'
//   }
// }
```

### 5. Notification Policy Engine

Enforces spam prevention and user preferences:

```javascript
const NotificationPolicy = require('./services/NotificationPolicy');

// Check if notification can be sent
const policyCheck = await NotificationPolicy.canNotify(userId, serverId);

// Update user preferences
await NotificationPolicy.updatePreferences(userId, serverId, {
  enabled: true,
  quietHours: { start: 22, end: 8 },
  maxPerDay: 3,
  cooldownMinutes: 720 // 12 hours
});
```

### 6. Notification Scheduler

Runs automatically every 12 hours:

```javascript
const NotificationScheduler = require('./services/NotificationScheduler');

const scheduler = new NotificationScheduler();
scheduler.initialize(); // Runs at 00:00 and 12:00

// Manual trigger (for testing)
await scheduler.triggerManually();
```

## API Endpoints

### Activity Logging

```
POST /api/notifications/log-activity
Body: { userId, serverId, eventType, metadata }
```

### Get Activity History

```
GET /api/notifications/activity/:userId?days=7&limit=50
```

### Notification Preferences

```
GET /api/notifications/preferences/:userId/:serverId
PUT /api/notifications/preferences/:userId/:serverId
Body: { enabled, quietHours, maxPerDay, cooldownMinutes }
```

### Test Notification Decision

```
POST /api/notifications/test-decision
Body: { userId, serverId }
```

### Record Ignore

```
POST /api/notifications/ignore
Body: { userId, serverId }
```

### Get Notification Stats

```
GET /api/notifications/stats/:userId/:serverId
```

## Example Integration Flow

### 1. On Message Send (Frontend)

```javascript
// When user sends message
const response = await fetch('/api/messages', {
  method: 'POST',
  body: JSON.stringify({ content, channelId })
});

// Log activity for notifications
await fetch('/api/notifications/log-activity', {
  method: 'POST',
  body: JSON.stringify({
    userId: currentUser._id,
    serverId: currentServer._id,
    eventType: 'message_sent',
    metadata: { channelId }
  })
});
```

### 2. On Voice Join

```javascript
socket.on('user:voice:join', (data) => {
  // Log activity
  fetch('/api/notifications/log-activity', {
    method: 'POST',
    body: JSON.stringify({
      userId: data.userId,
      serverId: data.serverId,
      eventType: 'voice_joined'
    })
  });
});
```

### 3. Every 12 Hours (Automatic)

The scheduler automatically:
1. Analyzes all users' activity patterns
2. Builds context windows
3. Calls Gemini LLM for decisions
4. Applies notification policies
5. Sends notifications to users

## Notification Decision Example

**User Profile:**
- New member (2 weeks)
- Inactive for 48 hours
- Was previously active
- Prefers gaming discussions

**LLM Decision:**
```json
{
  "shouldNotify": true,
  "priority": "medium",
  "tone": "friendly",
  "message": "Haven't seen you around lately — we're running a game tournament this weekend! 🎮",
  "reason": "User inactive >24h, previously engaged, matches server gaming focus"
}
```

## Customization

### Modify LLM Prompt

Edit `GeminiLLMEngine.getSystemPrompt()` to change decision logic.

### Adjust Notification Policy

Edit `NotificationPolicy` to modify:
- Quiet hours (default 10pm-8am)
- Max notifications per day (default 3)
- Cooldown period (default 12 hours)
- Ignore cooldown (6 hours)

### Change Scheduler Timing

Edit `NotificationScheduler` cron expression:
```javascript
// Current: Every 12 hours (0:00 and 12:00)
cron.schedule('0 0,12 * * *', ...)

// Every 6 hours:
cron.schedule('0 0,6,12,18 * * *', ...)

// Every hour:
cron.schedule('0 * * * *', ...)
```

## Troubleshooting

### Gemini API Errors

- Check `GEMINI_API_KEY` in `.env`
- Ensure API key has permission for `generativeai.googleapis.com`

### Notifications Not Sending

1. Check if scheduler is running: `GET /api/health/scheduler`
2. Verify activity logs are being recorded
3. Test manually: `POST /api/notifications/test-decision`

### Performance Issues

- Monitor activity log collection size
- Implement data archival for logs older than 30 days
- Consider indexing on `userId` and `timestamp`

## Next Steps

1. Integrate activity logging into all Discord events
2. Implement notification delivery (email, push, in-app)
3. Add analytics dashboard to monitor notification effectiveness
4. Tune LLM prompts based on user feedback
5. Add A/B testing for different notification tones/messages

## Files Created

- `models/ActivityLog.js` - Activity logging model
- `models/NotificationCache.js` - Notification preferences cache
- `services/SignalConverter.js` - Event to signal conversion
- `services/ContextBuilder.js` - Context window builder
- `services/GeminiLLMEngine.js` - LLM integration
- `services/NotificationPolicy.js` - Policy enforcement
- `services/NotificationScheduler.js` - Scheduled task runner
- `controllers/notificationController.js` - API controllers
- `routes/notificationRoutes.js` - API routes
- `NOTIFICATION_SETUP.md` - This file
