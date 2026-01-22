const { db } = require('../config/firebase');
const { sendChatMessageNotification } = require('./notificationService');

// Watch for new chat messages and send FCM to the recipient
function startChatWatcher() {
  console.log('👂 Starting chat message watcher...');

  let initialLoadComplete = false;

  const unsub = db.collectionGroup('messages').onSnapshot(
    (snapshot) => {
      if (!initialLoadComplete) {
        // Skip notifications for the initial bootstrapped set
        initialLoadComplete = true;
        return;
      }

      snapshot.docChanges().forEach(async (change) => {
        if (change.type !== 'added') return;
        const doc = change.doc;
        const data = doc.data() || {};

        // Parent path like: chats/{chatId}/messages/{messageId}
        const path = doc.ref.path; // e.g., chats/uidA_uidB/messages/abc
        const parts = path.split('/');
        const chatId = parts.length >= 2 ? parts[1] : null;
        const senderUid = data.uid;
        if (!chatId || !senderUid) return;

        // Infer recipient from chatId parts
        const ids = chatId.split('_');
        let recipientUid = null;
        if (ids.length === 2) {
          recipientUid = ids[0] === senderUid ? ids[1] : ids[0];
        }

        if (!recipientUid) return;

        // Fetch sender to display name
        let senderName = 'User';
        try {
          const senderDoc = await db.collection('users').doc(senderUid).get();
          const sData = senderDoc.data();
          senderName = sData?.username || sData?.name || 'User';
        } catch {}

        // Avoid re-sending if already marked
        if (data.notified === true) return;

        try {
          await sendChatMessageNotification(
            recipientUid,
            senderName,
            data.text || '',
            chatId,
            senderUid
          );
          // Mark as notified to prevent duplicates on restart
          await doc.ref.update({ notified: true });
        } catch (err) {
          console.error('❌ Chat watcher notify error:', err);
        }
      });
    },
    (err) => {
      console.error('❌ Chat watcher error:', err);
    }
  );

  return () => {
    try { unsub(); } catch {}
  };
}

module.exports = { startChatWatcher };
