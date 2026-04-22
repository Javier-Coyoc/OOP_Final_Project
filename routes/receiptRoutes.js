const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/receiptController");

router.get("/",    controller.getReceipts);     // GET  /receipts
router.get("/:id", controller.getReceiptById);  // GET  /receipts/:id
router.post("/",   controller.createReceipt);   // POST /receipts

module.exports = router;
