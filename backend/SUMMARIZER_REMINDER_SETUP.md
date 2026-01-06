# AI Chat Summarizer & Reminder System Guide

## Overview

Two new intelligent features have been added:

### 1. **Chat Summarizer** 🎯
Generates AI-powered summaries of conversations for customizable time periods (1 day, 3 days, 7 days) using Google Gemini. Only the requesting user receives the summary.

### 2. **Reminder System** 🔔
Automatic reminder notifications with customizable sound popups. Runs every 3 hours (or user-configured interval) with support for quiet hours and frequency settings.

## Installation

### 1. Update Backend Dependencies

```bash
cd backend
npm install @google/generative-ai node-cron
```

Already installed if you set up the notification system earlier.

### 2. Environment Variables

Ensure `.env` has:
```env
GEMINI_API_KEY=AIzaSyDRCpBltcHlCX0oFvdfsw1xFkoLD7Ce7hQ
MONGODB_URI=your_mongodb_uri
```

### 3. Start Backend

```bash
npx nodemon index.js
```

You should see:
```
🚀 Server running on port 5001
🤖 AI Notification Scheduler initialized
🔔 Reminder Scheduler initialized
```

## Files Created

### Models
- **`models/ChatSummary.js`** - Stores generated chat summaries
- **`models/ReminderPreference.js`** - User reminder preferences and settings

### Services
- **`services/ChatSummarizer.js`** - Generates summaries using Gemini API
- **`services/ReminderScheduler.js`** - Triggers reminders every 3 hours

### Controllers & Routes
- **`controllers/summaryReminderController.js`** - API handlers
- **`routes/summaryReminderRoutes.js`** - API endpoints

## API Endpoints

### Chat Summary Endpoints

#### Request a Summary
```
POST /api/summary-reminder/summary/request
Body: {
  "userId": "user_id",
  "serverId": "server_id",
  "period": "1day" | "3days" | "7days"
}

Response:
{
  "success": true,
  "summary": {
    "_id": "...",
    "summaryContent": {
      "keyTopics": ["topic1", "topic2"],
      "highlights": ["highlight1", "highlight2"],
      "mainDiscussions": "Discussion summary...",
      "engagement": {
        "messageCount": 150,
        "channelsActive": ["channel_id_1", "channel_id_2"],
        "participantsCount": 12
      },
      "sentiment": {
        "overall": "positive",
        "trending": ["interesting_moment_1"]
      }
    },
    "metadata": {
      "messageCount": 150,
      "channelCount": 3,
      "processingTime": 2345
    }
  },
  "cached": false
}
```

#### Get All Summaries
```
GET /api/summary-reminder/summary/:userId/:serverId?limit=10

Response:
{
  "success": true,
  "count": 5,
  "summaries": [...]
}
```

#### Get Specific Summary
```
GET /api/summary-reminder/summary/detail/:summaryId

Response:
{
  "success": true,
  "summary": {...}
}
```

#### Get Unread Count
```
GET /api/summary-reminder/summary/:userId/:serverId/unread-count

Response:
{
  "success": true,
  "unreadCount": 3
}
```

#### Mark All as Read
```
PUT /api/summary-reminder/summary/:userId/:serverId/mark-read

Response:
{
  "success": true,
  "message": "5 summaries marked as read",
  "modifiedCount": 5
}
```

#### Delete Summary
```
DELETE /api/summary-reminder/summary/:summaryId

Response:
{
  "success": true,
  "message": "Summary deleted"
}
```

---

### Reminder Endpoints

#### Get Reminder Preferences
```
GET /api/summary-reminder/reminder/preferences/:userId/:serverId

Response:
{
  "success": true,
  "preferences": {
    "reminderSettings": {
      "enabled": true,
      "frequency": "3hours" | "6hours" | "12hours" | "daily",
      "soundEnabled": true,
      "soundType": "bell" | "chime" | "notification" | "alert",
      "quietHours": {
        "enabled": true,
        "start": 22,
        "end": 8
      },
      "reminderMessage": "You have a reminder! Check your updates."
    },
    "summaryReminder": {
      "enabled": true,
      "frequency": "daily" | "3days" | "7days"
    }
  }
}
```

#### Update Reminder Preferences
```
PUT /api/summary-reminder/reminder/preferences/:userId/:serverId
Body: {
  "reminderSettings": {
    "enabled": true,
    "frequency": "6hours",
    "soundEnabled": true,
    "soundType": "chime",
    "quietHours": {
      "enabled": true,
      "start": 23,
      "end": 9
    }
  },
  "summaryReminder": {
    "enabled": true,
    "frequency": "daily"
  }
}

Response:
{
  "success": true,
  "message": "Preferences updated",
  "preferences": {...}
}
```

