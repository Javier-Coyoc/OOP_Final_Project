
/*Users table to store user information, including username, 
password hash, role, full name, email, and active status.*/
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20),
    full_name VARCHAR(100),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

/*Products table to store product details, including SKU, name, category, and price.*/

CREATE TABLE products (
    id SERIAL PRIMARY KEY, 
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL
);

/*Receipts table to store transaction details, including timestamps, promotional codes, 
tax rates, and discount percentages for each purchase.*/
CREATE TABLE receipts (
    id SERIAL PRIMARY KEY, -- From Receipt::id
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- From Receipt::timestamp
    promo_code VARCHAR(20), -- From Cart::promo_code
    tax_rate DECIMAL(5, 4), -- From Cart::tax_rate
    discount_percent DECIMAL(5, 4) -- From Cart::discount_percent
);



