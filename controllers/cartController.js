const { Cart }    = require("../dist/classes/Cart");
const { Product } = require("../dist/classes/Product");
const db = require("../db/dbConnection");

// In-memory carts keyed by cashier id
const carts = {};

exports.getCart = (req, res) => {
  const { cashier_id } = req.params;
  const cart = carts[cashier_id] || null;
  if (!cart) return res.json({ items: [], promo_code: "", discount_percent: 0, tax_rate: 0.07 });

  res.json({
    items:            cart.getItems().map(i => ({
      product:  { id: i.product.getId(), name: i.product.getName(), price: i.product.getPrice() },
      quantity: i.quantity
    })),
    promo_code:       cart.getPromoCode(),
    tax_rate:         cart.getTaxRate(),
    discount_percent: cart.getDiscountPercent()
  });
};

exports.addItem = async (req, res) => {
  const { cashier_id } = req.params;
  const { product_id, quantity } = req.body;

  try {
    const result = await db.query("SELECT * FROM products WHERE id = $1", [product_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });

    const row  = result.rows[0];
    const prod = new Product(row.id, row.name, row.sku, parseFloat(row.price), row.category);

    if (!carts[cashier_id]) carts[cashier_id] = new Cart();
    carts[cashier_id].addItem(prod, parseInt(quantity));

    res.json({ message: "Item added", total: carts[cashier_id].getTotal().toFixed(2) });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Failed to add item" });
  }
};

exports.removeItem = (req, res) => {
  const { cashier_id, product_id } = req.params;
  if (!carts[cashier_id]) return res.status(404).json({ error: "Cart not found" });

  carts[cashier_id].removeItem(parseInt(product_id));
  res.json({ message: "Item removed", total: carts[cashier_id].getTotal().toFixed(2) });
};

exports.applyPromoCode = (req, res) => {
  const { cashier_id } = req.params;
  const { code } = req.body;

  if (!carts[cashier_id]) return res.status(404).json({ error: "Cart not found" });

  const applied = carts[cashier_id].applyPromoCode(code);
  if (applied) {
    res.json({ message: `Promo applied: ${code}`, total: carts[cashier_id].getTotal().toFixed(2) });
  } else {
    res.status(400).json({ error: "Invalid promo code" });
  }
};

exports.getCartTotals = (req, res) => {
  const { cashier_id } = req.params;
  if (!carts[cashier_id]) return res.status(404).json({ error: "Cart not found" });

  const cart = carts[cashier_id];
  res.json({
    subtotal:  parseFloat(cart.getSubtotal().toFixed(2)),
    discount:  parseFloat(cart.getDiscount().toFixed(2)),
    tax:       parseFloat(cart.getTaxAmount().toFixed(2)),
    total:     parseFloat(cart.getTotal().toFixed(2)),
    promo_code: cart.getPromoCode()
  });
};

exports.clearCart = (req, res) => {
  const { cashier_id } = req.params;
  if (carts[cashier_id]) carts[cashier_id].clear();
  res.json({ message: "Cart cleared" });
};
