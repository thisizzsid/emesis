const { db } = require('../config/firebase');
const { getRandomPost } = require('../utils/contentGenerator');
const { sendPostNotification } = require('./notificationService');

async function createPost(userId) {
  try {
    const postContent = getRandomPost();
    
    const postRef = await db.collection('posts').add({
      uid: userId,
      text: postContent,
      createdAt: new Date(),
      likes: [],
      comments: [],
      shares: 0,
      views: Math.floor(Math.random() * 1000) + 100,
    });

    console.log(`✅ Post created: ${postRef.id}`);
    
    // Send push notifications to all users
    await sendPostNotification(postContent);
    
    return postRef.id;
  } catch (error) {
    console.error('❌ Error creating post:', error);
  }
}

async function likePost(userId, postId) {
  try {
    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      console.log(`⚠️ Post ${postId} not found`);
      return;
    }

    const likes = postDoc.data().likes || [];
    
    if (!likes.includes(userId)) {
      await postRef.update({
        likes: [...likes, userId],
      });
      console.log(`❤️ Liked post: ${postId}`);
    }
  } catch (error) {
    console.error('❌ Error liking post:', error);
  }
}

async function commentOnPost(userId, postId) {
  try {
    const { getRandomComment } = require('../utils/contentGenerator');
    const commentText = getRandomComment();

    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      console.log(`⚠️ Post ${postId} not found`);
      return;
    }

    const comments = postDoc.data().comments || [];
    
    const newComment = {
      uid: userId,
      text: commentText,
      createdAt: new Date(),
      id: `comment_${Date.now()}`,
    };

    await postRef.update({
      comments: [...comments, newComment],
    });

    console.log(`💬 Commented on post: ${postId}`);
  } catch (error) {
    console.error('❌ Error commenting on post:', error);
  }
}

async function fetchRandomPost() {
  try {
    const snapshot = await db
      .collection('posts')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    if (snapshot.empty) {
      console.log('⚠️ No posts found');
      return null;
    }

    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return posts[Math.floor(Math.random() * posts.length)];
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    return null;
  }
}

module.exports = {
  createPost,
  likePost,
  commentOnPost,
  fetchRandomPost,
};
