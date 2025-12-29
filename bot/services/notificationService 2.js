const admin = require('firebase-admin');
const { db } = require('../config/firebase');

async function sendNotificationToUsers(title, body, data = {}) {
  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const tokens = [];

    usersSnapshot.forEach(doc => {
      const user = doc.data();
      // Get FCM tokens for users
      if (user.fcmTokens && Array.isArray(user.fcmTokens)) {
        tokens.push(...user.fcmTokens);
      }
    });

    if (tokens.length === 0) {
      console.log('⚠️ No users with notification tokens');
      return;
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      webpush: {
        fcmOptions: {
          link: '/feed',
        },
        notification: {
          title,
          body,
          icon: '/logoemesis.png',
          badge: '/logoemesis.png',
          tag: 'emesis-notification',
          requireInteraction: false,
        },
      },
    };

    // Send to all tokens
    const response = await admin.messaging().sendMulticast({
      ...message,
      tokens,
    });

    console.log(`📲 Sent ${response.successCount} notifications`);
    console.log(`❌ Failed: ${response.failureCount} notifications`);

    // Clean up invalid tokens
    const invalidTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        invalidTokens.push(tokens[idx]);
      }
    });

    if (invalidTokens.length > 0) {
      await removeInvalidTokens(invalidTokens);
    }

    return { success: response.successCount, failed: response.failureCount };
  } catch (error) {
    console.error('❌ Error sending notifications:', error);
  }
}

async function removeInvalidTokens(tokens) {
  try {
    const usersSnapshot = await db.collection('users').get();

    const batch = db.batch();
    usersSnapshot.forEach(doc => {
      const user = doc.data();
      if (user.fcmTokens) {
        const updatedTokens = user.fcmTokens.filter(
          token => !tokens.includes(token)
        );
        if (updatedTokens.length !== user.fcmTokens.length) {
          batch.update(doc.ref, { fcmTokens: updatedTokens });
        }
      }
    });

    await batch.commit();
    console.log('🧹 Cleaned up invalid tokens');
  } catch (error) {
    console.error('❌ Error cleaning tokens:', error);
  }
}

async function sendPostNotification(postText) {
  const title = '🤖 New Post from EMESIS Bot';
  const body = postText.substring(0, 100) + (postText.length > 100 ? '...' : '');

  await sendNotificationToUsers(title, body, {
    type: 'new_post',
    postType: 'bot',
  });
}

async function sendLikeNotification(postAuthorId, botName) {
  const title = `❤️ ${botName} liked your post`;
  const body = 'Check out the engagement!';

  // Send only to that user
  try {
    const userDoc = await db.collection('users').doc(postAuthorId).get();
    const user = userDoc.data();

    if (user?.fcmTokens && user.fcmTokens.length > 0) {
      await admin.messaging().sendMulticast({
        tokens: user.fcmTokens,
        notification: { title, body },
        data: {
          type: 'like_notification',
          userId: postAuthorId,
        },
        webpush: {
          fcmOptions: { link: '/feed' },
          notification: {
            title,
            body,
            icon: '/logoemesis.png',
            badge: '/logoemesis.png',
          },
        },
      });
      console.log(`💌 Sent like notification to ${postAuthorId}`);
    }
  } catch (error) {
    console.error('❌ Error sending like notification:', error);
  }
}

module.exports = {
  sendNotificationToUsers,
  sendPostNotification,
  sendLikeNotification,
  removeInvalidTokens,
};
