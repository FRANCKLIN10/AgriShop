const db = require('../config/database');
const notificationService = require('../services/notificationService');

const paymentController = {
  makePayment(req, res, next) {
    try {
      const { orderId, paymentMethod, phoneNumber, lastFourDigits } = req.body;

      if (!orderId || !paymentMethod) {
        return res.status(400).json({
          success: false,
          message: 'Order ID and payment method are required.'
        });
      }

      const validMethods = ['MTN_MOMO', 'ORANGE_MONEY', 'CREDIT_CARD', 'CASH_ON_DELIVERY', 'BANK_TRANSFER'];
      if (!validMethods.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: `Invalid payment method. Allowed: ${validMethods.join(', ')}`
        });
      }

      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      if (order.buyer_id !== req.user.id && req.user.role !== 'ADMINISTRATOR') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      if (order.payment_status === 'Paid') {
        return res.status(400).json({
          success: false,
          message: 'This order has already been paid for.'
        });
      }

      const txnRef = `TXN-${paymentMethod.split('_')[0]}-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;

      // Payment gateway simulation logic
      // Never store full card number or PIN
      let details = `Simulated Payment Gateway: ${paymentMethod}`;
      if (paymentMethod === 'MTN_MOMO' || paymentMethod === 'ORANGE_MONEY') {
        details += ` | Mobile Account: ${phoneNumber ? phoneNumber.slice(-4).padStart(phoneNumber.length, '*') : 'Verified'}`;
      } else if (paymentMethod === 'CREDIT_CARD') {
        details += ` | Card ending in ${lastFourDigits || '4242'}`;
      }

      const paymentStatus = paymentMethod === 'CASH_ON_DELIVERY' ? 'Pending' : 'Successful';

      // Check if existing payment record exists for this order
      const existingPayment = db.prepare('SELECT id FROM payments WHERE order_id = ?').get(orderId);

      if (existingPayment) {
        db.prepare(`
          UPDATE payments
          SET amount = ?,
              payment_method = ?,
              transaction_ref = ?,
              status = ?,
              details = ?,
              payment_date = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(order.total_amount, paymentMethod, txnRef, paymentStatus, details, existingPayment.id);
      } else {
        db.prepare(`
          INSERT INTO payments (order_id, user_id, amount, payment_method, transaction_ref, status, details, payment_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(orderId, req.user.id, order.total_amount, paymentMethod, txnRef, paymentStatus, details);
      }

      // Update Order payment status
      if (paymentStatus === 'Successful') {
        db.prepare("UPDATE orders SET payment_status = 'Paid', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(orderId);

        // Notify Buyer
        notificationService.create({
          userId: order.buyer_id,
          title: 'Payment Successful',
          message: `Your payment of ${order.total_amount.toLocaleString()} FCFA for Order #${order.order_number} has been confirmed. Ref: ${txnRef}`,
          type: 'payment',
          link: `/buyer/orders/${orderId}`
        });

        // Notify Admins
        notificationService.notifyAdmins({
          title: 'Payment Received',
          message: `Payment received: ${order.total_amount.toLocaleString()} FCFA for Order #${order.order_number} via ${paymentMethod}.`,
          type: 'payment',
          link: '/admin/transactions'
        });
      }

      return res.json({
        success: true,
        message: paymentStatus === 'Successful' ? 'Payment processed successfully!' : 'Order marked for Cash on Delivery.',
        payment: {
          orderId,
          amount: order.total_amount,
          paymentMethod,
          transactionRef: txnRef,
          status: paymentStatus,
          details
        }
      });
    } catch (error) {
      next(error);
    }
  },

  getPaymentDetails(req, res, next) {
    try {
      const paymentId = parseInt(req.params.id, 10);
      const payment = db.prepare(`
        SELECT p.*, o.order_number, u.name AS user_name, u.email AS user_email
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `).get(paymentId);

      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment record not found.' });
      }

      if (payment.user_id !== req.user.id && req.user.role !== 'ADMINISTRATOR') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      return res.json({
        success: true,
        payment
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = paymentController;
