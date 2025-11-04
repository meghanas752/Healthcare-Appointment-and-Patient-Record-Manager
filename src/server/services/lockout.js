// src/server/services/lockout.js
const LOCK_MINUTES = 15;
const MAX_ATTEMPTS = 5;

function isLocked(user, now = new Date()) {
  if (!user.lockout_until) return { locked: false };
  const unlockAt = new Date(user.lockout_until);
  return { locked: now < unlockAt, unlockAt };
}

function onFailure(user, now = new Date()) {
  const attempts = (user.failed_attempts || 0) + 1;
  if (attempts >= MAX_ATTEMPTS) {
    const unlockAt = new Date(now.getTime() + LOCK_MINUTES * 60 * 1000);
    return {
      failed_attempts: attempts,
      lockout_until: unlockAt.toISOString(),
      attemptsLeft: 0
    };
  }
  return {
    failed_attempts: attempts,
    lockout_until: user.lockout_until || null,
    attemptsLeft: MAX_ATTEMPTS - attempts
  };
}

function onSuccess() {
  return { failed_attempts: 0, lockout_until: null };
}

module.exports = { isLocked, onFailure, onSuccess, LOCK_MINUTES, MAX_ATTEMPTS };
