const express       = require("express");
const router        = express.Router();
const controller    = require("../controllers/cartController");
const { authenticate, requireRole } = require("../Controllers/authMiddleware");

// Cart access - Cashiers can manage their own cart, Admins/Managers can view all
router.get("/:cashier_id",
  authenticate,
  requireRole("Admin", "Manager", "Cashier"),
  controller.getCart
);

router.get("/:cashier_id/totals",
  authenticate,
  requireRole("Admin", "Manager", "Cashier"),
  controller.getCartTotals
);

router.post("/:cashier_id/add",
  authenticate,
  requireRole("Admin", "Manager", "Cashier"),
  controller.addItem
);

router.post("/:cashier_id/promo",
  authenticate,
  requireRole("Admin", "Manager", "Cashier"),
  controller.applyPromoCode
);

router.delete("/:cashier_id/remove/:product_id",
  authenticate,
  requireRole("Admin", "Manager", "Cashier"),
  controller.removeItem
);

router.delete("/:cashier_id/clear",
  authenticate,
  requireRole("Admin", "Manager", "Cashier"),
  controller.clearCart
);

module.exports = router;
