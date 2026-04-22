-- Run this entire file in pgAdmin Query Tool to set up all tables

CREATE TABLE IF NOT EXISTS users (
    id        SERIAL PRIMARY KEY,
    username  VARCHAR(50)  UNIQUE NOT NULL,
    password  VARCHAR(100) NOT NULL,
    role      VARCHAR(20)  NOT NULL DEFAULT 'cashier',
    full_name VARCHAR(100),
    email     VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS products (
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(100)  NOT NULL,
    sku      VARCHAR(50)   UNIQUE NOT NULL,
    price    DECIMAL(10,2) NOT NULL,
    category VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS receipts (
    id           SERIAL PRIMARY KEY,
    cashier_id   INTEGER REFERENCES users(id),
    subtotal     DECIMAL(10,2),
    discount     DECIMAL(10,2),
    tax          DECIMAL(10,2),
    total        DECIMAL(10,2),
    promo_code   VARCHAR(50),
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS receipt_items (
    id         SERIAL PRIMARY KEY,
    receipt_id INTEGER REFERENCES receipts(id),
    product_id INTEGER REFERENCES products(id),
    quantity   INTEGER,
    unit_price DECIMAL(10,2)
);

-- Seed test users
INSERT INTO users (username, password, role, full_name, email) VALUES
  ('admin_user',   'admin123',   'Admin',   'Admin User',    'admin@store.com'),
  ('cashier_01',   'john123',    'Cashier', 'John Smith',    'john@store.com'),
  ('sarah',        'sarah123',   'Cashier', 'Sarah Johnson', 'sarah@store.com'),
  ('manager_ken',  'manager123', 'Manager', 'Store Manager', 'manager@store.com')
ON CONFLICT (username) DO NOTHING;

-- Seed test products
INSERT INTO products (name, sku, price, category) VALUES
  ('Coca Cola 500ml', 'BEV-001', 2.50, 'Beverage'),
  ('Pepsi 500ml',     'BEV-002', 2.50, 'Beverage'),
  ('Lays Chips',      'SNK-001', 1.75, 'Snack'),
  ('Bread Loaf',      'FOOD-001', 4.00, 'Food'),
  ('Coffee',          'BEV-003', 3.50, 'Beverage'),
  ('Croissant',       'FOOD-002', 2.75, 'Food')
ON CONFLICT (sku) DO NOTHING;
