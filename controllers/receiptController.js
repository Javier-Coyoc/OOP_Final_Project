const { Receipt }     = require("../dist/classes/Receipt");
const { CashPayment } = require("../dist/classes/CashPayment");
const { CardPayment } = require("../dist/classes/CardPayment");
const { Cart }        = require("../dist/classes/Cart");
const { Product }     = require("../dist/classes/Product");
const db = require("../db/dbConnection");

exports.createReceipt = async (req, res) => {
  const { cashier_id, items, subtotal, discount, tax, total, promo_code, payment_type, cash_tendered, card_last4, card_type } = req.body;

  try {
    // Build payment object from dist classes
    let payment;
    if (payment_type === "cash") {
      payment = new CashPayment(parseFloat(cash_tendered));
      payment.calculateChange(parseFloat(total));
    } else {
      payment = new CardPayment(parseFloat(total), card_last4, card_type);
    }

    payment.processPayment();

    // Save receipt to DB
    const receiptResult = await db.query(
      `INSERT INTO receipts (cashier_id, subtotal, discount, tax, total, promo_code)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [cashier_id, subtotal, discount, tax, total, promo_code]
    );

    const receipt = receiptResult.rows[0];

    // Save receipt items
    for (const item of items) {
      await db.query(
        `INSERT INTO receipt_items (receipt_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [receipt.id, item.product.id, item.quantity, item.product.price]
      );
    }

    res.status(201).json({ message: "Receipt saved successfully", receipt });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Failed to create receipt" });
  }
};

exports.getReceipts = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, u.full_name AS cashier_name
       FROM receipts r
       LEFT JOIN users u ON r.cashier_id = u.id
       ORDER BY r.created_at DESC`
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
      `SELECT r.*, u.full_name AS cashier_name
       FROM receipts r
       LEFT JOIN users u ON r.cashier_id = u.id
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

    res.json({ receipt: receiptResult.rows[0], items: itemsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
