// middleware/auth.js
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  // Your tokens are "token_{id}_{timestamp}" — parse the user id out
  const parts = token.split('_');
  if (parts.length < 2) return res.status(401).json({ message: 'Invalid token' });

  req.userId = parts[1];
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.headers['x-user-role'];
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };