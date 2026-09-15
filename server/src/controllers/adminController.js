const db = require('../config/database');
const notificationService = require('../services/notificationService');

const adminController = {
  // A. DASHBOARD STATISTICS & METRICS
  getDashboardStats(req, res, next) {
    try {
      const totalUsers = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
      const totalFarmers = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'FARMER'").get().count;
      const totalBuyers = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role IN ('USER', 'SELLER_BUYER')").get().count;
      const totalDeliveryAgents = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'DELIVERY_SERVICE'").get().count;

      const totalProducts = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;
      const totalOrders = db.prepare('SELECT COUNT(*) AS count FROM orders').get().count;
      const pendingOrders = db.prepare("SELECT COUNT(*) AS count FROM orders WHERE status = 'Pending'").get().count;
      const completedOrders = db.prepare("SELECT COUNT(*) AS count FROM orders WHERE status = 'Delivered'").get().count;

      const totalRevenueRes = db.prepare("SELECT SUM(amount) AS sum FROM payments WHERE status = 'Successful'").get();
      const totalRevenue = totalRevenueRes.sum || 0;

      const successfulPayments = db.prepare("SELECT COUNT(*) AS count FROM payments WHERE status = 'Successful'").get().count;
      const pendingValidations = db.prepare("SELECT COUNT(*) AS count FROM farmer_profiles WHERE status = 'Pending'").get().count;
      const pendingDeliveries = db.prepare("SELECT COUNT(*) AS count FROM deliveries WHERE status IN ('Pending', 'Assigned', 'Picked Up', 'In Transit')").get().count;

      // Category breakdown for chart
      const categoryDistribution = db.prepare(`
        SELECT c.name, COUNT(p.id) AS product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id
        ORDER BY product_count DESC
      `).all();

      // Order status distribution
      const orderStatusDistribution = db.prepare(`
        SELECT status, COUNT(*) AS count
        FROM orders
        GROUP BY status
      `).all();

      // Recent 5 transactions
      const recentTransactions = db.prepare(`
        SELECT p.*, o.order_number, u.name AS user_name, u.email AS user_email
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        JOIN users u ON p.user_id = u.id
        ORDER BY p.payment_date DESC
        LIMIT 5
      `).all();

      // Recent 5 pending farmer validations
      const pendingFarmers = db.prepare(`
        SELECT fp.*, u.name, u.email, u.phone, u.created_at AS user_created_at
        FROM farmer_profiles fp
        JOIN users u ON fp.user_id = u.id
        WHERE fp.status = 'Pending'
        ORDER BY fp.created_at DESC
        LIMIT 5
      `).all();

      return res.json({
        success: true,
        stats: {
          totalUsers,
          totalFarmers,
          totalBuyers,
          totalDeliveryAgents,
          totalProducts,
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue,
          successfulPayments,
          pendingValidations,
          pendingDeliveries,
          categoryDistribution,
          orderStatusDistribution,
          recentTransactions,
          pendingFarmers
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // B. MANAGE USERS
  getAllUsers(req, res, next) {
    try {
      const { role, search, status } = req.query;
      const conditions = [];
      const params = [];

      if (role && role !== 'ALL') {
        conditions.push('role = ?');
        params.push(role);
      }

      if (status !== undefined && status !== 'ALL') {
        conditions.push('is_active = ?');
        params.push(status === 'active' || status === '1' ? 1 : 0);
      }

      if (search) {
        conditions.push('(name LIKE ? OR email LIKE ? OR phone LIKE ? OR city LIKE ?)');
        const searchWildcard = `%${search}%`;
        params.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const users = db.prepare(`
        SELECT id, name, email, role, phone, address, city, avatar_url, is_active, created_at, updated_at
        FROM users
        ${whereClause}
        ORDER BY created_at DESC
      `).all(...params);

      return res.json({
        success: true,
        users
      });
    } catch (error) {
      next(error);
    }
  },

  updateUserStatus(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      const { isActive } = req.body;

      if (userId === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own administrator account.'
        });
      }

      const newActive = isActive ? 1 : 0;
      db.prepare('UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newActive, userId);

      return res.json({
        success: true,
        message: `User account has been ${newActive === 1 ? 'activated' : 'deactivated'}.`,
        isActive: newActive === 1
      });
    } catch (error) {
      next(error);
    }
  },

  updateUserRole(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      const { role } = req.body;

      const allowedRoles = ['USER', 'SELLER_BUYER', 'FARMER', 'DELIVERY_SERVICE', 'ADMINISTRATOR'];
      if (!role || !allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role. Allowed: ${allowedRoles.join(', ')}`
        });
      }

      db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(role, userId);

      // If upgraded to FARMER and no farmer profile exists, create one
      if (role === 'FARMER') {
        const fp = db.prepare('SELECT id FROM farmer_profiles WHERE user_id = ?').get(userId);
        if (!fp) {
          const u = db.prepare('SELECT name, city FROM users WHERE id = ?').get(userId);
          db.prepare(`
            INSERT INTO farmer_profiles (user_id, farm_name, farm_location, status)
            VALUES (?, ?, ?, 'Approved')
          `).run(userId, `${u.name}'s Farm`, u.city || 'Cameroon');
        }
      }

      return res.json({
        success: true,
        message: `User role updated to '${role}'.`,
        role
      });
    } catch (error) {
      next(error);
    }
  },

  deleteUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (userId === req.user.id) {
        return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
      }

      db.prepare('DELETE FROM users WHERE id = ?').run(userId);

      return res.json({
        success: true,
        message: 'User account removed successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  // C. VALIDATE FARMERS
  getFarmers(req, res, next) {
    try {
      const { status } = req.query;
      const conditions = [];
      const params = [];

      if (status && status !== 'ALL') {
        conditions.push('fp.status = ?');
        params.push(status);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const farmers = db.prepare(`
        SELECT 
          fp.*,
          u.name, u.email, u.phone, u.city, u.avatar_url, u.is_active,
          reviewer.name AS reviewed_by_name,
          (SELECT COUNT(*) FROM products p WHERE p.farmer_id = u.id) AS product_count
        FROM farmer_profiles fp
        JOIN users u ON fp.user_id = u.id
        LEFT JOIN users reviewer ON fp.reviewed_by = reviewer.id
        ${whereClause}
        ORDER BY fp.created_at DESC
      `).all(...params);

      return res.json({
        success: true,
        farmers
      });
    } catch (error) {
      next(error);
    }
  },

  validateFarmer(req, res, next) {
    try {
      const farmerProfileId = parseInt(req.params.id, 10);
      const { status, adminNotes } = req.body;

      const validStatuses = ['Approved', 'Rejected', 'Suspended', 'Pending'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid farmer validation status. Allowed: ${validStatuses.join(', ')}`
        });
      }

      const profile = db.prepare('SELECT * FROM farmer_profiles WHERE id = ?').get(farmerProfileId);
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Farmer profile record not found.' });
      }

      db.prepare(`
        UPDATE farmer_profiles
        SET status = ?,
            admin_notes = COALESCE(?, admin_notes),
            reviewed_by = ?,
            reviewed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, adminNotes || null, req.user.id, farmerProfileId);

      // Notify the Farmer
      notificationService.create({
        userId: profile.user_id,
        title: `Farmer Verification: ${status}`,
        message: status === 'Approved'
          ? 'Congratulations! Your farm credentials have been verified and approved. You may now publish and manage products on the marketplace.'
          : `Your farmer application has been marked as '${status}'. Note: ${adminNotes || 'Contact support for more details.'}`,
        type: status === 'Approved' ? 'success' : 'warning',
        link: '/farmer/dashboard'
      });

      return res.json({
        success: true,
        message: `Farmer application has been set to '${status}'.`,
        status
      });
    } catch (error) {
      next(error);
    }
  },

  // D. MANAGE PRODUCTS (ADMIN)
  getAllAdminProducts(req, res, next) {
    try {
      const products = db.prepare(`
        SELECT 
          p.*,
          c.name AS category_name,
          u.name AS farmer_name, u.email AS farmer_email,
          fp.farm_name,
          COALESCE(i.quantity, 0) AS stock_quantity,
          COALESCE(i.low_stock_threshold, 10) AS low_stock_threshold
        FROM products p
        JOIN categories c ON p.category_id = c.id
        JOIN users u ON p.farmer_id = u.id
        LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
        LEFT JOIN inventories i ON p.id = i.product_id
        ORDER BY p.created_at DESC
      `).all();

      return res.json({
        success: true,
        products
      });
    } catch (error) {
      next(error);
    }
  },

  // E. MANAGE CATEGORIES
  createCategory(req, res, next) {
    try {
      const { name, description, imageUrl } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Category name is required.' });
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const result = db.prepare(`
        INSERT INTO categories (name, slug, description, image_url)
        VALUES (?, ?, ?, ?)
      `).run(
        name.trim(),
        slug,
        description || null,
        imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
      );

      const newCat = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        category: newCat
      });
    } catch (error) {
      next(error);
    }
  },

  updateCategory(req, res, next) {
    try {
      const catId = parseInt(req.params.id, 10);
      const { name, description, imageUrl } = req.body;

      db.prepare(`
        UPDATE categories
        SET name = COALESCE(?, name),
            description = COALESCE(?, description),
            image_url = COALESCE(?, image_url)
        WHERE id = ?
      `).run(
        name ? name.trim() : null,
        description !== undefined ? description : null,
        imageUrl !== undefined ? imageUrl : null,
        catId
      );

      const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(catId);
      return res.json({
        success: true,
        message: 'Category updated successfully.',
        category: updated
      });
    } catch (error) {
      next(error);
    }
  },

  deleteCategory(req, res, next) {
    try {
      const catId = parseInt(req.params.id, 10);
      const prodCount = db.prepare('SELECT COUNT(*) AS count FROM products WHERE category_id = ?').get(catId).count;
      if (prodCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete category containing ${prodCount} existing products. Reassign or delete products first.`
        });
      }

      db.prepare('DELETE FROM categories WHERE id = ?').run(catId);
      return res.json({
        success: true,
        message: 'Category deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  // F. MONITOR TRANSACTIONS
  getTransactions(req, res, next) {
    try {
      const { status, paymentMethod, search } = req.query;
      const conditions = [];
      const params = [];

      if (status && status !== 'ALL') {
        conditions.push('p.status = ?');
        params.push(status);
      }

      if (paymentMethod && paymentMethod !== 'ALL') {
        conditions.push('p.payment_method = ?');
        params.push(paymentMethod);
      }

      if (search) {
        conditions.push('(p.transaction_ref LIKE ? OR o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ?)');
        const searchWildcard = `%${search}%`;
        params.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const transactions = db.prepare(`
        SELECT 
          p.*,
          o.order_number, o.status AS order_status,
          u.name AS user_name, u.email AS user_email, u.phone AS user_phone
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        JOIN users u ON p.user_id = u.id
        ${whereClause}
        ORDER BY p.payment_date DESC
      `).all(...params);

      const totalVolume = transactions.reduce((sum, t) => sum + (t.status === 'Successful' ? t.amount : 0), 0);

      return res.json({
        success: true,
        totalVolume,
        count: transactions.length,
        transactions
      });
    } catch (error) {
      next(error);
    }
  },

  // G. ALL ORDERS FOR ADMIN
  getAllOrders(req, res, next) {
    try {
      const { status, search } = req.query;
      const conditions = [];
      const params = [];

      if (status && status !== 'ALL') {
        conditions.push('o.status = ?');
        params.push(status);
      }

      if (search) {
        conditions.push('(o.order_number LIKE ? OR u.name LIKE ? OR d.tracking_code LIKE ?)');
        const searchWildcard = `%${search}%`;
        params.push(searchWildcard, searchWildcard, searchWildcard);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const orders = db.prepare(`
        SELECT 
          o.*,
          u.name AS buyer_name, u.phone AS buyer_phone, u.email AS buyer_email,
          d.tracking_code, d.status AS delivery_status,
          p.payment_method, p.transaction_ref,
          (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
        FROM orders o
        JOIN users u ON o.buyer_id = u.id
        LEFT JOIN deliveries d ON o.id = d.order_id
        LEFT JOIN payments p ON o.id = p.order_id
        ${whereClause}
        ORDER BY o.created_at DESC
      `).all(...params);

      return res.json({
        success: true,
        orders
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminController;
