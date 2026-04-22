const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/productController");

router.get("/",       controller.getProducts);    // GET  /products
router.get("/:id",    controller.getProductById); // GET  /products/:id
router.post("/",      controller.addProduct);     // POST /products
router.put("/:id",    controller.updateProduct);  // PUT  /products/:id
router.delete("/:id", controller.deleteProduct);  // DELETE /products/:id

module.exports = router;
