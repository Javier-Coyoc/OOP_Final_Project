const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");
const { authenticate, requireRole } = require("../controllers/authMiddleware");

// Public routes (no auth required)
router.post("/login", controller.login);
router.post("/register", controller.registerUser);

// GET /users - Fetch all users (Protected - Admin/Manager only)
router.get("/",
  authenticate,
  requireRole("Admin", "Manager"),
  controller.getUsers
);

// PUT /users/:id/toggle - Toggle user status (Protected - Admin only)
router.put("/:id/toggle",
  authenticate,
  requireRole("Admin"),
  controller.toggleUserStatus
);

module.exports = router;