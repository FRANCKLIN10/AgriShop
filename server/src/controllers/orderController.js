const db = require('../config/database');
const notificationService = require('../services/notificationService');

const orderController = {
  placeOrder(req, res, next) {
    try {
      const buyerId = req.user.id;
      const {
        items,
        deliveryAddress,
        deliveryCity = 'Yaounde',
        deliveryPhone,
        notes = '',
        paymentMethod = 'MTN_MOMO'
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Your cart is empty. Please add agricultural products before placing an order.'
        });
      }

      if (!deliveryAddress || !deliveryPhone) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both delivery address and recipient telephone number.'
        });
      }

      // 1. Verify availability and stock for all items
      let totalAmount = 0;
      const preparedItems = [];
      const affectedFarmerIds = new Set();
      let primaryFarmAddress = 'Cameroon Local Farm';

      for (const item of items) {
        const prodId = parseInt(item.productId, 10);
        const qty = parseInt(item.quantity, 10);

        if (!prodId || isNaN(qty) || qty <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Invalid product or quantity specified in order items.'
          });
        }

        const product = db.prepare(`
          SELECT p.*, i.quantity AS stock_quantity, fp.farm_location, fp.farm_name
          FROM products p
          JOIN inventories i ON p.id = i.product_id
          LEFT JOIN farmer_profiles fp ON p.farmer_id = fp.user_id
          WHERE p.id = ?
        `).get(prodId);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product with ID #${prodId} was not found.`
          });
        }

        if (product.is_available !== 1) {
          return res.status(400).json({
            success: false,
            message: `'${product.name}' is currently unavailable for order.`
          });
        }

        if (product.stock_quantity < qty) {
          return res.status(400).json({
            success: false,
            message: `Insufficient inventory for '${product.name}'. Available: ${product.stock_quantity} ${product.unit}, requested: ${qty} ${product.unit}.`
          });
        }

        const subtotal = product.price * qty;
        totalAmount += subtotal;
        affectedFarmerIds.add(product.farmer_id);
        if (product.farm_location) {
          primaryFarmAddress = `${product.farm_name || 'Farm'}, ${product.farm_location}`;
        }

        preparedItems.push({
          productId: product.id,
          farmerId: product.farmer_id,
          name: product.name,
          unit: product.unit,
          unitPrice: product.price,
          quantity: qty,
          subtotal,
          currentStock: product.stock_quantity
        });
      }

      // Generate Order Number
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      // Execute Order Creation Atomically
      const orderStatus = 'Pending';
      const isCardOrMoMo = ['MTN_MOMO', 'ORANGE_MONEY', 'CREDIT_CARD'].includes(paymentMethod);
      const initialPaymentStatus = isCardOrMoMo ? 'Paid' : 'Pending';

      const insertOrderStmt = db.prepare(`
        INSERT INTO orders (order_number, buyer_id, total_amount, delivery_address, delivery_city, delivery_phone, notes, status, payment_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      const orderInsertRes = insertOrderStmt.run(
        orderNumber,
        buyerId,
        totalAmount,
        deliveryAddress.trim(),
        deliveryCity.trim(),
        deliveryPhone.trim(),
        notes || null,
        orderStatus,
        initialPaymentStatus
      );

      const orderId = Number(orderInsertRes.lastInsertRowid);

      // Insert Order Items and deduct inventory
      const insertItemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, farmer_id, quantity, unit_price, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const updateStockStmt = db.prepare(`
        UPDATE inventories
        SET quantity = quantity - ?,
            last_restocked_at = CURRENT_TIMESTAMP
        WHERE product_id = ?
      `);

      const updateAvailabilityStmt = db.prepare(`
        UPDATE products
        SET is_available = 0
        WHERE id = ? AND (SELECT quantity FROM inventories WHERE product_id = ?) <= 0
      `);

      for (const item of preparedItems) {
        insertItemStmt.run(
          orderId,
          item.productId,
          item.farmerId,
          item.quantity,
          item.unitPrice,
          item.subtotal
        );

        // Deduct inventory
        updateStockStmt.run(item.quantity, item.productId);
        // Mark unavailable if stock drops to 0
        updateAvailabilityStmt.run(item.productId, item.productId);
      }

      // Create Payment Record
      const txnRef = `TXN-${paymentMethod.split('_')[0]}-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
      const paymentStatus = isCardOrMoMo ? 'Successful' : 'Pending';

      db.prepare(`
        INSERT INTO payments (order_id, user_id, amount, payment_method, transaction_ref, status, details, payment_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(
        orderId,
        buyerId,
        totalAmount,
        paymentMethod,
        txnRef,
        paymentStatus,
        `Payment via ${paymentMethod.replace('_', ' ')} (${paymentStatus})`
      );

      // Create Delivery Record
      const trackingCode = `TRK-${Date.now().toString().slice(-6)}-${orderId}`;
      db.prepare(`
        INSERT INTO deliveries (order_id, tracking_code, pickup_address, delivery_address, recipient_name, recipient_phone, status, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, CURRENT_TIMESTAMP)
      `).run(
        orderId,
        trackingCode,
        primaryFarmAddress,
        `${deliveryAddress}, ${deliveryCity}`,
        req.user.name,
        deliveryPhone,
        notes || 'Standard agricultural delivery request'
      );

      // Send Notification to Buyer
      notificationService.create({
        userId: buyerId,
        title: 'Order Placed Successfully',
        message: `Order #${orderNumber} for ${totalAmount.toLocaleString()} FCFA has been placed. Payment: ${paymentStatus}.`,
        type: 'order',
        link: `/buyer/orders/${orderId}`
      });

      // Send Notification to Farmers
      for (const fId of affectedFarmerIds) {
        notificationService.create({
          userId: fId,
          title: 'New Farm Order Received',
          message: `You have received a new order (${orderNumber}) for your agricultural produce.`,
          type: 'order',
          link: '/farmer/orders'
        });
      }

      // Notify Delivery Services
      const deliveryUsers = db.prepare("SELECT id FROM users WHERE role = 'DELIVERY_SERVICE' AND is_active = 1").all();
      for (const dUser of deliveryUsers) {
        notificationService.create({
          userId: dUser.id,
          title: 'New Delivery Request Available',
          message: `New delivery pending dispatch from ${primaryFarmAddress} to ${deliveryCity}.`,
          type: 'delivery',
          link: '/delivery/requests'
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        order: {
          id: orderId,
          orderNumber,
          totalAmount,
          status: orderStatus,
          paymentStatus,
          transactionRef: txnRef,
          trackingCode
        }
      });
    } catch (error) {
      next(error);
    }
  },

  getMyOrders(req, res, next) {
    try {
      const buyerId = req.user.id;
      const { status, search } = req.query;

      const conditions = ['o.buyer_id = ?'];
      const params = [buyerId];

      if (status && status !== 'ALL') {
        conditions.push('o.status = ?');
        params.push(status);
      }

      if (search) {
        conditions.push('(o.order_number LIKE ? OR d.tracking_code LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }

      const sql = `
        SELECT 
          o.*,
          d.tracking_code,
          d.status AS delivery_status,
          p.payment_method,
          p.transaction_ref,
          (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS total_items
        FROM orders o
        LEFT JOIN deliveries d ON o.id = d.order_id
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY o.created_at DESC
      `;

      const orders = db.prepare(sql).all(...params);

      // Attach item preview
      for (const ord of orders) {
        ord.items = db.prepare(`
          SELECT oi.*, pr.name AS product_name, pr.unit, pr.image_url
          FROM order_items oi
          JOIN products pr ON oi.product_id = pr.id
          WHERE oi.order_id = ?
        `).all(ord.id);
      }

      return res.json({
        success: true,
        orders
      });
    } catch (error) {
      next(error);
    }
  },

  getOrderHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { status, startDate, endDate, search } = req.query;

      const conditions = ['(o.buyer_id = ? OR oi.farmer_id = ?)'];
      const params = [userId, userId];

      if (status && status !== 'ALL') {
        conditions.push('o.status = ?');
        params.push(status);
      }

      if (startDate) {
        conditions.push('DATE(o.created_at) >= DATE(?)');
        params.push(startDate);
      }

      if (endDate) {
        conditions.push('DATE(o.created_at) <= DATE(?)');
        params.push(endDate);
      }

      if (search) {
        conditions.push('(o.order_number LIKE ? OR d.tracking_code LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }

      const sql = `
        SELECT DISTINCT
          o.id, o.order_number, o.total_amount, o.status, o.payment_status, o.created_at,
          d.tracking_code, d.status AS delivery_status,
          p.payment_method, p.transaction_ref,
          u.name AS buyer_name, u.phone AS buyer_phone
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN users u ON o.buyer_id = u.id
        LEFT JOIN deliveries d ON o.id = d.order_id
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY o.created_at DESC
      `;

      const orders = db.prepare(sql).all(...params);

      for (const ord of orders) {
        ord.items = db.prepare(`
          SELECT oi.*, pr.name AS product_name, pr.unit, pr.image_url
          FROM order_items oi
          JOIN products pr ON oi.product_id = pr.id
          WHERE oi.order_id = ?
        `).all(ord.id);
      }

      return res.json({
        success: true,
        orders
      });
    } catch (error) {
      next(error);
    }
  },

  getOrderDetails(req, res, next) {
    try {
      const orderId = parseInt(req.params.id, 10);
      if (isNaN(orderId)) {
        return res.status(400).json({ success: false, message: 'Invalid order ID.' });
      }

      const order = db.prepare(`
        SELECT 
          o.*,
          u.name AS buyer_name, u.email AS buyer_email, u.phone AS buyer_phone,
          d.id AS delivery_id, d.tracking_code, d.status AS delivery_status, d.pickup_address, d.delivery_address,
          d.recipient_name, d.recipient_phone, d.delivery_service_id, ds.name AS delivery_service_name,
          p.id AS payment_id, p.payment_method, p.transaction_ref, p.status AS payment_record_status, p.payment_date
        FROM orders o
        JOIN users u ON o.buyer_id = u.id
        LEFT JOIN deliveries d ON o.id = d.order_id
        LEFT JOIN users ds ON d.delivery_service_id = ds.id
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE o.id = ?
      `).get(orderId);

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      // Check access permission: Buyer, Farmer involved, Delivery agent assigned, or Administrator
      const items = db.prepare(`
        SELECT 
          oi.*, 
          pr.name AS product_name, pr.unit, pr.image_url, pr.location AS product_location,
          f.name AS farmer_name, f.phone AS farmer_phone, fp.farm_name
        FROM order_items oi
        JOIN products pr ON oi.product_id = pr.id
        JOIN users f ON oi.farmer_id = f.id
        LEFT JOIN farmer_profiles fp ON f.id = fp.user_id
        WHERE oi.order_id = ?
      `).all(orderId);

      const isFarmerOfOrder = items.some(item => item.farmer_id === req.user.id);
      const isBuyer = order.buyer_id === req.user.id;
      const isDelivery = req.user.role === 'DELIVERY_SERVICE';
      const isAdmin = req.user.role === 'ADMINISTRATOR';

      if (!isBuyer && !isFarmerOfOrder && !isDelivery && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to inspect this order.'
        });
      }

      order.items = items;
      return res.json({
        success: true,
        order
      });
    } catch (error) {
      next(error);
    }
  },

  getFarmerIncomingOrders(req, res, next) {
    try {
      const farmerId = req.user.id;
      const { status } = req.query;

      const conditions = ['oi.farmer_id = ?'];
      const params = [farmerId];

      if (status && status !== 'ALL') {
        conditions.push('o.status = ?');
        params.push(status);
      }

      const sql = `
        SELECT DISTINCT
          o.id, o.order_number, o.created_at, o.status, o.payment_status,
          o.delivery_address, o.delivery_city, o.delivery_phone, o.notes,
          u.name AS buyer_name, u.phone AS buyer_phone,
          d.tracking_code, d.status AS delivery_status
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN users u ON o.buyer_id = u.id
        LEFT JOIN deliveries d ON o.id = d.order_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY o.created_at DESC
      `;

      const orders = db.prepare(sql).all(...params);

      for (const ord of orders) {
        ord.items = db.prepare(`
          SELECT oi.*, pr.name AS product_name, pr.unit, pr.image_url
          FROM order_items oi
          JOIN products pr ON oi.product_id = pr.id
          WHERE oi.order_id = ? AND oi.farmer_id = ?
        `).all(ord.id, farmerId);

        ord.farmerSubtotal = ord.items.reduce((sum, i) => sum + i.subtotal, 0);
      }

      return res.json({
        success: true,
        orders
      });
    } catch (error) {
      next(error);
    }
  },

  updateOrderStatus(req, res, next) {
    try {
      const orderId = parseInt(req.params.id, 10);
      const { status, notes } = req.body;

      const validStatuses = [
        'Pending', 'Accepted', 'Rejected', 'Processing',
        'Ready for delivery', 'Out for delivery', 'Delivered', 'Cancelled'
      ];

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid order status. Allowed: ${validStatuses.join(', ')}`
        });
      }

      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      // Check permission
      const farmerItem = db.prepare('SELECT id FROM order_items WHERE order_id = ? AND farmer_id = ?').get(orderId, req.user.id);
      if (req.user.role !== 'ADMINISTRATOR' && !farmerItem && req.user.role !== 'DELIVERY_SERVICE') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      // If status changed to 'Rejected' or 'Cancelled', return stock to inventory
      if ((status === 'Rejected' || status === 'Cancelled') && (order.status !== 'Rejected' && order.status !== 'Cancelled')) {
        const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(orderId);
        for (const it of items) {
          db.prepare('UPDATE inventories SET quantity = quantity + ? WHERE product_id = ?').run(it.quantity, it.product_id);
          db.prepare('UPDATE products SET is_available = 1 WHERE id = ?').run(it.product_id);
        }
      }

      // If status changed to 'Ready for delivery', update delivery record
      if (status === 'Ready for delivery') {
        db.prepare("UPDATE deliveries SET status = 'Pending', updated_at = CURRENT_TIMESTAMP WHERE order_id = ?").run(orderId);
      }

      // Update Order
      db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, orderId);

      // Notify Buyer
      notificationService.create({
        userId: order.buyer_id,
        title: `Order Status Updated: ${status}`,
        message: `Your Order #${order.order_number} is now '${status}'. ${notes || ''}`,
        type: status === 'Rejected' || status === 'Cancelled' ? 'warning' : 'order',
        link: `/buyer/orders/${orderId}`
      });

      return res.json({
        success: true,
        message: `Order status updated to '${status}'.`,
        status
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = orderController;
