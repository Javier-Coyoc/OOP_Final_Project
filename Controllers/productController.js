const pool = require('../db/dbController');

// example — get all products
const getProducts = async (req, res) => {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
};