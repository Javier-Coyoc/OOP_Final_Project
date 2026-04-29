const db = require("../db/dbConnection");

// User login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      success: false,
      message: "Username and password are required" 
    });
  }

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE username = $1 AND password_hash = $2",
      [username, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid username or password" 
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ 
        success: false,
        message: "Account is disabled" 
      });
    }

    const { password_hash, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: `Welcome, ${user.full_name}!`,
    token: `token_${user.id}_${Date.now()}`,
    // Add these direct properties for frontend convenience
    id: user.id,
    role: user.role,
    full_name: user.full_name,
    user: userWithoutPassword
  });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: "Login failed" 
    });
  }
};

// User registration
exports.registerUser = async (req, res) => {
  const { full_name, username, email, role, password } = req.body;

  if (!full_name || !username || !email || !role || !password) {
    return res.status(400).json({ 
      success: false,
      message: "All fields are required" 
    });
  }

  const validRoles = ['Admin', 'Cashier', 'Manager'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ 
      success: false,
      message: "Role must be Admin, Cashier, or Manager" 
    });
  }

  try {
    const userExists = await db.query(
      "SELECT id FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );
    
    if (userExists.rows.length > 0) {
      return res.status(409).json({ 
        success: false,
        message: "Username or email already exists" 
      });
    }
    
    const result = await db.query(
      `INSERT INTO users (username, password_hash, role, full_name, email, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, username, role, full_name, email, is_active, created_at`,
      [username, password, role, full_name, email, true]
    );

    res.status(201).json({ 
      success: true,
      message: "User registered successfully", 
      user: result.rows[0] 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false,
      message: "Registration failed" 
    });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, username, role, full_name, email, is_active, created_at FROM users ORDER BY id"
    );
    
    res.json({ 
      success: true,
      users: result.rows 
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve users" 
    });
  }
};

// Toggle user status
exports.toggleUserStatus = async (req, res) => {
  const userId = req.params.id;
  
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ 
      success: false,
      message: "Valid user ID is required" 
    });
  }

  try {
    const result = await db.query(
      "UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, username, is_active, role",
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    res.json({ 
      success: true,
      message: `User status updated`,
      user: result.rows[0] 
    });
  } catch (err) {
    console.error('Toggle status error:', err);
    res.status(500).json({ 
      success: false,
      message: "Failed to update user status" 
    });
  }
};