#### Toggle Reminders On/Off
```
PUT /api/summary-reminder/reminder/:userId/:serverId/toggle
Body: { "enabled": true | false }

Response:
{
  "success": true,
  "message": "Reminders enabled",
  "enabled": true
}
```

#### Update Sound Settings
```
PUT /api/summary-reminder/reminder/:userId/:serverId/sound
Body: {
  "soundEnabled": true,
  "soundType": "chime",
  "reminderMessage": "Custom reminder message"
}

Response:
{
  "success": true,
  "message": "Sound preferences updated",
  "soundSettings": {...}
}
```

#### Get Reminder Statistics
```
GET /api/summary-reminder/reminder/stats/:userId/:serverId

Response:
{
  "success": true,
  "stats": {
    "enabled": true,
    "frequency": "3hours",
    "totalReminders": 25,
    "lastReminderTime": "2026-01-06T15:00:00Z",
    "soundEnabled": true,
    "soundType": "notification"
  }
}
```

---

## How It Works

### Chat Summarizer (On-Demand)

1. **User Request**
   ```javascript
   POST /api/summary-reminder/summary/request
   Body: { userId, serverId, period: "1day" | "3days" | "7days" }
   ```

2. **System Process**
   - Fetches all messages for the selected period
   - Formats conversation for LLM analysis
   - Sends to Gemini with structured prompt
   - Gemini analyzes and returns:
     - Key topics discussed
     - Main highlights
     - Sentiment analysis
     - Engagement metrics
     - Interesting moments

3. **Storage**
   - Saves summary to database
   - Cached for 6 hours (reuses if requested again)
   - Marked as unread for user

4. **User Receives**
   - Only this user sees the summary (no broadcast)
   - Includes engagement metrics and sentiment
   - Can mark as read, or delete

### Reminder System (Automatic)

#### Schedule: Every 3 Hours
Runs at: **00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00**

1. **System Checks Each User**
   - Is reminder enabled?
   - In quiet hours?
   - Time since last reminder?
   - Daily limit exceeded?

2. **Sends Reminder with Sound**
   ```javascript
   {
     "message": "You have a reminder! Check your updates.",
     "soundEnabled": true,
     "soundType": "notification" | "bell" | "chime" | "alert",
     "timestamp": Date,
     "type": "reminder"
   }
   ```

3. **User Experience**
   - Desktop/Mobile notification popup
   - Configured sound plays (if enabled)
   - Can dismiss or act on reminder
   - Respects quiet hours (10pm-8am by default)

## Frontend Integration

### 1. Request a Summary (React Example)

```javascript
const requestSummary = async (period) => {
  const response = await fetch('/api/summary-reminder/summary/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUser._id,
      serverId: currentServer._id,
      period: period // "1day", "3days", or "7days"
    })
  });
  
  const data = await response.json();
  if (data.success) {
    displaySummary(data.summary);
  }
};

// Usage
<button onClick={() => requestSummary('1day')}>Summary (1 Day)</button>
<button onClick={() => requestSummary('3days')}>Summary (3 Days)</button>
<button onClick={() => requestSummary('7days')}>Summary (7 Days)</button>
```

### 2. Display Summary Component

```javascript
const SummaryDisplay = ({ summary }) => (
  <div className="summary-card">
    <h3>Chat Summary</h3>
    
    <section>
      <h4>📌 Key Topics</h4>
      <ul>
        {summary.summaryContent.keyTopics.map((topic, i) => (
          <li key={i}>{topic}</li>
        ))}
      </ul>
    </section>

    <section>
      <h4>⭐ Highlights</h4>
      <ul>
        {summary.summaryContent.highlights.map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ul>
    </section>

    <section>
      <h4>💬 Main Discussion</h4>
      <p>{summary.summaryContent.mainDiscussions}</p>
    </section>

    <section>
      <h4>📊 Engagement</h4>
      <p>Messages: {summary.summaryContent.engagement.messageCount}</p>
      <p>Channels: {summary.summaryContent.engagement.channelsActive.length}</p>
      <p>Participants: {summary.summaryContent.engagement.participantsCount}</p>
      <p>Sentiment: {summary.summaryContent.sentiment.overall}</p>
    </section>
  </div>
);
```

### 3. Reminder Settings (React Example)

