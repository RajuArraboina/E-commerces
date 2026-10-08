/**
 * Root Server Entry Point
 * All backend source code and routes reside in the backend/ directory.
 */
// Ensure global crypto is defined across all Node.js runtime environments
if (typeof globalThis.crypto === 'undefined' || typeof global.crypto === 'undefined') {
  const nodeCrypto = require('crypto');
  global.crypto = nodeCrypto;
  globalThis.crypto = nodeCrypto;
}

module.exports = require('./backend/server.js');
