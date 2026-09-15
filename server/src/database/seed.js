const bcrypt = require('bcryptjs');
const db = require('../config/database');
const setupDatabase = require('./setup');

function seedDatabase() {
  console.log('Seeding AGRISHOP database...');
  setupDatabase();

  // Clear existing data safely
  db.exec(`
    DELETE FROM reviews;
    DELETE FROM notifications;
    DELETE FROM deliveries;
    DELETE FROM payments;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM inventories;
    DELETE FROM products;
    DELETE FROM categories;
    DELETE FROM farmer_profiles;
    DELETE FROM users;
  `);

  const saltRounds = 10;
  const adminHash = bcrypt.hashSync('Admin@12345', saltRounds);
  const farmerHash = bcrypt.hashSync('Farmer@12345', saltRounds);
  const buyerHash = bcrypt.hashSync('Buyer@12345', saltRounds);
  const deliveryHash = bcrypt.hashSync('Delivery@12345', saltRounds);

  // 1. SEED USERS
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, phone, address, city, avatar_url, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const adminId = Number(insertUser.run(
    'Marcelle Nguena (Platform Admin)',
    'admin@agrishop.cm',
    adminHash,
    'ADMINISTRATOR',
    '+237 670 000 001',
    'IAI Cameroon Campus, Boulevard du 20 Mai',
    'Yaounde',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  ).lastInsertRowid);

  const farmer1Id = Number(insertUser.run(
    'Tanyi Emmanuel (Buea Agro-Farms)',
    'farmer.buea@agrishop.cm',
    farmerHash,
    'FARMER',
    '+237 675 111 222',
    'Molyko Farm Road 4',
    'Buea',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  ).lastInsertRowid);

  const farmer2Id = Number(insertUser.run(
    'Ahmadou Bello (Foumbot Organics)',
    'farmer.foumbot@agrishop.cm',
    farmerHash,
    'FARMER',
    '+237 699 333 444',
    'Route Agricole de Kouoptamo',
    'Foumbot',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
  ).lastInsertRowid);

  const farmerPendingId = Number(insertUser.run(
    'Chantal Mballa (Bafut Highlands Agro)',
    'farmer.new@agrishop.cm',
    farmerHash,
    'FARMER',
    '+237 677 888 999',
    'Mile 10 Bafut',
    'Bamenda',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
  ).lastInsertRowid);

  const buyer1Id = Number(insertUser.run(
    'Dr. Kevin Fongang',
    'buyer.douala@agrishop.cm',
    buyerHash,
    'SELLER_BUYER',
    '+237 671 234 567',
    'Rue des Palmiers, Akwa',
    'Douala',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80'
  ).lastInsertRowid);

  const buyer2Id = Number(insertUser.run(
    'Sandrine Ekani',
    'buyer.yaounde@agrishop.cm',
    buyerHash,
    'USER',
    '+237 690 987 654',
    'Avenue des Banques, Bastos',
    'Yaounde',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
  ).lastInsertRowid);

  const deliveryId = Number(insertUser.run(
    'Express Agro-Logistics Ltd',
    'delivery.express@agrishop.cm',
    deliveryHash,
    'DELIVERY_SERVICE',
    '+237 655 444 333',
    'Hub Central Fret, Bonaberi',
    'Douala',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'
  ).lastInsertRowid);

  // 2. SEED FARMER PROFILES
  const insertFarmerProfile = db.prepare(`
    INSERT INTO farmer_profiles (user_id, farm_name, farm_location, farm_size, national_id, specialization, status, admin_notes, reviewed_by, reviewed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertFarmerProfile.run(
    farmer1Id,
    'Buea Organic Green Farms',
    'Buea, South West Region',
    '15 Hectares',
    'ID-CM-SW-2021-9874',
    'Tubers, Plantains, and Penja Spices',
    'Approved',
    'Valid agriculture cooperative license verified.',
    adminId,
    new Date().toISOString()
  );

  insertFarmerProfile.run(
    farmer2Id,
    'Foumbot Vegetable Syndicate',
    'Foumbot, West Region',
    '25 Hectares',
    'ID-CM-W-2020-4412',
    'Fresh Tomatoes, Sweet Peppers, Cabbage, Onions',
    'Approved',
    'Verified West Region regional vegetable supplier.',
    adminId,
    new Date().toISOString()
  );

  insertFarmerProfile.run(
    farmerPendingId,
    'Bafut Highlands Agro Cooperative',
    'Bamenda / Bafut, North West Region',
    '10 Hectares',
    'ID-CM-NW-2024-1188',
    'Organic Irish Potatoes, Maize and Beans',
    'Pending',
    'Pending verification of land registry documentation by administrator.',
    null,
    null
  );

  // 3. SEED CATEGORIES
  const insertCategory = db.prepare(`
    INSERT INTO categories (name, slug, description, image_url)
    VALUES (?, ?, ?, ?)
  `);

  const categoriesData = [
    { name: 'Fruits', slug: 'fruits', description: 'Fresh tropical fruits directly harvested from orchards', image_url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80' },
    { name: 'Vegetables', slug: 'vegetables', description: 'Fresh, organic and greenhouse-grown garden vegetables', image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80' },
    { name: 'Tubers & Roots', slug: 'tubers', description: 'Cassava, white yams, sweet potatoes and cocoyams', image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80' },
    { name: 'Grains & Cereals', slug: 'grains', description: 'Dry maize, Ndop paddy rice, sorghum and millet', image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80' },
    { name: 'Legumes & Seeds', slug: 'legumes', description: 'High-protein black beans, red beans, groundnuts and soya', image_url: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80' },
    { name: 'Poultry & Livestock', slug: 'poultry-livestock', description: 'Farm-raised poultry, organic eggs, fresh dairy and meat', image_url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80' },
    { name: 'Processed Agri-Products', slug: 'processed', description: 'Pure palm oil, Buea garri, cocoa powder and ground spices', image_url: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=600&q=80' }
  ];

  const catMap = {};
  for (const c of categoriesData) {
    const res = insertCategory.run(c.name, c.slug, c.description, c.image_url);
    catMap[c.slug] = Number(res.lastInsertRowid);
  }

  // 4. SEED PRODUCTS & INVENTORIES
  const insertProduct = db.prepare(`
    INSERT INTO products (farmer_id, category_id, name, slug, description, price, unit, image_url, location, is_available, is_approved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
  `);

  const insertInventory = db.prepare(`
    INSERT INTO inventories (product_id, quantity, reserved_quantity, low_stock_threshold)
    VALUES (?, ?, ?, ?)
  `);

  const productsData = [
    {
      farmerId: farmer2Id,
      categorySlug: 'vegetables',
      name: 'Fresh Foumbot Vine Tomatoes (Crate 25kg)',
      slug: 'foumbot-vine-tomatoes-crate',
      description: 'Hand-picked, firm, ripe red vine tomatoes cultivated in the fertile volcanic soil of Foumbot.',
      price: 14500,
      unit: 'crate (25kg)',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      location: 'Foumbot, West Region',
      stock: 45,
      threshold: 10
    },
    {
      farmerId: farmer1Id,
      categorySlug: 'fruits',
      name: 'Sweet Penja Giant Plantains (Bunch)',
      slug: 'penja-giant-plantains-bunch',
      description: 'First-grade, naturally ripened sweet plantains directly harvested from Buea / Penja volcanic foot slopes.',
      price: 4500,
      unit: 'bunch (~18kg)',
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
      location: 'Buea, South West',
      stock: 8, // Demonstrating LOW STOCK ALERT
      threshold: 10
    },
    {
      farmerId: farmer1Id,
      categorySlug: 'processed',
      name: 'Authentic Penja White Pepper (1kg Pouch)',
      slug: 'penja-white-pepper-1kg',
      description: 'World-renowned Protected Geographical Indication (PGI) Penja white pepper with intense spicy floral notes.',
      price: 18000,
      unit: 'kg',
      imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80',
      location: 'Penja / Buea Corridor',
      stock: 65,
      threshold: 15
    },
    {
      farmerId: farmer2Id,
      categorySlug: 'vegetables',
      name: 'Crisp Green Bell Peppers (Bag 10kg)',
      slug: 'crisp-green-bell-peppers-bag',
      description: 'Crisp, aromatic thick-fleshed green bell peppers suitable for wholesale catering and supermarkets.',
      price: 8500,
      unit: 'bag (10kg)',
      imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
      location: 'Foumbot, West Region',
      stock: 20,
      threshold: 5
    },
    {
      farmerId: farmer1Id,
      categorySlug: 'tubers',
      name: 'Select Ndonga White Yams (Tubers - Bundle of 5)',
      slug: 'ndonga-white-yams-bundle',
      description: 'Premium dry white yams, highly starchy and perfect for boiled yam, pounded yam, or traditional dishes.',
      price: 12000,
      unit: 'bundle (5 tubers)',
      imageUrl: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=600&q=80',
      location: 'Buea, South West',
      stock: 30,
      threshold: 8
    },
    {
      farmerId: farmer2Id,
      categorySlug: 'grains',
      name: 'Ndop Valley Premium Rice (Bag 50kg)',
      slug: 'ndop-valley-premium-rice-50kg',
      description: 'Naturally fragrant, long-grain parboiled white rice cultivated in the irrigated alluvial plains of Ndop.',
      price: 28000,
      unit: 'bag (50kg)',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      location: 'Ndop, North West',
      stock: 50,
      threshold: 10
    },
    {
      farmerId: farmer1Id,
      categorySlug: 'processed',
      name: 'Pure Village Red Palm Oil (20-Liter Can)',
      slug: 'pure-village-red-palm-oil-20l',
      description: 'Unadulterated, cholesterol-free virgin red palm oil processed from fresh oil palm nuts in Muyuka.',
      price: 19500,
      unit: 'bidon (20L)',
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
      location: 'Muyuka / Buea',
      stock: 35,
      threshold: 5
    },
    {
      farmerId: farmer2Id,
      categorySlug: 'poultry-livestock',
      name: 'Free-Range Brown Farm Eggs (Crate of 30)',
      slug: 'free-range-brown-farm-eggs-crate',
      description: 'High-protein, grain-fed farm fresh eggs collected daily from bio-secure laying coops.',
      price: 2600,
      unit: 'crate (30 eggs)',
      imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80',
      location: 'Bafoussam / Foumbot',
      stock: 120,
      threshold: 20
    },
    {
      farmerId: farmer1Id,
      categorySlug: 'fruits',
      name: 'Njombe Export-Quality Bananas (Carton 15kg)',
      slug: 'njombe-export-bananas-carton',
      description: 'Sweet, spotless Cavendish dessert bananas carefully packed in export-grade cartons.',
      price: 6000,
      unit: 'carton (15kg)',
      imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80',
      location: 'Njombe / Littoral',
      stock: 4, // Demonstrating LOW STOCK ALERT
      threshold: 10
    },
    {
      farmerId: farmer2Id,
      categorySlug: 'legumes',
      name: 'Selected Foumban Red Beans (Bag 25kg)',
      slug: 'foumban-red-beans-bag',
      description: 'Cleaned, weevil-free dry red kidney beans rich in plant protein and dietary fibre.',
      price: 22000,
      unit: 'bag (25kg)',
      imageUrl: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=600&q=80',
      location: 'Foumban / West',
      stock: 18,
      threshold: 5
    }
  ];

  const productIds = [];
  for (const p of productsData) {
    const catId = catMap[p.categorySlug];
    const res = insertProduct.run(
      p.farmerId,
      catId,
      p.name,
      p.slug,
      p.description,
      p.price,
      p.unit,
      p.imageUrl,
      p.location
    );
    const prodId = Number(res.lastInsertRowid);
    productIds.push(prodId);
    insertInventory.run(prodId, p.stock, 0, p.threshold);
  }

  // 5. SEED ORDERS, ORDER ITEMS, PAYMENTS, DELIVERIES
  const insertOrder = db.prepare(`
    INSERT INTO orders (order_number, buyer_id, total_amount, delivery_address, delivery_city, delivery_phone, notes, status, payment_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, farmer_id, quantity, unit_price, subtotal)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertPayment = db.prepare(`
    INSERT INTO payments (order_id, user_id, amount, payment_method, transaction_ref, status, details, payment_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDelivery = db.prepare(`
    INSERT INTO deliveries (order_id, delivery_service_id, tracking_code, pickup_address, delivery_address, recipient_name, recipient_phone, status, notes, assigned_at, picked_up_at, delivered_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Order 1: Pending order (Demonstrates Farmer receiving and accepting/rejecting)
  const order1Id = Number(insertOrder.run(
    'ORD-2026-00101',
    buyer1Id,
    29000,
    'Rue des Palmiers 14, Akwa',
    'Douala',
    '+237 671 234 567',
    'Please handle tomatoes carefully.',
    'Pending',
    'Paid',
    new Date(Date.now() - 3600 * 1000 * 4).toISOString()
  ).lastInsertRowid);

  insertOrderItem.run(order1Id, productIds[0], farmer2Id, 2, 14500, 29000);
  insertPayment.run(order1Id, buyer1Id, 29000, 'MTN_MOMO', 'TXN-MOMO-99281741', 'Successful', 'MTN Mobile Money Reference CI-88273', new Date().toISOString());

  // Order 2: Ready for Delivery (Demonstrates Delivery Service viewing request and accepting)
  const order2Id = Number(insertOrder.run(
    'ORD-2026-00102',
    buyer2Id,
    36000,
    'Avenue des Banques, Villa 45, Bastos',
    'Yaounde',
    '+237 690 987 654',
    'Call upon arrival at the gate.',
    'Ready for delivery',
    'Paid',
    new Date(Date.now() - 3600 * 1000 * 24).toISOString()
  ).lastInsertRowid);

  insertOrderItem.run(order2Id, productIds[2], farmer1Id, 2, 18000, 36000);
  insertPayment.run(order2Id, buyer2Id, 36000, 'ORANGE_MONEY', 'TXN-OM-11234981', 'Successful', 'Orange Money Cameroon CashIn Reference OM-44109', new Date().toISOString());
  insertDelivery.run(
    order2Id,
    deliveryId,
    'TRK-AGRI-7701',
    'Buea Organic Green Farms, Molyko Farm Road 4, Buea',
    'Avenue des Banques, Villa 45, Bastos, Yaounde',
    'Sandrine Ekani',
    '+237 690 987 654',
    'Assigned',
    'Delivery assigned to logistics van #4.',
    new Date().toISOString(),
    null,
    null,
    new Date().toISOString()
  );

  // Order 3: Delivered (Demonstrates Order History and Completed Delivery)
  const order3Id = Number(insertOrder.run(
    'ORD-2026-00085',
    buyer1Id,
    34000,
    'Rue des Palmiers 14, Akwa',
    'Douala',
    '+237 671 234 567',
    'Delivered successfully to reception.',
    'Delivered',
    'Paid',
    new Date(Date.now() - 3600 * 1000 * 72).toISOString()
  ).lastInsertRowid);

  insertOrderItem.run(order3Id, productIds[5], farmer2Id, 1, 28000, 28000);
  insertOrderItem.run(order3Id, productIds[8], farmer1Id, 1, 6000, 6000);
  insertPayment.run(order3Id, buyer1Id, 34000, 'CREDIT_CARD', 'TXN-CARD-44810239', 'Successful', 'Visa Card ending in 4242', new Date(Date.now() - 3600 * 1000 * 72).toISOString());
  insertDelivery.run(
    order3Id,
    deliveryId,
    'TRK-AGRI-6642',
    'Foumbot West Region Warehouse Hub',
    'Rue des Palmiers 14, Akwa, Douala',
    'Dr. Kevin Fongang',
    '+237 671 234 567',
    'Delivered',
    'Signed and received by customer at front desk.',
    new Date(Date.now() - 3600 * 1000 * 70).toISOString(),
    new Date(Date.now() - 3600 * 1000 * 65).toISOString(),
    new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    new Date(Date.now() - 3600 * 1000 * 72).toISOString()
  );

  // 6. SEED NOTIFICATIONS
  const insertNotification = db.prepare(`
    INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotification.run(
    adminId,
    'New Farmer Validation Request',
    'Bafut Highlands Agro has submitted their certification for platform verification.',
    'farmer',
    '/admin/farmers/validate',
    0,
    new Date().toISOString()
  );

  insertNotification.run(
    farmer1Id,
    'Low Stock Warning',
    'Sweet Penja Giant Plantains has only 8 bunches left (below threshold of 10). Restock recommended.',
    'warning',
    '/farmer/inventory',
    0,
    new Date().toISOString()
  );

  insertNotification.run(
    farmer2Id,
    'New Order Received',
    'Order #ORD-2026-00101 for 2 crates of Vine Tomatoes has been placed.',
    'order',
    '/farmer/orders',
    0,
    new Date().toISOString()
  );

  insertNotification.run(
    deliveryId,
    'Delivery Ready for Dispatch',
    'Order #ORD-2026-00102 from Buea Organic Farms is packaged and ready for pickup.',
    'delivery',
    '/delivery/requests',
    0,
    new Date().toISOString()
  );

  insertNotification.run(
    buyer1Id,
    'Order Delivered',
    'Your Order #ORD-2026-00085 has been safely delivered to Akwa, Douala.',
    'success',
    '/buyer/orders',
    1,
    new Date(Date.now() - 3600 * 1000 * 48).toISOString()
  );

  // 7. SEED REVIEWS
  const insertReview = db.prepare(`
    INSERT INTO reviews (product_id, user_id, rating, comment, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertReview.run(productIds[0], buyer1Id, 5, 'Exceptional quality tomatoes! Firm, fresh, and lasted long in my restaurant kitchen.', new Date().toISOString());
  insertReview.run(productIds[2], buyer2Id, 5, 'Authentic Penja pepper. The aroma is unbeatable. Fast logistics too!', new Date().toISOString());

  console.log('Database seeded successfully with rich agricultural data and test accounts!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
