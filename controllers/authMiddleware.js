const db = require('../db/dbConnection');

/**
 * authenticate / requireAuth
 * Rejects requests with no/invalid token.
 * Attaches the full user row to req.user.
 * Token format: "token_<userId>_<timestamp>"
 */
exports.authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided. Please log in.' });
  }

  // Parse token_<userId>_<timestamp>
  const parts = token.split('_');
  if (parts.length < 3 || parts[0] !== 'token') {
    return res.status(401).json({ success: false, message: 'Invalid token format.' });
  }

  const userId = parseInt(parts[1], 10);
  if (isNaN(userId)) {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  try {
    const result = await db.query(
      'SELECT id, username, role, full_name, email, is_active FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is disabled.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ success: false, message: 'Authentication error.' });
  }
};

// Alias so both old and new import styles work
exports.requireAuth = exports.authenticate;

/**
 * requireRole(...roles)
 * Use after authenticate. Rejects if req.user.role is not in the allowed list.
 *
 * Usage:
 *   router.delete('/:id', authenticate, requireRole('Admin'), controller.deleteProduct);
 */
exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}.`,
    });
  }
  next();
};

// Convenience middleware for common role combinations
exports.requireAdmin = exports.requireRole('Admin');
exports.requireManagerOrAdmin = exports.requireRole('Manager', 'Admin');
exports.requireAnyAuthenticated = exports.requireRole('Admin', 'Manager', 'Cashier');