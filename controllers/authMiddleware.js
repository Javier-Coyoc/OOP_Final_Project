const db = require("../db/dbConnection");

// Verify token and attach user to request
exports.authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false,
      message: "Access token required" 
    });
  }

  const token = authHeader.split(" ")[1];
  
  // Simple token validation (token format: token_{user_id}_{timestamp})
  const parts = token.split("_");
  if (parts.length < 2) {
    return res.status(401).json({ 
      success: false,
      message: "Invalid token format" 
    });
  }

  const user_id = parseInt(parts[1]);

  try {
    const result = await db.query(
      "SELECT id, username, role, full_name, email, is_active FROM users WHERE id = $1",
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ 
        success: false,
        message: "Account is disabled" 
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ 
      success: false,
      message: "Authentication failed" 
    });
  }
};

// Role-based authorization
exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required" 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Insufficient permissions. Required roles: ${allowedRoles.join(", ")}`,
        currentRole: req.user.role
      });
    }

    next();
  };
};

// Convenience middleware for common role combinations
exports.requireAdmin = exports.requireRole("Admin");
exports.requireManagerOrAdmin = exports.requireRole("Manager", "Admin");
exports.requireAnyAuthenticated = exports.requireRole("Admin", "Manager", "Cashier");