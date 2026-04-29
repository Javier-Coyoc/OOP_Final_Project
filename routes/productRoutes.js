const express       = require("express");
const router        = express.Router();
const controller    = require("../controllers/productController");
const { authenticate, requireRole } = require("../Controllers/authMiddleware");

// Read access - All authenticated users (Admin, Manager, Cashier)
router.get("/",
  authenticate,
  requireRole("Admin", "Manager", "Cashier"),
  controller.getProducts
);

router.get("/:id",
  authenticate,
  requireRole("Admin", "Manager", "Cashier"),
  controller.getProductById
);

// Write access - Admin and Manager only
router.post("/",
  authenticate,
  requireRole("Admin", "Manager"),
  controller.addProduct
);

router.put("/:id",
  authenticate,
  requireRole("Admin", "Manager"),
  controller.updateProduct
);

router.delete("/:id",
  authenticate,
  requireRole("Admin", "Manager"),
  controller.deleteProduct
);

module.exports = router;
