const express       = require("express");
const router        = express.Router();
const controller    = require("../controllers/receiptController");
const { authenticate, requireRole } = require("../Controllers/authMiddleware");

// Create receipt - Cashiers can create receipts
router.post("/",
  authenticate,
  requireRole("Admin", "Manager", "Cashier"),
  controller.createReceipt
);

// View receipts - Admin/Manager can view all, Cashiers can view their own
router.get("/",
  authenticate,
  requireRole("Admin", "Manager"),
  controller.getReceipts
);

router.get("/:id",
  authenticate,
  requireRole("Admin", "Manager", "Cashier"),
  controller.getReceiptById
);

module.exports = router;
