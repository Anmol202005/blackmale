const crypto = require('crypto');

const adjectives = [
  'quick', 'lazy', 'happy', 'sad', 'big', 'small', 'fast', 'slow',
  'bright', 'dark', 'hot', 'cold', 'new', 'old', 'young', 'fresh',
  'clean', 'dirty', 'calm', 'wild', 'soft', 'hard', 'light', 'heavy'
];

const nouns = [
  'cat', 'dog', 'bird', 'fish', 'tree', 'rock', 'star', 'moon',
  'sun', 'car', 'bike', 'book', 'pen', 'cup', 'hat', 'bag',
  'phone', 'key', 'door', 'window', 'chair', 'table', 'lamp', 'clock'
];

function generateRandomAlias() {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 9999);

  return `${randomAdjective}${randomNoun}${randomNumber}`;
}

function generateSecureAlias(length = 12) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += characters[bytes[i] % characters.length];
  }

  return result;
}

module.exports = {
  generateRandomAlias,
  generateSecureAlias
};