# EMESIS Bot 🤖

Automated bot for keeping your EMESIS website active with posts, likes, and comments.

## Features

- ✅ **Auto-Posting**: Generates and posts content automatically
- ❤️ **Auto-Liking**: Likes random posts from the feed
- 💬 **Auto-Commenting**: Adds relevant comments to posts
- 🎯 **Configurable**: All intervals and features can be customized
- 🔄 **Scheduled Tasks**: Runs on set intervals

## Setup

### 1. Install Dependencies

```bash
cd bot
npm install
```

### 2. Firebase Configuration

Get your Firebase service account key from Firebase Console:
1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Save as `serviceAccountKey.json` in the `bot/` folder

### 3. Configure Environment Variables

Edit `.env` file:

```env
# Firebase credentials
FIREBASE_PROJECT_ID=your_project_id

# Bot settings
BOT_NAME=EMESIS Bot
BOT_EMAIL=bot@emesis.local

# Intervals (in milliseconds)
POST_INTERVAL=3600000         # 1 hour
LIKE_INTERVAL=600000          # 10 minutes
COMMENT_INTERVAL=900000       # 15 minutes

# Enable/Disable features
ENABLE_AUTO_POST=true
ENABLE_AUTO_LIKE=true
ENABLE_AUTO_COMMENT=true
```

### 4. Create Bot User (One-time)

The bot will automatically create its user account on first run.

### 5. Start the Bot

```bash
npm start
```

Or with auto-reload during development:

```bash
npm run dev
```

## Output Example

```
🚀 Starting EMESIS Bot...

✅ Bot user already exists
✅ Auto-posting enabled (every 60 minutes)
✅ Auto-liking enabled (every 10 minutes)
✅ Auto-commenting enabled (every 15 minutes)

✨ Bot is running and monitoring posts...

📝 [14:30:45] Creating new post...
✅ Post created: post_123456

❤️ [14:40:15] Liking post...
❤️ Liked post: post_654321

💬 [14:45:30] Commenting on post...
💬 Commented on post: post_987654
```

## Configuration Details

### Intervals

- **POST_INTERVAL**: How often to create new posts
  - Default: 3600000ms (1 hour)
  - Recommended: 1800000 - 7200000 (30 min - 2 hours)

- **LIKE_INTERVAL**: How often to like random posts
  - Default: 600000ms (10 minutes)
  - Recommended: 300000 - 900000 (5 - 15 minutes)

- **COMMENT_INTERVAL**: How often to comment on posts
  - Default: 900000ms (15 minutes)
  - Recommended: 600000 - 1800000 (10 - 30 minutes)

### Features

Toggle features on/off without stopping the bot:

```env
ENABLE_AUTO_POST=true      # Create posts
ENABLE_AUTO_LIKE=true      # Like posts
ENABLE_AUTO_COMMENT=true   # Comment on posts
```

## File Structure

```
bot/
├── index.js                    # Main bot entry point
├── .env                        # Configuration
├── package.json               # Dependencies
├── serviceAccountKey.json     # Firebase credentials (create manually)
├── config/
│   └── firebase.js           # Firebase initialization
├── services/
│   ├── botService.js         # Bot user management
│   └── postService.js        # Post operations
└── utils/
    └── contentGenerator.js   # Random content generation
```

## Troubleshooting

### "Firebase credentials not found"
- Place `serviceAccountKey.json` in the `bot/` folder

### "Post not found"
- Make sure posts exist in your database
- Check that the collection name is correct

### Bot not posting
- Verify `ENABLE_AUTO_POST=true` in `.env`
- Check console logs for errors
- Ensure bot user ID is correct

## Stopping the Bot

Press `Ctrl+C` to gracefully shut down the bot.

## Future Enhancements

- [ ] Database cleanup (remove old posts)
- [ ] Follow/unfollow users
- [ ] Share posts
- [ ] Custom content templates
- [ ] Analytics dashboard
- [ ] Rate limiting to avoid suspicion

---

Made for EMESIS 🚀
