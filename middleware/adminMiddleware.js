/**
 * Admin Authorization Middleware:
 * Ensures the authenticated user has the 'admin' role.
 * Must be preceded by protect (authMiddleware).
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Requires admin privileges',
    });
  }
};

module.exports = { adminOnly };
