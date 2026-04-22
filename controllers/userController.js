const bcrypt = require('bcrypt');
const db = require("../db/dbConnection");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.json({
      message: `Welcome, ${user.full_name}!`,
      token: `token_${user.id}_${Date.now()}`,
      id: user.id,
      role: user.role,
      full_name: user.full_name,
      username: user.username
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

exports.registerUser = async (req, res) => {
  const { full_name, username, email, role, password } = req.body;

  // Basic validation
  if (!full_name || !username || !email || !role || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user exists
    const userExists = await db.query(
      "SELECT id FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );
    
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "Username or email already exists" });
    }

    // Hash password and create user
    const password_hash = await bcrypt.hash(password, 10);
    
    const result = await db.query(
      `INSERT INTO users (username, password_hash, role, full_name, email, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, username, role, full_name, email`,
      [username, password_hash, role, full_name, email, true]
    );

    res.status(201).json({ 
      message: "User registered successfully", 
      user: result.rows[0] 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, username, role, full_name, email, is_active FROM users ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve users" });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, username, is_active",
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user status" });
  }
};
