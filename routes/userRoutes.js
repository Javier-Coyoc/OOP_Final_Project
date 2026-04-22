const express    = require("express");
const router     = express.Router();
const controller = require("../Controllers/userController");

router.post("/login",      controller.login);
router.post("/register",   controller.registerUser);
router.get("/",            controller.getUsers);
router.put("/:id/toggle",  controller.toggleUserStatus);

module.exports = router;