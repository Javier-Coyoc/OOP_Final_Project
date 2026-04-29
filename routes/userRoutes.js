const express       = require("express");
const router        = express.Router();
const controller    = require("../Controllers/userController");
const { authenticate, requireRole } = require("../Controllers/authMiddleware");

// Public routes (no auth required)
router.post("/login",    controller.login);
router.post("/register", controller.registerUser);

// Protected routes - Admin/Manager only
router.get("/",
  authenticate,
  requireRole("Admin", "Manager"),
  controller.getUsers
);

router.put("/:id/toggle",
  authenticate,
  requireRole("Admin", "Manager"),
  controller.toggleUserStatus
);

module.exports = router;