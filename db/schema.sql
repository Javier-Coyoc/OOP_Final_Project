-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS receipt_items CASCADE;
DROP TABLE IF EXISTS receipts CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop ENUM type if it exists
DROP TYPE IF EXISTS payment_method;

-- Create ENUM type for payment method
CREATE TYPE payment_method AS ENUM ('CASH', 'CARD');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20),
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY, 
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL
);

-- Create receipts table (added user_id column)
CREATE TABLE receipts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    promo_code VARCHAR(20),
    tax_rate DECIMAL(5, 4),
    discount_percent DECIMAL(5, 4)
);

-- Create receipt_items table (junction table)
CREATE TABLE receipt_items (
    receipt_id INT REFERENCES receipts(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (receipt_id, product_id)
);

-- Create payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    receipt_id INT UNIQUE REFERENCES receipts(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    type payment_method NOT NULL,
    card_last4 CHAR(4), 
    card_type VARCHAR(20),
    change_due DECIMAL(10, 2),
    CONSTRAINT cash_payment_check CHECK (
        (type = 'CASH' AND card_last4 IS NULL AND card_type IS NULL) OR
        (type = 'CARD' AND change_due IS NULL)
    )
);

-- Insert sample data
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

-- Optional: Create useful indexes for performance
CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_timestamp ON receipts(timestamp);
CREATE INDEX idx_receipt_items_product_id ON receipt_items(product_id);
CREATE INDEX idx_payments_receipt_id ON payments(receipt_id);

-- Optional: Verify data was inserted correctly
SELECT 'Users count: ' || COUNT(*)::TEXT FROM users
UNION ALL
SELECT 'Products count: ' || COUNT(*)::TEXT FROM products
UNION ALL
SELECT 'Receipts count: ' || COUNT(*)::TEXT FROM receipts
UNION ALL
SELECT 'Receipt items count: ' || COUNT(*)::TEXT FROM receipt_items
UNION ALL
SELECT 'Payments count: ' || COUNT(*)::TEXT FROM payments;
