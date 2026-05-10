const db = require("../db/dbConnection");

// 1. User login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Debug log to see what's happening in terminal
    console.log(`Attempting login for: ${username}`);

    const result = await db.query(
      "SELECT * FROM users WHERE username = $1", 
      [username]
    );
    
    const user = result.rows[0]; // This is the ONLY time we declare 'user'

    // Check if user exists
    if (!user) {
      console.log("User not found in DB");
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    // Compare the plain text password
    if (user.password_hash.trim() !== password.trim()) {
      console.log(`Password mismatch for ${username}`);
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: "Account disabled" });
    }

    // Success!
    res.json({
      success: true,
      message: `Welcome, ${user.full_name}!`,
      token: `token_${user.id}_${Date.now()}`,
      id: user.id,
      role: user.role,
      full_name: user.full_name
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 2. User registration
exports.registerUser = async (req, res) => {
  const { full_name, username, email, role, password } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO users (username, password_hash, role, full_name, email, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, username, role, full_name, email, is_active`,
      [username, password, role, full_name, email, true]
    );
    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

// 3. Get all users
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

// 4. Toggle status
exports.toggleUserStatus = async (req, res) => {
  try {
    const result = await db.query("UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING *", [req.params.id]);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};