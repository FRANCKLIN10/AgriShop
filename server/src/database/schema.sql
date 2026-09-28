-- ==========================================================
-- AGRISHOP Relational Database Schema
-- AGRISHOP Platform Database Schema
-- Normalized relational architecture with foreign keys and constraints
-- ==========================================================

PRAGMA foreign_keys = ON;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('USER', 'CUSTOMER', 'SELLER_BUYER', 'FARMER', 'DELIVERY_SERVICE', 'ADMINISTRATOR')),
    phone TEXT,
    address TEXT,
    city TEXT,
    avatar_url TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. FARMER PROFILES TABLE (1:1 with USERS having role FARMER)
CREATE TABLE IF NOT EXISTS farmer_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    farm_name TEXT NOT NULL,
    farm_location TEXT NOT NULL,
    farm_size TEXT,
    national_id TEXT,
    specialization TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected', 'Suspended')),
    admin_notes TEXT,
    reviewed_by INTEGER,
    reviewed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    price REAL NOT NULL CHECK(price >= 0),
    unit TEXT NOT NULL DEFAULT 'kg',
    image_url TEXT,
    location TEXT NOT NULL,
    is_available INTEGER NOT NULL DEFAULT 1,
    is_approved INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- 5. INVENTORIES TABLE (1:1 with PRODUCTS)
CREATE TABLE IF NOT EXISTS inventories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL UNIQUE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0),
    reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK(reserved_quantity >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 10,
    last_restocked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    buyer_id INTEGER NOT NULL,
    total_amount REAL NOT NULL CHECK(total_amount >= 0),
    delivery_address TEXT NOT NULL,
    delivery_city TEXT,
    delivery_phone TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN (
        'Pending', 'Accepted', 'Rejected', 'Processing', 
        'Ready for delivery', 'Out for delivery', 'Delivered', 'Cancelled'
    )),
    payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK(payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 7. ORDER ITEMS TABLE (1:N with ORDERS)
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    farmer_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_price REAL NOT NULL CHECK(unit_price >= 0),
    subtotal REAL NOT NULL CHECK(subtotal >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 8. PAYMENTS TABLE (1:1 with ORDERS)
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL CHECK(amount >= 0),
    payment_method TEXT NOT NULL CHECK(payment_method IN ('MTN_MOMO', 'ORANGE_MONEY', 'CREDIT_CARD', 'CASH_ON_DELIVERY', 'BANK_TRANSFER')),
    transaction_ref TEXT NOT NULL UNIQUE,
    payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Successful', 'Failed', 'Refunded')),
    details TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 9. DELIVERIES TABLE (1:1 with ORDERS)
CREATE TABLE IF NOT EXISTS deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL UNIQUE,
    delivery_service_id INTEGER,
    tracking_code TEXT NOT NULL UNIQUE,
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN (
        'Pending', 'Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Failed', 'Cancelled'
    )),
    notes TEXT,
    assigned_at DATETIME,
    picked_up_at DATETIME,
    delivered_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_service_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK(type IN ('info', 'success', 'warning', 'order', 'payment', 'delivery', 'farmer')),
    link TEXT,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- INDEXES FOR PERFORMANCE AND FAST SEARCH
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_farmer_status ON farmer_profiles(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_farmer ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_location ON products(location);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_farmer ON order_items(farmer_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_service ON deliveries(delivery_service_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
