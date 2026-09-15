const db = require('../config/database');
const notificationService = require('../services/notificationService');

const deliveryController = {
  getDeliveryRequests(req, res, next) {
    try {
      // Pending deliveries waiting for courier assignment or pickup
      const requests = db.prepare(`
        SELECT 
          d.*,
          o.order_number, o.total_amount, o.created_at AS order_date,
          u.name AS customer_name, u.phone AS customer_phone, u.email AS customer_email,
          (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS total_items,
          (
            SELECT GROUP_CONCAT(p.name || ' (' || oi.quantity || ' ' || p.unit || ')', ', ')
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = o.id
          ) AS product_summary
        FROM deliveries d
        JOIN orders o ON d.order_id = o.id
        JOIN users u ON o.buyer_id = u.id
        WHERE d.status = 'Pending' OR (d.status = 'Assigned' AND d.delivery_service_id IS NULL)
        ORDER BY d.created_at DESC
      `).all();

      return res.json({
        success: true,
        requests
      });
    } catch (error) {
      next(error);
    }
  },

  getAssignedDeliveries(req, res, next) {
    try {
      const driverId = req.user.id;
      const isAdmin = req.user.role === 'ADMINISTRATOR';

      const condition = isAdmin ? "d.status IN ('Assigned', 'Picked Up', 'In Transit')" : "d.delivery_service_id = ? AND d.status IN ('Assigned', 'Picked Up', 'In Transit')";
      const params = isAdmin ? [] : [driverId];

      const deliveries = db.prepare(`
        SELECT 
          d.*,
          o.order_number, o.total_amount, o.created_at AS order_date,
          u.name AS customer_name, u.phone AS customer_phone,
          (
            SELECT GROUP_CONCAT(p.name || ' (' || oi.quantity || ' ' || p.unit || ')', ', ')
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = o.id
          ) AS product_summary
        FROM deliveries d
        JOIN orders o ON d.order_id = o.id
        JOIN users u ON o.buyer_id = u.id
        WHERE ${condition}
        ORDER BY d.updated_at DESC
      `).all(...params);

      return res.json({
        success: true,
        deliveries
      });
    } catch (error) {
      next(error);
    }
  },

  getDeliveryHistory(req, res, next) {
    try {
      const driverId = req.user.id;
      const isAdmin = req.user.role === 'ADMINISTRATOR';

      const condition = isAdmin
        ? "d.status IN ('Delivered', 'Failed', 'Cancelled')"
        : "d.delivery_service_id = ? AND d.status IN ('Delivered', 'Failed', 'Cancelled')";
      const params = isAdmin ? [] : [driverId];

      const history = db.prepare(`
        SELECT 
          d.*,
          o.order_number, o.total_amount,
          u.name AS customer_name, u.phone AS customer_phone,
          (
            SELECT GROUP_CONCAT(p.name || ' (' || oi.quantity || ' ' || p.unit || ')', ', ')
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = o.id
          ) AS product_summary
        FROM deliveries d
        JOIN orders o ON d.order_id = o.id
        JOIN users u ON o.buyer_id = u.id
        WHERE ${condition}
        ORDER BY d.delivered_at DESC, d.updated_at DESC
      `).all(...params);

      return res.json({
        success: true,
        history
      });
    } catch (error) {
      next(error);
    }
  },

  getDeliveryDetails(req, res, next) {
    try {
      const deliveryId = parseInt(req.params.id, 10);
      const delivery = db.prepare(`
        SELECT 
          d.*,
          o.order_number, o.total_amount, o.payment_status, o.created_at AS order_date,
          u.name AS customer_name, u.phone AS customer_phone, u.email AS customer_email,
          ds.name AS delivery_service_name
        FROM deliveries d
        JOIN orders o ON d.order_id = o.id
        JOIN users u ON o.buyer_id = u.id
        LEFT JOIN users ds ON d.delivery_service_id = ds.id
        WHERE d.id = ?
      `).get(deliveryId);

      if (!delivery) {
        return res.status(404).json({ success: false, message: 'Delivery record not found.' });
      }

      // Items with Farmer locations
      const items = db.prepare(`
        SELECT 
          oi.*,
          p.name AS product_name, p.unit, p.image_url,
          f.name AS farmer_name, f.phone AS farmer_phone,
          fp.farm_name, fp.farm_location
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN users f ON oi.farmer_id = f.id
        LEFT JOIN farmer_profiles fp ON f.id = fp.user_id
        WHERE oi.order_id = ?
      `).all(delivery.order_id);

      delivery.items = items;

      return res.json({
        success: true,
        delivery
      });
    } catch (error) {
      next(error);
    }
  },

  acceptDelivery(req, res, next) {
    try {
      const deliveryId = parseInt(req.params.id, 10);
      const delivery = db.prepare('SELECT * FROM deliveries WHERE id = ?').get(deliveryId);

      if (!delivery) {
        return res.status(404).json({ success: false, message: 'Delivery request not found.' });
      }

      if (delivery.delivery_service_id && delivery.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: 'This delivery has already been assigned to another logistics courier.'
        });
      }

      db.prepare(`
        UPDATE deliveries
        SET delivery_service_id = ?,
            status = 'Assigned',
            assigned_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(req.user.id, deliveryId);

      // Notify Order Buyer
      const order = db.prepare('SELECT buyer_id, order_number FROM orders WHERE id = ?').get(delivery.order_id);
      if (order) {
        notificationService.create({
          userId: order.buyer_id,
          title: 'Delivery Agent Assigned',
          message: `${req.user.name} has been assigned to deliver your Order #${order.order_number}.`,
          type: 'delivery',
          link: `/buyer/orders/${order.id}`
        });
      }

      return res.json({
        success: true,
        message: 'Delivery request accepted and assigned to your logistics route.',
        status: 'Assigned'
      });
    } catch (error) {
      next(error);
    }
  },

  updateDeliveryStatus(req, res, next) {
    try {
      const deliveryId = parseInt(req.params.id, 10);
      const { status, notes } = req.body;

      const validStatuses = ['Pending', 'Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Failed', 'Cancelled'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid delivery status. Allowed: ${validStatuses.join(', ')}`
        });
      }

      const delivery = db.prepare('SELECT * FROM deliveries WHERE id = ?').get(deliveryId);
      if (!delivery) {
        return res.status(404).json({ success: false, message: 'Delivery record not found.' });
      }

      if (req.user.role !== 'ADMINISTRATOR' && delivery.delivery_service_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied. You are not assigned to this delivery.' });
      }

      let pickedUpAt = delivery.picked_up_at;
      let deliveredAt = delivery.delivered_at;

      if (status === 'Picked Up' && !pickedUpAt) {
        pickedUpAt = new Date().toISOString();
      }
      if (status === 'Delivered' && !deliveredAt) {
        deliveredAt = new Date().toISOString();
      }

      db.prepare(`
        UPDATE deliveries
        SET status = ?,
            notes = COALESCE(?, notes),
            picked_up_at = COALESCE(?, picked_up_at),
            delivered_at = COALESCE(?, delivered_at),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, notes || null, pickedUpAt, deliveredAt, deliveryId);

      // Update corresponding Order status
      const order = db.prepare('SELECT id, buyer_id, order_number FROM orders WHERE id = ?').get(delivery.order_id);
      if (order) {
        let orderStatus = null;
        if (status === 'Picked Up') orderStatus = 'Processing';
        else if (status === 'In Transit') orderStatus = 'Out for delivery';
        else if (status === 'Delivered') orderStatus = 'Delivered';
        else if (status === 'Cancelled') orderStatus = 'Cancelled';

        if (orderStatus) {
          db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(orderStatus, order.id);
        }

        // Send buyer notification
        notificationService.create({
          userId: order.buyer_id,
          title: `Delivery Update: ${status}`,
          message: `Your Order #${order.order_number} delivery status is now '${status}'. Tracking: ${delivery.tracking_code}`,
          type: status === 'Delivered' ? 'success' : 'delivery',
          link: `/buyer/orders/${order.id}`
        });

        // If delivered, notify farmers
        if (status === 'Delivered') {
          const farmers = db.prepare('SELECT DISTINCT farmer_id FROM order_items WHERE order_id = ?').all(order.id);
          for (const f of farmers) {
            notificationService.create({
              userId: f.farmer_id,
              title: 'Produce Successfully Delivered',
              message: `Produce for Order #${order.order_number} was successfully delivered to the customer.`,
              type: 'success',
              link: '/farmer/orders'
            });
          }
        }
      }

      return res.json({
        success: true,
        message: `Delivery status updated to '${status}'.`,
        status
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = deliveryController;
