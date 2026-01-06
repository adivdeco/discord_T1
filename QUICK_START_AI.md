# AI Chatting Feature - Quick Start Guide

## What Was Created?

An intelligent, context-aware notification system that:
- Tracks user activity patterns (messages, voice calls, reactions, etc.)
- Analyzes behavior using signal detection (engagement trends, mood, interests)
- Uses Google Gemini LLM to make smart decisions about notifications
- Enforces policies to prevent spam and respect user preferences
- Runs automatically every 12 hours

## Installation

### 1. Install New Dependencies

```bash
cd backend
npm install @google/generative-ai node-cron
```

### 2. Add Gemini API Key to .env

```env
GEMINI_API_KEY=AIzaSyDRCpBltcHlCX0oFvdfsw1xFkoLD7Ce7hQ
```

### 3. Start the Backend

```bash
npx nodemon index.js
```

You should see:
```
🚀 Server running on port 5001
🤖 AI Notification Scheduler initialized
✅ Notification Scheduler initialized (runs every 12 hours)
```

## Files Created

### Models
- **`models/ActivityLog.js`** - Stores all user events (messages, voice, reactions, etc.)
- **`models/NotificationCache.js`** - Caches user preferences and notification history

### Services
- **`services/SignalConverter.js`** - Converts raw events → behavioral signals
- **`services/ContextBuilder.js`** - Builds structured context for LLM
- **`services/GeminiLLMEngine.js`** - Makes decisions using Google Gemini API
- **`services/NotificationPolicy.js`** - Enforces spam rules and user preferences
- **`services/NotificationScheduler.js`** - Runs every 12 hours automatically

### Controllers & Routes
- **`controllers/notificationController.js`** - API handlers
- **`routes/notificationRoutes.js`** - API endpoints

### Documentation
- **`NOTIFICATION_SETUP.md`** - Detailed technical documentation

## How It Works

### 12-Hour Cycle (Automatic)

Every 12 hours at **00:00 and 12:00**, the scheduler:

1. **Gathers Activities** - Fetches all user events from last 7 days
2. **Analyzes Signals** - Detects:
   - `inactivityLevel`: low/medium/high (based on hours since last activity)
   - `engagementTrend`: increasing/stable/dropping (activity over time)
   - `userMood`: frustrated/neutral/positive (engagement patterns)
   - `socialState`: isolated/active/social (voice + group chat activity)
   - `topicInterests`: channels they're most active in

3. **Builds Context** - Creates user profile including:
   - Join date, last active time
   - Message count, voice hours, peak activity times
   - Server info (member count, activity)

4. **LLM Decision** - Sends to Gemini:
   ```
   "Given this user's activity pattern and behavior,
   should we send a notification? If yes, what should we say?"
   ```

5. **LLM Response** (example):
   ```json
   {
     "shouldNotify": true,
     "priority": "medium",
     "tone": "friendly",
     "message": "Haven't seen you around lately — check out the gaming event happening tomorrow! 🎮",
     "reason": "User inactive 48h+, previously engaged, matches gaming interests"
   }
   ```

6. **Policy Check** - Validates:
   - Not in quiet hours (10pm-8am)
   - Last notification > 12 hours ago
   - Not exceeded 3 per day
   - User hasn't repeatedly ignored notifications

7. **Send** - Delivers notification to user

## Testing

### Manual Test (Debug)

```bash
curl -X POST http://localhost:5001/api/notifications/test-decision \
  -H "Content-Type: application/json" \
  -d '{"userId":"<user_id>","serverId":"<server_id>"}'
```

Response includes LLM decision + context + signals.

### Log Activity (For Testing)

```bash
curl -X POST http://localhost:5001/api/notifications/log-activity \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"<user_id>",
    "serverId":"<server_id>",
    "eventType":"message_sent",
    "metadata":{"channelId":"<channel_id>"}
  }'
```

### View User Stats

```bash
curl http://localhost:5001/api/notifications/stats/<user_id>/<server_id>
```

## Integration with Your App

### 1. Log Activity When Events Happen

**When user sends message:**
```javascript
// In your messageController.js, after saving message
await axios.post('http://localhost:5001/api/notifications/log-activity', {
  userId: req.body.userId,
  serverId: req.body.serverId,
  eventType: 'message_sent',
  metadata: { channelId: req.body.channelId }
});
```

