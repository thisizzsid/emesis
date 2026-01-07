const { db, auth } = require('../config/firebase');

// Bot user ID - you should create this user manually first
const BOT_USER_ID = 'bot_user_123';

async function initializeBot() {
  try {
    console.log('🤖 Initializing EMESIS Bot...');

    // Check if bot user exists in Firestore
    const botUserDoc = await db.collection('users').doc(BOT_USER_ID).get();

    if (!botUserDoc.exists) {
      // Create bot user if it doesn't exist
      await db.collection('users').doc(BOT_USER_ID).set({
        uid: BOT_USER_ID,
        username: process.env.BOT_NAME || 'EMESIS Bot',
        email: process.env.BOT_EMAIL || 'bot@emesis.local',
        profilePicture: null,
        bio: 'Keeping the community active and engaged! 🚀',
        createdAt: new Date(),
        followers: [],
        following: [],
        isBot: true,
      });

      console.log('✅ Bot user created');
    } else {
      console.log('✅ Bot user already exists');
    }

    return BOT_USER_ID;
  } catch (error) {
    console.error('❌ Error initializing bot:', error);
    throw error;
  }
}

async function getBotUser() {
  try {
    const botUserDoc = await db.collection('users').doc(BOT_USER_ID).get();
    return botUserDoc.data();
  } catch (error) {
    console.error('❌ Error fetching bot user:', error);
    return null;
  }
}

module.exports = {
  initializeBot,
  getBotUser,
  BOT_USER_ID,
};
