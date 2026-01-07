const express = require('express');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { db, admin } = require('./config/firebase');
const { createPost, likePost, commentOnPost, fetchRandomPost } = require('./services/postService');
const { BOT_USER_ID } = require('./services/botService');

const app = express();
const envPath = path.join(__dirname, '.env');

// Load env
function loadEnv() {
  return dotenv.parse(fs.readFileSync(envPath));
}

// Save env
function saveEnv(env) {
  const lines = Object.entries(env).map(([key, value]) => `${key}=${value}`);
  fs.writeFileSync(envPath, lines.join('\n'));
}

app.use(express.json());
app.use(express.static('public'));

// Get current status
app.get('/api/status', (req, res) => {
  const env = loadEnv();
  res.json({
    autoPost: env.ENABLE_AUTO_POST === 'true',
    autoLike: env.ENABLE_AUTO_LIKE === 'true',
    autoComment: env.ENABLE_AUTO_COMMENT === 'true',
    postInterval: parseInt(env.POST_INTERVAL),
    likeInterval: parseInt(env.LIKE_INTERVAL),
    commentInterval: parseInt(env.COMMENT_INTERVAL),
    botName: env.BOT_NAME,
    botEmail: env.BOT_EMAIL,
  });
});

// Update settings
app.post('/api/settings', (req, res) => {
  try {
    const env = loadEnv();
    const { autoPost, autoLike, autoComment, postInterval, likeInterval, commentInterval, botName } = req.body;

    if (autoPost !== undefined) env.ENABLE_AUTO_POST = String(autoPost);
    if (autoLike !== undefined) env.ENABLE_AUTO_LIKE = String(autoLike);
    if (autoComment !== undefined) env.ENABLE_AUTO_COMMENT = String(autoComment);
    // Accept either minutes or milliseconds from the client.
    // If the value looks like minutes (< 1,000,000), convert to ms; otherwise assume ms.
    const toMs = (val) => {
      const num = Number(val);
      if (!Number.isFinite(num) || num <= 0) return undefined;
      return num < 1_000_000 ? num * 60000 : num;
    };

    const pMs = toMs(postInterval);
    const lMs = toMs(likeInterval);
    const cMs = toMs(commentInterval);
    if (pMs) env.POST_INTERVAL = String(pMs);
    if (lMs) env.LIKE_INTERVAL = String(lMs);
    if (cMs) env.COMMENT_INTERVAL = String(cMs);
    if (botName) env.BOT_NAME = botName;

    saveEnv(env);
    res.json({ success: true, message: '✅ Settings saved! Restart bot to apply.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually create post
app.post('/api/action/post', async (req, res) => {
  try {
    const result = await createPost(BOT_USER_ID);
    res.json({ success: true, postId: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually like post
app.post('/api/action/like', async (req, res) => {
  try {
    const post = await fetchRandomPost();
    if (!post) return res.status(404).json({ error: 'No posts found' });
    await likePost(BOT_USER_ID, post.id);
    res.json({ success: true, postId: post.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually comment
app.post('/api/action/comment', async (req, res) => {
  try {
    const post = await fetchRandomPost();
    if (!post) return res.status(404).json({ error: 'No posts found' });
    await commentOnPost(BOT_USER_ID, post.id);
    res.json({ success: true, postId: post.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent posts (for stats)
app.get('/api/posts', async (req, res) => {
  try {
    const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').limit(10).get();
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.BOT_DASHBOARD_PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n📊 Bot Dashboard running at http://localhost:${PORT}`);
  console.log('Open this in your browser to control the bot!\n');
});
