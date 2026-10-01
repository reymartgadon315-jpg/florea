-- Floréa database for XAMPP / phpMyAdmin
-- Import this file in phpMyAdmin. The current prototype still uses localStorage;
-- this schema is ready for the PHP/API integration step.

CREATE DATABASE IF NOT EXISTS florea_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE florea_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','cashier','florist') NOT NULL DEFAULT 'cashier',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE customers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(40) NULL,
  email VARCHAR(160) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customers_name (full_name)
) ENGINE=InnoDB;

CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  emoji VARCHAR(20) NULL,
  image_url VARCHAR(500) NULL,
  stock_status ENUM('In Stock','Low Stock','Sold Out') NOT NULL DEFAULT 'In Stock',
  stock_quantity INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_products_category (category_id),
  INDEX idx_products_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE inventory (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL UNIQUE,
  quantity INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 5,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(30) NOT NULL UNIQUE,
  customer_id INT UNSIGNED NULL,
  customer_name VARCHAR(120) NOT NULL,
  table_number VARCHAR(20) NULL,
  notes VARCHAR(500) NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('new','preparing','ready','completed','cancelled') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_orders_status (status),
  INDEX idx_orders_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NULL,
  product_name VARCHAR(160) NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  line_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO users (full_name, email, password_hash, role) VALUES
('Floréa Admin', 'admin@florea.local', 'CHANGE_THIS_HASH', 'admin'),
('Floréa Cashier', 'cashier@florea.local', 'CHANGE_THIS_HASH', 'cashier');

INSERT INTO categories (name, sort_order) VALUES
('Flowers', 1),
('Bouquets', 2),
('Coffee', 3),
('Matcha', 4),
('Refreshers', 5),
('Rice Meals', 6),
('Cakes & Pastries', 7);

INSERT INTO products (category_id, name, description, price, emoji, stock_status, stock_quantity)
SELECT id, 'Ecuadorian Roses (6pc)', '', 390.00, '🌹', 'In Stock', 20 FROM categories WHERE name = 'Flowers';
INSERT INTO products (category_id, name, description, price, emoji, stock_status, stock_quantity)
SELECT id, 'Sunflower Stem', '', 120.00, '🌻', 'In Stock', 18 FROM categories WHERE name = 'Flowers';
INSERT INTO products (category_id, name, description, price, emoji, stock_status, stock_quantity)
SELECT id, 'Dutch Tulip (single)', '', 85.00, '🌷', 'Low Stock', 4 FROM categories WHERE name = 'Flowers';
INSERT INTO products (category_id, name, description, price, emoji, stock_status, stock_quantity)
SELECT id, 'Lavender Bunch', '', 140.00, '🪻', 'Sold Out', 0 FROM categories WHERE name = 'Flowers';
INSERT INTO products (category_id, name, description, price, emoji, stock_status, stock_quantity)
SELECT id, 'Sweetheart Peony Bouquet', '12 peonies, eucalyptus, baby''s breath', 980.00, '💐', 'In Stock', 12 FROM categories WHERE name = 'Bouquets';
INSERT INTO products (category_id, name, description, price, emoji, stock_status, stock_quantity)
SELECT id, 'Tulip Garden Box', 'Mixed Dutch tulips in a box', 450.00, '💐', 'In Stock', 10 FROM categories WHERE name = 'Bouquets';
INSERT INTO products (category_id, name, description, price, emoji, stock_status, stock_quantity)
SELECT id, 'Americano', 'Espresso + Water', 79.00, '☕', 'In Stock', 50 FROM categories WHERE name = 'Coffee';
INSERT INTO products (category_id, name, description, price, emoji, stock_status, stock_quantity)
SELECT id, 'Spanish Latte', 'Espresso + Milk + Condensed Milk', 129.00, '☕', 'In Stock', 50 FROM categories WHERE name = 'Coffee';
INSERT INTO products (category_id, name, description, price, emoji, stock_status, stock_quantity)
SELECT id, 'Dalgona Coffee', 'Whipped Foam Coffee + Milk + Sugar', 129.00, '☕', 'In Stock', 50 FROM categories WHERE name = 'Coffee';
INSERT INTO products (category_id, name, description, price, emoji, stock_status, stock_quantity)
SELECT id, 'Matcha Latte', '', 129.00, '🍵', 'In Stock', 35 FROM categories WHERE name = 'Matcha';
INSERT INTO products (category_id, name, description, price, emoji, stock_status, stock_quantity)
SELECT id, 'Mango Matcha', '', 149.00, '🍵', 'In Stock', 35 FROM categories WHERE name = 'Matcha';
INSERT INTO products (category_id, name, description, price, emoji, stock_status, stock_quantity)
SELECT id, 'Soda Refresher - Lemon', 'Medium 69 / Grande 79', 69.00, '🥤', 'In Stock', 30 FROM categories WHERE name = 'Refreshers';
INSERT INTO products (category_id, name, description, price, emoji, stock_status, stock_quantity)
SELECT id, 'Coke Float', '', 99.00, '🥤', 'In Stock', 25 FROM categories WHERE name = 'Refreshers';
INSERT INTO products (category_id, name, description, price, emoji, stock_status, stock_quantity)
SELECT id, 'Liempo Kare', 'Grilled pork liempo in kare sauce, rice', 179.00, '🍖', 'In Stock', 20 FROM categories WHERE name = 'Rice Meals';
INSERT INTO products (category_id, name, description, price, emoji, stock_status, stock_quantity)
SELECT id, 'Honey Butter Chicken', 'Honey butter glazed chicken bowl', 159.00, '🍗', 'In Stock', 20 FROM categories WHERE name = 'Rice Meals';
INSERT INTO products (category_id, name, description, price, emoji, stock_status, stock_quantity)
SELECT id, 'Lavender Basque Cake', 'Burnt Basque cheesecake, slice', 195.00, '🍰', 'In Stock', 15 FROM categories WHERE name = 'Cakes & Pastries';
INSERT INTO products (category_id, name, description, price, emoji, stock_status, stock_quantity)
SELECT id, 'Rose Vanilla Cupcake', '', 85.00, '🧁', 'In Stock', 18 FROM categories WHERE name = 'Cakes & Pastries';

INSERT INTO inventory (product_id, quantity, reorder_level)
SELECT id, stock_quantity, 5 FROM products;

-- Verify the import after running this file.
SELECT COUNT(*) AS category_count FROM categories;
SELECT COUNT(*) AS product_count FROM products;
