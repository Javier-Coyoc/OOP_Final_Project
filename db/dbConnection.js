const { Pool } = require("pg");

const pool = new Pool({
  user:     "postgres",
  host:     "localhost",
  database: "store_db",
  password: "password", // Change this to your PostgreSQL password
  port:     5432
});

module.exports = pool;
