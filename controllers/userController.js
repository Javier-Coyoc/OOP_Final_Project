const { User } = require("../dist/classes/User");
const db = require("../db/dbConnection");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Username not found" });

    const row  = result.rows[0];
    const user = new User(row.id, row.username, row.password, row.role, row.full_name, row.email);

    if (!user.getIsActive())
      return res.status(403).json({ error: "Account is disabled" });

    if (!user.checkPassword(password))
      return res.status(401).json({ error: "Incorrect password" });

    res.json({
      message:   `Welcome, ${user.getFullName()}!`,
      token:     `token_${user.getId()}_${Date.now()}`,  // simple token — swap for JWT later
      id:        user.getId(),
      role:      user.getRole(),
      full_name: user.getFullName(),
      username:  user.getUsername()
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Login failed" });
  }
};

exports.registerUser = async (req, res) => {
  const { username, password, role, full_name, email } = req.body;

  try {
    const user = new User(null, username, password, role, full_name, email);

    const result = await db.query(
      `INSERT INTO users (username, password, role, full_name, email)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, username, role, full_name, email`,
      [user.getUsername(), password, user.getRole(), user.getFullName(), user.getEmail()]
    );

    res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") return res.status(400).json({ error: "Username already taken" });
    res.status(400).json({ error: err.message || "Registration failed" });
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
    res.status(500).json({ error: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, username, is_active",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
