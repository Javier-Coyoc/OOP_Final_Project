const db = require("../db/dbConnection");
const bcrypt = require("bcrypt"); // Add this

// User login - FIXED with bcrypt
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      success: false,
      message: "Username and password are required" 
    });
  }

  try {
    // First, find the user by username only
    const result = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid username or password" 
      });
    }

    const user = result.rows[0];

    // Compare password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid username or password" 
      });
    }

    if (!user.is_active) {
      return res.status(403).json({ 
        success: false,
        message: "Account is disabled. Please contact administrator." 
      });
    }

    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: `Welcome, ${user.full_name}!`,
      token: `token_${user.id}_${Date.now()}`,
      id: user.id,
      role: user.role,
      full_name: user.full_name,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: "Login failed. Please try again." 
    });
  }
};

// User registration - FIXED with bcrypt
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

  if (password.length < 4) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 4 characters"
    });
  }

  try {
    // Check if user exists
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
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const result = await db.query(
      `INSERT INTO users (username, password_hash, role, full_name, email, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, username, role, full_name, email, is_active, created_at`,
      [username, hashedPassword, role, full_name, email, true]
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
      message: "Registration failed. Please try again." 
    });
  }
};

// Get all users - ADD ROLE CHECK
exports.getUsers = async (req, res) => {
  // TODO: Add authentication middleware to get user role from token
  // For now, this is open but should be protected
  
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

// Toggle user status - ADD ROLE CHECK
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