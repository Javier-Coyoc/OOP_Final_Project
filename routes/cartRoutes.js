const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/cartController");

router.get("/:cashier_id",                       controller.getCart);        // GET    /cart/:cashier_id
router.get("/:cashier_id/totals",                controller.getCartTotals);  // GET    /cart/:cashier_id/totals
router.post("/:cashier_id/add",                  controller.addItem);        // POST   /cart/:cashier_id/add
router.post("/:cashier_id/promo",                controller.applyPromoCode); // POST   /cart/:cashier_id/promo
router.delete("/:cashier_id/remove/:product_id", controller.removeItem);     // DELETE /cart/:cashier_id/remove/:product_id
router.delete("/:cashier_id/clear",              controller.clearCart);      // DELETE /cart/:cashier_id/clear

module.exports = router;
