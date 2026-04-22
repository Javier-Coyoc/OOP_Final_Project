const { Pool } = require("pg");

const pool = new Pool({
  user:     "postgres",
  host:     "localhost",
  database: "receipt",
  password: "December20@",
  port:     5432
});

module.exports = pool;
