const { Cart }    = require("../dist/classes/Cart");
const { Product } = require("../dist/classes/Product");
const db = require("../db/dbConnection");

// In-memory carts keyed by user id (from authenticated session)
const carts = {};

// Helper to get cart for authenticated user
const getUserCart = (user_id) => {
  if (!carts[user_id]) {
    carts[user_id] = new Cart();
  }
  return carts[user_id];
};

exports.getCart = (req, res) => {
  const user_id = req.user.id;
  const cart = getUserCart(user_id);

  res.json({
    items: cart.getItems().map(i => ({
      product: {
        id: i.product.getId(),
        name: i.product.getName(),
        price: i.product.getPrice(),
        sku: i.product.getSku()
      },
      quantity: i.quantity
    })),
    promo_code: cart.getPromoCode(),
    tax_rate: cart.getTaxRate(),
    discount_percent: cart.getDiscountPercent()
  });
};

exports.addItem = async (req, res) => {
  const user_id = req.user.id;
  const { product_id, quantity } = req.body;

  // Validate input
  if (!product_id || isNaN(product_id)) {
    return res.status(400).json({ error: "Valid product_id is required" });
  }
  if (!quantity || isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "Valid quantity (> 0) is required" });
  }

  try {
    const result = await db.query("SELECT * FROM products WHERE id = $1", [product_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const row = result.rows[0];
    const prod = new Product(row.id, row.name, row.sku, parseFloat(row.price), row.category);

    const cart = getUserCart(user_id);
    cart.addItem(prod, parseInt(quantity));

    res.json({
      success: true,
      message: "Item added",
      total: cart.getTotal().toFixed(2),
      item_count: cart.getItems().reduce((sum, i) => sum + i.quantity, 0)
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Failed to add item" });
  }
};

exports.removeItem = (req, res) => {
  const user_id = req.user.id;
  const { product_id } = req.params;

  if (!carts[user_id]) {
    return res.status(404).json({ error: "Cart not found" });
  }

  carts[user_id].removeItem(parseInt(product_id));
  res.json({
    success: true,
    message: "Item removed",
    total: carts[user_id].getTotal().toFixed(2)
  });
};

exports.applyPromoCode = (req, res) => {
  const user_id = req.user.id;
  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: "Promo code is required" });
  }

  if (!carts[user_id]) {
    return res.status(404).json({ error: "Cart not found" });
  }

  const applied = carts[user_id].applyPromoCode(code.toUpperCase());
  if (applied) {
    res.json({
      success: true,
      message: `Promo applied: ${code}`,
      total: carts[user_id].getTotal().toFixed(2)
    });
  } else {
    res.status(400).json({ error: "Invalid promo code" });
  }
};

exports.getCartTotals = (req, res) => {
  const user_id = req.user.id;
  
  if (!carts[user_id]) {
    return res.json({
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      promo_code: "",
      item_count: 0
    });
  }

  const cart = carts[user_id];
  res.json({
    subtotal: parseFloat(cart.getSubtotal().toFixed(2)),
    discount: parseFloat(cart.getDiscount().toFixed(2)),
    tax: parseFloat(cart.getTaxAmount().toFixed(2)),
    total: parseFloat(cart.getTotal().toFixed(2)),
    promo_code: cart.getPromoCode(),
    item_count: cart.getItems().reduce((sum, i) => sum + i.quantity, 0)
  });
};

exports.clearCart = (req, res) => {
  const user_id = req.user.id;
  
  if (carts[user_id]) {
    carts[user_id].clear();
  }
  res.json({ success: true, message: "Cart cleared" });
};
