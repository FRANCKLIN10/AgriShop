process.env.NODE_ENV = 'test';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');
const seedDatabase = require('../src/database/seed');

let server;
let baseUrl;

function request(method, path, { headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(url, options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(rawData);
        } catch {
          json = rawData;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

describe('AGRISHOP Complete API Test Suite', () => {
  let adminToken = '';
  let farmerToken = '';
  let buyerToken = '';
  let deliveryToken = '';
  let sampleCategoryId = null;
  let createdProductId = null;
  let createdOrderId = null;
  let createdDeliveryId = null;

  before(async () => {
    // Seed fresh test database
    seedDatabase();

    // Start server on dynamic port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(() => {
    if (server) {
      server.close();
    }
  });

  // 1. HEALTH CHECK
  test('GET /api/health should return 200 OK with platform details', async () => {
    const res = await request('GET', '/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'OK');
    assert.equal(res.body.institution, 'AGRISHOP');
  });

  // 2. AUTHENTICATION & REGISTRATION
  test('POST /api/auth/register should register a new buyer', async () => {
    const res = await request('POST', '/api/auth/register', {
      body: {
        name: 'Test Buyer User',
        email: 'testbuyer@agrishop.cm',
        password: 'Password@123',
        role: 'USER',
        phone: '+237 670 123 456',
        city: 'Yaounde'
      }
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, 'testbuyer@agrishop.cm');
  });

  test('POST /api/auth/register should fail on duplicate email', async () => {
    const res = await request('POST', '/api/auth/register', {
      body: {
        name: 'Duplicate User',
        email: 'testbuyer@agrishop.cm',
        password: 'Password@123',
        role: 'USER'
      }
    });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
  });

  test('POST /api/auth/login should authenticate all 5 roles and issue tokens', async () => {
    // Admin login
    const adminRes = await request('POST', '/api/auth/login', {
      body: { email: 'admin@agrishop.cm', password: 'Admin@12345' }
    });
    assert.equal(adminRes.status, 200);
    assert.ok(adminRes.body.token);
    assert.equal(adminRes.body.user.role, 'ADMINISTRATOR');
    adminToken = adminRes.body.token;

    // Approved Farmer login
    const farmerRes = await request('POST', '/api/auth/login', {
      body: { email: 'farmer.buea@agrishop.cm', password: 'Farmer@12345' }
    });
    assert.equal(farmerRes.status, 200);
    assert.equal(farmerRes.body.user.role, 'FARMER');
    assert.equal(farmerRes.body.user.farmerStatus, 'Approved');
    farmerToken = farmerRes.body.token;

    // Buyer login
    const buyerRes = await request('POST', '/api/auth/login', {
      body: { email: 'buyer.douala@agrishop.cm', password: 'Buyer@12345' }
    });
    assert.equal(buyerRes.status, 200);
    buyerToken = buyerRes.body.token;

    // Delivery login
    const deliveryRes = await request('POST', '/api/auth/login', {
      body: { email: 'delivery.express@agrishop.cm', password: 'Delivery@12345' }
    });
    assert.equal(deliveryRes.status, 200);
    assert.equal(deliveryRes.body.user.role, 'DELIVERY_SERVICE');
    deliveryToken = deliveryRes.body.token;
  });

  test('POST /api/auth/login should reject invalid credentials', async () => {
    const res = await request('POST', '/api/auth/login', {
      body: { email: 'admin@agrishop.cm', password: 'WrongPassword' }
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  // 3. PROFILE MANAGEMENT
  test('GET /api/users/profile should retrieve authenticated user profile', async () => {
    const res = await request('GET', '/api/users/profile', {
      headers: { Authorization: `Bearer ${buyerToken}` }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, 'buyer.douala@agrishop.cm');
  });

  test('PUT /api/users/profile should update user profile', async () => {
    const res = await request('PUT', '/api/users/profile', {
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: {
        city: 'Limbe Seaside',
        phone: '+237 671 999 888'
      }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.city, 'Limbe Seaside');
  });

  // 4. BROWSE & SEARCH PRODUCTS
  test('GET /api/products should return agricultural products catalogue with pagination', async () => {
    const res = await request('GET', '/api/products?page=1&limit=6');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length > 0);
    assert.ok(res.body.pagination.total > 0);
  });

  test('GET /api/products/categories should list marketplace categories', async () => {
    const res = await request('GET', '/api/products/categories');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.categories));
    assert.ok(res.body.categories.length > 0);
    sampleCategoryId = res.body.categories[0].id;
  });

  test('GET /api/products should filter products by search query and category', async () => {
    const res = await request('GET', '/api/products?search=Tomatoes&category=vegetables');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length > 0);
    assert.match(res.body.data[0].name, /Tomatoes/i);
  });

  // 5. PRODUCT CREATION & INVENTORY
  test('POST /api/products should allow approved farmer to publish a new product', async () => {
    const res = await request('POST', '/api/products', {
      headers: { Authorization: `Bearer ${farmerToken}` },
      body: {
        name: 'Organic Buea Carrots',
        categoryId: sampleCategoryId,
        description: 'Crisp organic orange carrots harvested from rich volcanic soil.',
        price: 3500,
        unit: 'bag (5kg)',
        location: 'Buea, South West',
        quantity: 50,
        lowStockThreshold: 10
      }
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.product.id);
    assert.equal(res.body.product.stock_quantity, 50);
    createdProductId = res.body.product.id;
  });

  test('PUT /api/farmer/inventory/:productId should update stock quantity', async () => {
    const res = await request('PUT', `/api/farmer/inventory/${createdProductId}`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
      body: {
        quantity: 35,
        lowStockThreshold: 8
      }
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.inventory.quantity, 35);
  });

  // 6. ORDER PLACEMENT & INVENTORY DEDUCTION
  test('POST /api/orders should place an order and atomically reduce inventory', async () => {
    const initialInvRes = await request('GET', `/api/products/${createdProductId}`);
    const initialStock = initialInvRes.body.product.stock_quantity;

    const orderRes = await request('POST', '/api/orders', {
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: {
        items: [{ productId: createdProductId, quantity: 5 }],
        deliveryAddress: 'Boulevard de la Liberte, Akwa',
        deliveryCity: 'Douala',
        deliveryPhone: '+237 671 234 567',
        paymentMethod: 'MTN_MOMO'
      }
    });

    assert.equal(orderRes.status, 201);
    assert.equal(orderRes.body.success, true);
    assert.ok(orderRes.body.order.orderNumber);
    createdOrderId = orderRes.body.order.id;

    // Verify stock deduction
    const updatedInvRes = await request('GET', `/api/products/${createdProductId}`);
    assert.equal(updatedInvRes.body.product.stock_quantity, initialStock - 5);
  });

  test('POST /api/orders should prevent overselling when quantity exceeds available stock', async () => {
    const res = await request('POST', '/api/orders', {
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: {
        items: [{ productId: createdProductId, quantity: 99999 }], // Exceeds stock
        deliveryAddress: 'Douala',
        deliveryPhone: '+237 671 234 567'
      }
    });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /Insufficient inventory/i);
  });

  // 7. ORDER PROGRESSION & FARMER ACCEPTANCE
  test('PUT /api/orders/:id/status should allow farmer to accept and set ready for delivery', async () => {
    const res1 = await request('PUT', `/api/orders/${createdOrderId}/status`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
      body: { status: 'Accepted' }
    });
    assert.equal(res1.status, 200);
    assert.equal(res1.body.status, 'Accepted');

    const res2 = await request('PUT', `/api/orders/${createdOrderId}/status`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
      body: { status: 'Ready for delivery' }
    });
    assert.equal(res2.status, 200);
    assert.equal(res2.body.status, 'Ready for delivery');
  });

  // 8. DELIVERY WORKFLOW
  test('GET /api/deliveries/requests should display the new delivery request', async () => {
    const res = await request('GET', '/api/deliveries/requests', {
      headers: { Authorization: `Bearer ${deliveryToken}` }
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.requests));
    const target = res.body.requests.find(r => r.order_id === createdOrderId);
    assert.ok(target, 'Delivery request for new order should exist in pool');
    createdDeliveryId = target.id;
  });

  test('PUT /api/deliveries/:id/accept should assign the delivery to the courier', async () => {
    const res = await request('PUT', `/api/deliveries/${createdDeliveryId}/accept`, {
      headers: { Authorization: `Bearer ${deliveryToken}` }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'Assigned');
  });

  test('PUT /api/deliveries/:id/status should advance delivery to In Transit and Delivered', async () => {
    const transitRes = await request('PUT', `/api/deliveries/${createdDeliveryId}/status`, {
      headers: { Authorization: `Bearer ${deliveryToken}` },
      body: { status: 'In Transit' }
    });
    assert.equal(transitRes.status, 200);
    assert.equal(transitRes.body.status, 'In Transit');

    const deliveredRes = await request('PUT', `/api/deliveries/${createdDeliveryId}/status`, {
      headers: { Authorization: `Bearer ${deliveryToken}` },
      body: { status: 'Delivered' }
    });
    assert.equal(deliveredRes.status, 200);
    assert.equal(deliveredRes.body.status, 'Delivered');

    // Verify order is also marked Delivered
    const orderCheck = await request('GET', `/api/orders/${createdOrderId}`, {
      headers: { Authorization: `Bearer ${buyerToken}` }
    });
    assert.equal(orderCheck.body.order.status, 'Delivered');
  });

  // 9. FARMER VALIDATION BY ADMINISTRATOR
  test('GET /api/admin/farmers should retrieve pending farmer applications', async () => {
    const res = await request('GET', '/api/admin/farmers?status=Pending', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.farmers.length > 0);
  });

  test('PUT /api/admin/farmers/:id/validate should approve a pending farmer', async () => {
    const listRes = await request('GET', '/api/admin/farmers?status=Pending', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const pendingFarmer = listRes.body.farmers[0];

    const approveRes = await request('PUT', `/api/admin/farmers/${pendingFarmer.id}/validate`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        status: 'Approved',
        adminNotes: 'Field inspection and cooperative registration verified by Yaounde office.'
      }
    });
    assert.equal(approveRes.status, 200);
    assert.equal(approveRes.body.status, 'Approved');
  });

  // 10. ADMINISTRATOR DASHBOARD & TRANSACTION MONITORING
  test('GET /api/admin/dashboard-stats should calculate comprehensive platform KPIs', async () => {
    const res = await request('GET', '/api/admin/dashboard-stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.stats.totalUsers > 0);
    assert.ok(res.body.stats.totalProducts > 0);
    assert.ok(res.body.stats.totalRevenue > 0);
    assert.ok(Array.isArray(res.body.stats.categoryDistribution));
  });

  test('GET /api/admin/transactions should list financial transactions with search', async () => {
    const res = await request('GET', '/api/admin/transactions', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.transactions));
    assert.ok(res.body.totalVolume > 0);
  });

  // 11. NOTIFICATIONS
  test('GET /api/notifications should return user notification feed', async () => {
    const res = await request('GET', '/api/notifications', {
      headers: { Authorization: `Bearer ${buyerToken}` }
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.notifications));
  });
});