```javascript
const ReminderSettings = () => {
  const [prefs, setPrefs] = useState(null);

  useEffect(() => {
    fetch(`/api/summary-reminder/reminder/preferences/${userId}/${serverId}`)
      .then(r => r.json())
      .then(data => setPrefs(data.preferences));
  }, []);

  const updatePreferences = async () => {
    await fetch(
      `/api/summary-reminder/reminder/preferences/${userId}/${serverId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reminderSettings: {
            enabled: true,
            frequency: '3hours',
            soundEnabled: true,
            soundType: 'chime',
            quietHours: { enabled: true, start: 22, end: 8 }
          }
        })
      }
    );
  };

  return (
    <div>
      <label>
        <input 
          type="checkbox" 
          checked={prefs?.reminderSettings.enabled}
          onChange={e => updatePreferences()}
        />
        Enable Reminders
      </label>

      <select value={prefs?.reminderSettings.frequency}>
        <option value="3hours">Every 3 Hours</option>
        <option value="6hours">Every 6 Hours</option>
        <option value="12hours">Every 12 Hours</option>
        <option value="daily">Daily</option>
      </select>

      <label>
        <input 
          type="checkbox" 
          checked={prefs?.reminderSettings.soundEnabled}
        />
        Enable Sound
      </label>

      <select value={prefs?.reminderSettings.soundType}>
        <option value="bell">Bell</option>
        <option value="chime">Chime</option>
        <option value="notification">Notification</option>
        <option value="alert">Alert</option>
      </select>

      <button onClick={updatePreferences}>Save Preferences</button>
    </div>
  );
};
```

### 4. Listen for Reminders (Socket.io)

```javascript
useEffect(() => {
  socket.on('reminder', (reminderData) => {
    // Show popup notification
    showNotification({
      title: 'Reminder',
      message: reminderData.message,
      sound: reminderData.soundType
    });

    // Play sound if enabled
    if (reminderData.soundEnabled) {
      playSound(`/sounds/${reminderData.soundType}.mp3`);
    }
  });
}, [socket]);
```

## Configuration

### Change Reminder Frequency

Default: Every 3 hours

To change, edit `ReminderScheduler.initialize()`:
```javascript
// Every 6 hours
cron.schedule('0 0,6,12,18 * * *', () => {
  this.runReminderCycle();
});

// Every 12 hours
cron.schedule('0 0,12 * * *', () => {
  this.runReminderCycle();
});

// Daily at 9 AM
cron.schedule('0 9 * * *', () => {
  this.runReminderCycle();
});
```

### Customize Sound Types

In `ReminderPreference` model, add more sound types:
```javascript
soundType: {
  type: String,
  enum: ['bell', 'chime', 'notification', 'alert', 'ping', 'ding', 'custom'],
  default: 'notification'
}
```

### Quiet Hours

Default: 10 PM to 8 AM

Users can configure via API:
```javascript
quietHours: {
  enabled: true,
  start: 23,    // 11 PM
  end: 7        // 7 AM
}
```

## Testing

### Test Summary Generation

```bash
curl -X POST http://localhost:5001/api/summary-reminder/summary/request \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"<user_id>",
    "serverId":"<server_id>",
    "period":"1day"
  }'
```

### Test Reminder Preferences

```bash
curl http://localhost:5001/api/summary-reminder/reminder/preferences/<user_id>/<server_id>
```

### Test Updating Preferences

```bash
curl -X PUT http://localhost:5001/api/summary-reminder/reminder/preferences/<user_id>/<server_id> \
  -H "Content-Type: application/json" \
  -d '{
    "reminderSettings": {
      "enabled": true,
      "frequency": "6hours",
      "soundEnabled": true,
      "soundType": "chime"
    }
  }'
```

## Features Summary

| Feature | Details |
|---------|---------|
| **Summary Periods** | 1 day, 3 days, 7 days |
| **Caching** | 6-hour cache for same summaries |
| **User Privacy** | Summary only visible to requesting user |
| **Reminder Frequency** | Every 3 hours (configurable) |
| **Sound Types** | Bell, Chime, Notification, Alert |
| **Quiet Hours** | Respects user's sleep schedule |
| **Sentiment Analysis** | Detects overall conversation mood |
| **Engagement Metrics** | Message count, channels, participants |
| **Key Topics** | Auto-detects main discussion topics |

## Troubleshooting

### Summaries Not Generated
- Check Gemini API key is valid
- Ensure messages exist in the period
- Check MongoDB connection

### Reminders Not Sending
- Verify `ReminderPreference` exists for user
- Check if reminders are enabled
- Verify not in quiet hours
- Check scheduler is running in terminal

### Sound Not Playing
- Ensure `soundEnabled: true`
- Check browser permissions for audio
- Verify audio files exist at `/sounds/`

## Next Steps

1. ✅ Integrate summary display UI
2. ✅ Implement reminder notification popup
3. Add sound files to frontend (`/public/sounds/`)
4. Add preference settings page
5. Monitor summary quality and tune prompts
6. Add analytics on summary usage
7. Implement email notifications option

