// Random content generator for the bot
const postTopics = [
  'Check out this amazing feature!',
  'Just discovered something cool on EMESIS',
  'The community here is incredible 🚀',
  'New update just dropped! Have you tried it?',
  'This platform is changing the game',
  'Who else is loving this? Amazing work team!',
  'Just had the best experience on EMESIS',
  'The innovation here is unreal',
  'Shoutout to everyone building amazing things',
  'This is exactly what I was looking for',
  'The future is here and it looks bright ✨',
  'Can\'t believe how smooth this is',
  'Revolutionary platform 🔥',
  'Every day I discover something new here',
  'This is next level'
];

const commentResponses = [
  'Totally agree! 💯',
  'This is exactly what I was thinking',
  'Amazing post! Keep it up',
  'So true! Great perspective',
  'Love this! Well said',
  '100% agree with this',
  'This deserves more recognition',
  'Couldn\'t have said it better',
  'Great insight! Thanks for sharing',
  'Absolutely on point! 🎯',
  'This is brilliant',
  'So helpful, thanks!',
  'I second this',
  'Well articulated! 👌',
  'This resonates with me'
];

const emojiReactions = ['❤️', '👍', '🔥', '✨', '🎉', '😂', '🚀'];

function getRandomPost() {
  return postTopics[Math.floor(Math.random() * postTopics.length)];
}

function getRandomComment() {
  return commentResponses[Math.floor(Math.random() * commentResponses.length)];
}

function getRandomEmoji() {
  return emojiReactions[Math.floor(Math.random() * emojiReactions.length)];
}

module.exports = {
  getRandomPost,
  getRandomComment,
  getRandomEmoji,
};
