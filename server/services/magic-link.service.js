const crypto = require('crypto');

const PENDING = new Map(); // token -> { email, expiresAt }
const TTL_MS = Number(process.env.MAGIC_LINK_TTL_MS || 10 * 60 * 1000); // 10 minutes

function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

function create(email) {
  const token = generateToken();
  const expiresAt = Date.now() + TTL_MS;
  PENDING.set(token, { email: String(email).toLowerCase(), expiresAt });
  return { token, expiresAt };
}

function consume(token) {
  const entry = PENDING.get(String(token));
  if (!entry) return null;
  PENDING.delete(String(token));
  if (entry.expiresAt < Date.now()) return null;
  return entry.email;
}

module.exports = { create, consume };


