const { Product } = require("../dist/classes/Product");
const db = require("../db/dbConnection");

exports.getProducts = async (req, res) => {
  try {
    const result = await db.query("SELECT id, sku, name, category, price FROM products ORDER BY id");
    res.json({
      success: true,
      count: result.rows.length,
      products: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid product ID format" });
  }
  
  try {
    const result = await db.query("SELECT id, sku, name, category, price FROM products WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({
      success: true,
      product: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.addProduct = async (req, res) => {
  const { name, sku, price, category } = req.body;
  
  // Validate required fields
  if (!name || !sku || !price) {
    return res.status(400).json({ error: "Name, SKU, and price are required" });
  }
  
  // Validate price
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ error: "Price must be a non-negative number" });
  }

  try {
    const result = await db.query(
      "INSERT INTO products (name, sku, price, category) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, sku, parsedPrice, category || null]
    );

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    // Handle unique constraint violations
    if (err.code === '23505') {
      return res.status(409).json({ error: "A product with this SKU already exists" });
    }
    res.status(400).json({ error: err.message || "Failed to add product" });
  }
};

exports.updateProduct = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, sku, price, category } = req.body;
  
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid product ID format" });
  }
  
  if (!name || !sku || price === undefined) {
    return res.status(400).json({ error: "Name, SKU, and price are required" });
  }
  
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ error: "Price must be a non-negative number" });
  }

  try {
    const result = await db.query(
      "UPDATE products SET name=$1, sku=$2, price=$3, category=$4 WHERE id=$5 RETURNING *",
      [name, sku, parsedPrice, category || null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({
      success: true,
      message: "Product updated successfully",
      product: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: "A product with this SKU already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid product ID format" });
  }
  
  try {
    const result = await db.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (err) {
    console.error(err);
    // Handle foreign key constraint violations
    if (err.code === '23503') {
      return res.status(400).json({ error: "Cannot delete product: it is referenced in existing receipts" });
    }
    res.status(500).json({ error: err.message });
  }
};
