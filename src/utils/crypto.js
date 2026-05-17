const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const ivLength = 16; 

// Function to get the secret key buffer
const getSecretKey = () => {
  const key = process.env.SECRET_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('SECRET_ENCRYPTION_KEY is not defined in environment variables');
  }
  
  // If the key is a 64-character hex string, it represents 32 bytes
  if (key.length === 64) {
    return Buffer.from(key, 'hex');
  }
  
  // Otherwise, use it as a raw string (if it's already 32 bytes)
  const buf = Buffer.from(key);
  if (buf.length !== 32) {
    throw new Error(`Invalid SECRET_ENCRYPTION_KEY length: expected 32 bytes (64 hex chars), got ${buf.length} bytes`);
  }
  return buf;
};

const encryptText = (text) => {
  if (!text) return null;

  try {
    const secretKey = getSecretKey();
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error.message);
    throw error;
  }
};

const decryptText = (encryptedText) => {
  if (!encryptedText) return null;

  try {
    const secretKey = getSecretKey();
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw error;
  }
};

module.exports = {
  encryptText,
  decryptText
};