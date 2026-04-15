const { Pool } = require('pg');

const pool = new Pool({
    host:     'localhost',
    port:     5432,
    database: 'receipt',
    user:     'postgres',
    password: 'password'
});

module.exports = pool;