/**
 * Root Server Entry Point
 * All backend source code and routes reside in the backend/ directory.
 * This file delegates execution directly to backend/server.js for deployment platforms and local convenience.
 */
module.exports = require('./backend/server.js');
