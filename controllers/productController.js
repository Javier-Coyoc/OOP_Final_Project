const { Product } = require("../dist/classes/Product");
const db = require("../db/dbConnection");

exports.getProducts = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM products ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.addProduct = async (req, res) => {
  const { name, sku, price, category } = req.body;
  try {
    const prod = new Product(null, name, sku, parseFloat(price), category);

    const result = await db.query(
      "INSERT INTO products (name, sku, price, category) VALUES ($1, $2, $3, $4) RETURNING *",
      [prod.getName(), prod.getSku(), prod.getPrice(), prod.getCategory()]
    );

    res.status(201).json({ message: "Product added successfully", product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Failed to add product" });
  }
};

exports.updateProduct = async (req, res) => {
  const { name, sku, price, category } = req.body;
  try {
    const result = await db.query(
      "UPDATE products SET name=$1, sku=$2, price=$3, category=$4 WHERE id=$5 RETURNING *",
      [name, sku, price, category, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await db.query("DELETE FROM products WHERE id = $1", [req.params.id]);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
