require('dotenv').config();
const { initializeBot, BOT_USER_ID } = require('./services/botService');
const { startChatWatcher } = require('./services/chatWatcher');
const { createPost, likePost, commentOnPost, fetchRandomPost } = require('./services/postService');

let botActive = false;

async function startBot() {
  try {
    console.log('🚀 Starting EMESIS Bot...\n');

    // Initialize bot
    await initializeBot();
    botActive = true;

    // Auto-posting interval
    if (process.env.ENABLE_AUTO_POST === 'true') {
      const postInterval = parseInt(process.env.POST_INTERVAL) || 3600000; // 1 hour default
      setInterval(async () => {
        if (botActive) {
          console.log(`\n📝 [${new Date().toLocaleTimeString()}] Creating new post...`);
          await createPost(BOT_USER_ID);
        }
      }, postInterval);
      console.log(`✅ Auto-posting enabled (every ${postInterval / 1000 / 60} minutes)`);
    }

    // Auto-liking interval
    if (process.env.ENABLE_AUTO_LIKE === 'true') {
      const likeInterval = parseInt(process.env.LIKE_INTERVAL) || 600000; // 10 minutes default
      setInterval(async () => {
        if (botActive) {
          const post = await fetchRandomPost();
          if (post) {
            console.log(`\n❤️ [${new Date().toLocaleTimeString()}] Liking post...`);
            await likePost(BOT_USER_ID, post.id);
          }
        }
      }, likeInterval);
      console.log(`✅ Auto-liking enabled (every ${likeInterval / 1000 / 60} minutes)`);
    }

    // Auto-commenting interval
    if (process.env.ENABLE_AUTO_COMMENT === 'true') {
      const commentInterval = parseInt(process.env.COMMENT_INTERVAL) || 900000; // 15 minutes default
      setInterval(async () => {
        if (botActive) {
          const post = await fetchRandomPost();
          if (post) {
            console.log(`\n💬 [${new Date().toLocaleTimeString()}] Commenting on post...`);
            await commentOnPost(BOT_USER_ID, post.id);
          }
        }
      }, commentInterval);
      console.log(`✅ Auto-commenting enabled (every ${commentInterval / 1000 / 60} minutes)`);
    }

    // Start chat notifications watcher
    const stopChatWatcher = startChatWatcher();

    console.log('\n✨ Bot is running: posts + chat watcher active...\n');

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Bot shutting down...');
      botActive = false;
      try { stopChatWatcher && stopChatWatcher(); } catch {}
      setTimeout(() => {
        console.log('👋 Goodbye!');
        process.exit(0);
      }, 1000);
    });

  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

// Start the bot
startBot();