**When user joins voice:**
```javascript
socket.on('user_join_voice', (data) => {
  axios.post('http://localhost:5001/api/notifications/log-activity', {
    userId: data.userId,
    serverId: data.serverId,
    eventType: 'voice_joined',
    metadata: { duration: data.duration }
  });
});
```

### 2. Send Notifications to User

Currently, notifications are logged to console. To send them to users:

**Option A: Email**
```javascript
// In NotificationScheduler.sendNotification()
await sendEmail(user.email, decision.message);
```

**Option B: Socket.io (Real-time)**
```javascript
io.to(userId).emit('ai_notification', {
  message: decision.message,
  priority: decision.priority,
  tone: decision.tone
});
```

**Option C: Push Notification**
```javascript
await sendPushNotification(user.pushToken, decision.message);
```

**Option D: Store in DB**
```javascript
await Notification.create({
  userId,
  message: decision.message,
  type: 'ai_engagement'
});
```

### 3. User Preferences UI

Users can customize their preferences:

```javascript
// Get current preferences
const prefs = await axios.get(
  `/api/notifications/preferences/${userId}/${serverId}`
);

// Update preferences
await axios.put(
  `/api/notifications/preferences/${userId}/${serverId}`,
  {
    enabled: true,
    quietHours: { start: 23, end: 8 }, // 11pm to 8am
    maxPerDay: 2,
    cooldownMinutes: 1440 // 24 hours
  }
);
```

## Customization

### Change Notification Frequency

Edit `NotificationScheduler.initialize()`:
```javascript
// Every 6 hours instead of 12
cron.schedule('0 0,6,12,18 * * *', () => {
  this.runNotificationCycle();
});
```

### Modify LLM Behavior

Edit `GeminiLLMEngine.getSystemPrompt()` to change decision logic, tone options, or rules.

### Adjust Policy Rules

In `NotificationPolicy` class:
```javascript
quietHours: { start: 22, end: 8 },    // 10pm-8am
maxPerDay: 3,                         // Max 3 per day
cooldownMinutes: 720,                 // 12 hours between notifications
```

## Monitoring

### Check Scheduler Status

The scheduler logs status to console. You can also check manually:

```javascript
const status = notificationScheduler.getStatus();
// { isRunning: false, nextRun: 'Every 12 hours', lastRun: Date }
```

### View Logs

Check `console.log` output in your terminal for:
- `🚀 Starting notification cycle...`
- `📊 Found X servers`
- `✉️ [PRIORITY] Username: Message`
- `✅ Notification cycle completed in Xs`

## Troubleshooting

### Scheduler Not Running

1. Check `.env` has `GEMINI_API_KEY`
2. Check MongoDB is connected
3. Check for errors in console output

### No Notifications Sent

1. Check activity logs exist: `GET /api/notifications/activity/<user_id>`
2. Test LLM decision: `POST /api/notifications/test-decision`
3. Check user preferences: `GET /api/notifications/stats/<user_id>/<server_id>`

### Gemini API Errors

- Verify API key is correct
- Check API key has permissions enabled
- Check billing is active on Google Cloud

## Next Steps

1. ✅ Integrate activity logging into existing Discord events
2. ✅ Choose notification delivery method (email, push, socket.io, etc.)
3. Implement notification UI component
4. Add user settings page for preferences
5. Monitor and tune LLM prompts based on user feedback
6. Add analytics dashboard
7. Implement A/B testing for different notification approaches

## Architecture Diagram

```
Discord Client
      ↓
[Event: Message/Voice/Reaction]
      ↓
Log Activity API
      ↓
ActivityLog DB
      ↓
[Every 12 hours]
      ↓
Scheduler (00:00, 12:00)
      ├→ SignalConverter (behavioral analysis)
      ├→ ContextBuilder (user profile + history)
      ├→ GeminiLLMEngine (decision making)
      ├→ NotificationPolicy (spam prevention)
      └→ SendNotification (email/push/socket.io)
      ↓
User (Desktop/Mobile)
```

## Questions?

Refer to `NOTIFICATION_SETUP.md` for detailed technical documentation.
