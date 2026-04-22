const { Pool } = require("pg");

const pool = new Pool({
  user:     "postgres",
  host:     "localhost",
  database: "receipt",
  password: "December20@",
  port:     5432
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
  } else {
    console.log('✅ Connected to "receipt" database');
    release();
  }
});

module.exports = pool;