const db = require('../config/database');
const notificationService = require('../services/notificationService');

const inventoryController = {
  getFarmerInventory(req, res, next) {
    try {
      const farmerId = req.user.role === 'ADMINISTRATOR' && req.query.farmerId
        ? parseInt(req.query.farmerId, 10)
        : req.user.id;

      const items = db.prepare(`
        SELECT 
          i.id AS inventory_id,
          i.product_id,
          i.quantity,
          i.reserved_quantity,
          i.low_stock_threshold,
          i.last_restocked_at,
          p.name AS product_name,
          p.price,
          p.unit,
          p.image_url,
          p.is_available,
          p.location,
          c.name AS category_name,
          u.name AS farmer_name,
          CASE 
            WHEN i.quantity = 0 THEN 'OUT_OF_STOCK'
            WHEN i.quantity <= i.low_stock_threshold THEN 'LOW_STOCK'
            ELSE 'IN_STOCK'
          END AS stock_status
        FROM inventories i
        JOIN products p ON i.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        JOIN users u ON p.farmer_id = u.id
        WHERE (${req.user.role === 'ADMINISTRATOR' && !req.query.farmerId ? '1=1' : 'p.farmer_id = ?'})
        ORDER BY i.quantity ASC
      `).all(req.user.role === 'ADMINISTRATOR' && !req.query.farmerId ? undefined : farmerId);

      // Inventory Summary statistics
      const totalProducts = items.length;
      const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
      const lowStockCount = items.filter(item => item.stock_status === 'LOW_STOCK').length;
      const outOfStockCount = items.filter(item => item.stock_status === 'OUT_OF_STOCK').length;

      return res.json({
        success: true,
        summary: {
          totalProducts,
          totalUnits,
          lowStockCount,
          outOfStockCount
        },
        inventory: items
      });
    } catch (error) {
      next(error);
    }
  },

  updateStock(req, res, next) {
    try {
      const productId = parseInt(req.params.productId, 10);
      const { quantity, delta, lowStockThreshold, isAvailable } = req.body;

      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      if (req.user.role !== 'ADMINISTRATOR' && product.farmer_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const currentInv = db.prepare('SELECT * FROM inventories WHERE product_id = ?').get(productId);
      if (!currentInv) {
        return res.status(404).json({ success: false, message: 'Inventory record not found.' });
      }

      let newQuantity = currentInv.quantity;
      if (quantity !== undefined) {
        newQuantity = Math.max(0, parseInt(quantity, 10) || 0);
      } else if (delta !== undefined) {
        newQuantity = Math.max(0, currentInv.quantity + (parseInt(delta, 10) || 0));
      }

      const newThreshold = lowStockThreshold !== undefined
        ? Math.max(1, parseInt(lowStockThreshold, 10) || 10)
        : currentInv.low_stock_threshold;

      db.prepare(`
        UPDATE inventories
        SET quantity = ?,
            low_stock_threshold = ?,
            last_restocked_at = CURRENT_TIMESTAMP
        WHERE product_id = ?
      `).run(newQuantity, newThreshold, productId);

      // Auto update availability if quantity changes
      let updatedAvailable = product.is_available;
      if (isAvailable !== undefined) {
        updatedAvailable = isAvailable ? 1 : 0;
        db.prepare('UPDATE products SET is_available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(updatedAvailable, productId);
      } else if (newQuantity === 0 && product.is_available === 1) {
        // Mark unavailable when out of stock
        db.prepare('UPDATE products SET is_available = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(productId);
        updatedAvailable = 0;
      } else if (newQuantity > 0 && product.is_available === 0) {
        db.prepare('UPDATE products SET is_available = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(productId);
        updatedAvailable = 1;
      }

      // Check if low stock threshold is breached and notify farmer
      if (newQuantity > 0 && newQuantity <= newThreshold) {
        notificationService.create({
          userId: product.farmer_id,
          title: 'Low Stock Alert',
          message: `${product.name} currently has ${newQuantity} ${product.unit} left, reaching low stock threshold (${newThreshold}).`,
          type: 'warning',
          link: '/farmer/inventory'
        });
      }

      const updated = db.prepare(`
        SELECT i.*, p.name AS product_name, p.is_available, p.unit
        FROM inventories i
        JOIN products p ON i.product_id = p.id
        WHERE i.product_id = ?
      `).get(productId);

      return res.json({
        success: true,
        message: 'Stock updated successfully.',
        inventory: updated
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = inventoryController;
