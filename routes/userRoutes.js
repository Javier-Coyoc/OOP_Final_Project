const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/userController");

router.post("/login",      controller.login);            // POST /auth/login
router.post("/register",   controller.registerUser);     // POST /users/register
router.get("/",            controller.getUsers);          // GET  /users
router.put("/:id/toggle",  controller.toggleUserStatus); // PUT  /users/:id/toggle

module.exports = router;
