const { Receipt }     = require("../dist/classes/Receipt");
const { CashPayment } = require("../dist/classes/CashPayment");
const { CardPayment } = require("../dist/classes/CardPayment");
const { Cart }        = require("../dist/classes/Cart");
const { Product }     = require("../dist/classes/Product");
const db = require("../db/dbConnection");

exports.createReceipt = async (req, res) => {
  // Use authenticated user's ID from middleware instead of request body
  const user_id = req.user.id;
  const { items, promo_code, tax_rate, discount_percent, payment_type, cash_tendered, card_last4, card_type, total_amount } = req.body;

  // Validate required fields
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items array is required and cannot be empty" });
  }
  if (!payment_type || !["cash", "card"].includes(payment_type)) {
    return res.status(400).json({ error: "Valid payment_type is required (cash or card)" });
  }
  if (!total_amount || isNaN(total_amount) || total_amount <= 0) {
    return res.status(400).json({ error: "Valid total_amount is required" });
  }

  try {
    let payment;
    if (payment_type === "cash") {
      if (!cash_tendered || isNaN(cash_tendered) || cash_tendered < total_amount) {
        return res.status(400).json({ error: "cash_tendered must be >= total_amount for cash payments" });
      }
      payment = new CashPayment(parseFloat(cash_tendered));
      payment.calculateChange(parseFloat(total_amount));
    } else {
      if (!card_last4 || !card_type) {
        return res.status(400).json({ error: "card_last4 and card_type are required for card payments" });
      }
      payment = new CardPayment(parseFloat(total_amount), card_last4, card_type);
    }

    payment.processPayment();

    const receiptResult = await db.query(
      `INSERT INTO receipts (user_id, promo_code, tax_rate, discount_percent)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, promo_code || null, tax_rate || 0.07, discount_percent || 0]
    );

    const receipt = receiptResult.rows[0];

    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.price_at_purchase) {
        await db.query('DELETE FROM receipts WHERE id = $1', [receipt.id]);
        return res.status(400).json({ error: "Each item must have product_id, quantity, and price_at_purchase" });
      }
      await db.query(
        `INSERT INTO receipt_items (receipt_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [receipt.id, item.product_id, item.quantity, parseFloat(item.price_at_purchase)]
      );
    }

    // Insert payment record
    if (payment_type === "cash") {
      await db.query(
        `INSERT INTO payments (receipt_id, amount, type, change_due)
         VALUES ($1, $2, 'CASH', $3)`,
        [receipt.id, parseFloat(total_amount), parseFloat(payment.change_due)]
      );
    } else {
      await db.query(
        `INSERT INTO payments (receipt_id, amount, type, card_last4, card_type)
         VALUES ($1, $2, 'CARD', $3, $4)`,
        [receipt.id, parseFloat(total_amount), card_last4, card_type]
      );
    }

    res.status(201).json({
      success: true,
      message: "Receipt saved successfully",
      receipt
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Failed to create receipt" });
  }
};

exports.getReceipts = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, u.full_name AS user_name
       FROM receipts r
       LEFT JOIN users u ON r.user_id = u.id
       ORDER BY r.timestamp DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getReceiptById = async (req, res) => {
  try {
    const receiptResult = await db.query(
      `SELECT r.*, u.full_name AS user_name
       FROM receipts r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [req.params.id]
    );

    if (receiptResult.rows.length === 0)
      return res.status(404).json({ error: "Receipt not found" });

    const itemsResult = await db.query(
      `SELECT ri.*, p.name AS product_name, p.sku
       FROM receipt_items ri
       LEFT JOIN products p ON ri.product_id = p.id
       WHERE ri.receipt_id = $1`,
      [req.params.id]
    );

    const paymentResult = await db.query(
      `SELECT * FROM payments WHERE receipt_id = $1`,
      [req.params.id]
    );

    res.json({
      receipt: receiptResult.rows[0],
      items: itemsResult.rows,
      payment: paymentResult.rows[0] || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
