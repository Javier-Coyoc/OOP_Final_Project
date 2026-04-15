/*-------------------------------------------------------------------------------------------------------*/
-- Database Schema for OOP Final Project: POS System
-- This schema defines the structure of the database, including tables for users, products, 
-- receipts, receipt items, and payments.
-- It also includes sample data insertion for testing purposes.
/*-------------------------------------------------------------------------------------------------------*/


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
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    promo_code VARCHAR(20),
    tax_rate DECIMAL(5, 4),
    discount_percent DECIMAL(5, 4)
);

/*Receipt_items table to link products to receipts, capturing the quantity 
purchased and the price at the time of sale.*/

CREATE TABLE receipt_items (
    receipt_id INT REFERENCES receipts(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2),
    PRIMARY KEY (receipt_id, product_id)
);

/*Payments table to store payment details, including the amount, payment type, and
 specific fields for card and cash payments. The payment_method enum is used to 
 differentiate between payment types*/

CREATE TYPE payment_method AS ENUM ('CASH', 'CARD');

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    receipt_id INT UNIQUE REFERENCES receipts(id),
    amount DECIMAL(10, 2) NOT NULL,
    type payment_method NOT NULL,
    
    -- Card Specific Fields (CardPayment.h)
    card_last4 CHAR(4), 
    card_type VARCHAR(20),
    
    -- Cash Specific Fields (CashPayment.h)
    change_due DECIMAL(10, 2) 
);

INSERT INTO users (username, password_hash, role, full_name, email, is_active) VALUES
('admin_user', 'argon2_hash_1', 'Admin', 'Alice Johnson', 'alice@system.com', true),
('cashier_01', 'argon2_hash_2', 'Cashier', 'Bob Smith', 'bob@system.com', true),
('cashier_02', 'argon2_hash_3', 'Cashier', 'Charlie Davis', 'charlie@system.com', true),
('manager_ken', 'argon2_hash_4', 'Manager', 'Ken Thompson', 'ken@system.com', true),
('dev_tester', 'argon2_hash_5', 'Admin', 'Dana White', 'dana@system.com', false);

INSERT INTO products (sku, name, category, price) VALUES
('ELEC-001', 'Wireless Mouse', 'Electronics', 25.99),
('ELEC-002', 'Mechanical Keyboard', 'Electronics', 89.50),
('OFFC-010', 'Ergonomic Chair', 'Furniture', 199.00),
('OFFC-011', 'Standing Desk', 'Furniture', 350.00),
('SOFT-999', 'Antivirus License', 'Software', 49.99);

INSERT INTO receipts (user_id, promo_code, tax_rate, discount_percent) VALUES
(2, 'WELCOME10', 0.08, 0.10),
(2, NULL, 0.08, 0.00),
(3, 'SUMMER25', 0.05, 0.25),
(3, NULL, 0.08, 0.00),
(4, 'STAFF_DISC', 0.00, 0.50);

INSERT INTO receipt_items (receipt_id, product_id, quantity, price_at_purchase) VALUES
(1, 1, 2, 25.99),
(1, 2, 1, 89.50),
(2, 3, 1, 199.00),
(3, 5, 5, 49.99),
(4, 4, 1, 350.00);

INSERT INTO payments (receipt_id, amount, type, card_last4, card_type, change_due) VALUES
(1, 127.33, 'CARD', '4422', 'Visa', NULL),
(2, 214.92, 'CASH', NULL, NULL, 5.08),
(3, 196.84, 'CARD', '9012', 'Mastercard', NULL),
(4, 378.00, 'CASH', NULL, NULL, 22.00),
(5, 175.00, 'CARD', '1111', 'Amex', NULL);