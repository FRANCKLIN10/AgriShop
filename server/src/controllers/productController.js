const db = require('../config/database');
const notificationService = require('../services/notificationService');

const productController = {
  getAllProducts(req, res, next) {
    try {
      const {
        search = '',
        category,
        location,
        minPrice,
        maxPrice,
        sort = 'newest',
        page = 1,
        limit = 12,
        farmerId,
        includeUnavailable = false
      } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
      const offset = (pageNum - 1) * limitNum;

      const conditions = ['p.is_approved = 1'];
      const params = [];

      if (!includeUnavailable && includeUnavailable !== 'true') {
        conditions.push('p.is_available = 1');
        conditions.push('COALESCE(i.quantity, 0) > 0');
      }

      if (search) {
        conditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.location LIKE ?)');
        const searchWildcard = `%${search}%`;
        params.push(searchWildcard, searchWildcard, searchWildcard);
      }

      if (category) {
        if (isNaN(category)) {
          conditions.push('c.slug = ?');
          params.push(category);
        } else {
          conditions.push('p.category_id = ?');
          params.push(parseInt(category, 10));
        }
      }

      if (location) {
        conditions.push('p.location LIKE ?');
        params.push(`%${location}%`);
      }

      if (minPrice) {
        conditions.push('p.price >= ?');
        params.push(parseFloat(minPrice));
      }

      if (maxPrice) {
        conditions.push('p.price <= ?');
        params.push(parseFloat(maxPrice));
      }

      if (farmerId) {
        conditions.push('p.farmer_id = ?');
        params.push(parseInt(farmerId, 10));
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      let orderByClause = 'ORDER BY p.created_at DESC';
      if (sort === 'price_asc') {
        orderByClause = 'ORDER BY p.price ASC';
      } else if (sort === 'price_desc') {
        orderByClause = 'ORDER BY p.price DESC';
      } else if (sort === 'name') {
        orderByClause = 'ORDER BY p.name ASC';
      } else if (sort === 'popular') {
        orderByClause = 'ORDER BY review_count DESC, avg_rating DESC';
      }

      // Count query
      const countSql = `
        SELECT COUNT(DISTINCT p.id) as total
        FROM products p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN inventories i ON p.id = i.product_id
        ${whereClause}
      `;
      const countResult = db.prepare(countSql).get(...params);
      const total = countResult ? countResult.total : 0;

      // Data query
      const dataSql = `
        SELECT 
          p.id, p.farmer_id, p.category_id, p.name, p.slug, p.description,
          p.price, p.unit, p.image_url, p.location, p.is_available, p.is_approved,
          p.created_at, p.updated_at,
          c.name AS category_name, c.slug AS category_slug,
          u.name AS farmer_name, u.avatar_url AS farmer_avatar,
          fp.farm_name, fp.farm_location,
          COALESCE(i.quantity, 0) AS stock_quantity,
          COALESCE(i.low_stock_threshold, 10) AS low_stock_threshold,
          (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) AS review_count,
          (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id) AS avg_rating
        FROM products p
        JOIN categories c ON p.category_id = c.id
        JOIN users u ON p.farmer_id = u.id
        LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
        LEFT JOIN inventories i ON p.id = i.product_id
        ${whereClause}
        ${orderByClause}
        LIMIT ? OFFSET ?
      `;

      const products = db.prepare(dataSql).all(...params, limitNum, offset);

      return res.json({
        success: true,
        data: products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1
        }
      });
    } catch (error) {
      next(error);
    }
  },

  getProductById(req, res, next) {
    try {
      const productId = parseInt(req.params.id, 10);
      if (isNaN(productId)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID.' });
      }

      const product = db.prepare(`
        SELECT 
          p.id, p.farmer_id, p.category_id, p.name, p.slug, p.description,
          p.price, p.unit, p.image_url, p.location, p.is_available, p.is_approved,
          p.created_at, p.updated_at,
          c.name AS category_name, c.slug AS category_slug,
          u.name AS farmer_name, u.email AS farmer_email, u.phone AS farmer_phone, u.avatar_url AS farmer_avatar,
          fp.farm_name, fp.farm_location, fp.farm_size, fp.specialization, fp.status AS farmer_status,
          COALESCE(i.quantity, 0) AS stock_quantity,
          COALESCE(i.low_stock_threshold, 10) AS low_stock_threshold,
          COALESCE(i.reserved_quantity, 0) AS reserved_quantity
        FROM products p
        JOIN categories c ON p.category_id = c.id
        JOIN users u ON p.farmer_id = u.id
        LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
        LEFT JOIN inventories i ON p.id = i.product_id
        WHERE p.id = ?
      `).get(productId);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      // Fetch reviews
      const reviews = db.prepare(`
        SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name, u.avatar_url AS user_avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
      `).all(productId);

      // Related products from same category
      const related = db.prepare(`
        SELECT p.id, p.name, p.price, p.unit, p.image_url, p.location, COALESCE(i.quantity, 0) AS stock_quantity
        FROM products p
        LEFT JOIN inventories i ON p.id = i.product_id
        WHERE p.category_id = ? AND p.id != ? AND p.is_available = 1
        LIMIT 4
      `).all(product.category_id, productId);

      return res.json({
        success: true,
        product,
        reviews,
        related
      });
    } catch (error) {
      next(error);
    }
  },

  getCategories(req, res, next) {
    try {
      const categories = db.prepare(`
        SELECT c.*, COUNT(p.id) AS product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id AND p.is_available = 1
        GROUP BY c.id
        ORDER BY c.name ASC
      `).all();

      return res.json({
        success: true,
        categories
      });
    } catch (error) {
      next(error);
    }
  },

  createProduct(req, res, next) {
    try {
      const {
        name,
        categoryId,
        description,
        price,
        unit = 'kg',
        imageUrl,
        location,
        quantity = 0,
        lowStockThreshold = 10
      } = req.body;

      if (!name || !categoryId || price === undefined || price === null || !location) {
        return res.status(400).json({
          success: false,
          message: 'Please provide product name, category, price, and farm location.'
        });
      }

      if (parseFloat(price) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a non-negative number.'
        });
      }

      // Check category exists
      const cat = db.prepare('SELECT id FROM categories WHERE id = ?').get(categoryId);
      if (!cat) {
        return res.status(400).json({
          success: false,
          message: 'Specified category does not exist.'
        });
      }

      const farmerId = req.user.id;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

      const insertProd = db.prepare(`
        INSERT INTO products (farmer_id, category_id, name, slug, description, price, unit, image_url, location, is_available, is_approved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
      `).run(
        farmerId,
        categoryId,
        name.trim(),
        slug,
        description || '',
        parseFloat(price),
        unit || 'kg',
        imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
        location.trim()
      );

      const productId = Number(insertProd.lastInsertRowid);

      // Initialize inventory
      const initialStock = Math.max(0, parseInt(quantity, 10) || 0);
      const threshold = Math.max(1, parseInt(lowStockThreshold, 10) || 10);

      db.prepare(`
        INSERT INTO inventories (product_id, quantity, reserved_quantity, low_stock_threshold)
        VALUES (?, ?, 0, ?)
      `).run(productId, initialStock, threshold);

      // Notification
      notificationService.create({
        userId: farmerId,
        title: 'Product Published',
        message: `Your agricultural product '${name}' is now live on the AGRISHOP marketplace.`,
        type: 'success',
        link: `/products/${productId}`
      });

      const newProduct = db.prepare(`
        SELECT p.*, c.name AS category_name, i.quantity AS stock_quantity
        FROM products p
        JOIN categories c ON p.category_id = c.id
        JOIN inventories i ON p.id = i.product_id
        WHERE p.id = ?
      `).get(productId);

      return res.status(201).json({
        success: true,
        message: 'Agricultural product published successfully.',
        product: newProduct
      });
    } catch (error) {
      next(error);
    }
  },

  updateProduct(req, res, next) {
    try {
      const productId = parseInt(req.params.id, 10);
      const {
        name,
        categoryId,
        description,
        price,
        unit,
        imageUrl,
        location,
        isAvailable,
        quantity,
        lowStockThreshold
      } = req.body;

      const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      // Check ownership: must be the owning farmer or an administrator
      if (req.user.role !== 'ADMINISTRATOR' && existing.farmer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update products from your own farm.'
        });
      }

      db.prepare(`
        UPDATE products
        SET name = COALESCE(?, name),
            category_id = COALESCE(?, category_id),
            description = COALESCE(?, description),
            price = COALESCE(?, price),
            unit = COALESCE(?, unit),
            image_url = COALESCE(?, image_url),
            location = COALESCE(?, location),
            is_available = COALESCE(?, is_available),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        name ? name.trim() : null,
        categoryId ? parseInt(categoryId, 10) : null,
        description !== undefined ? description : null,
        price !== undefined ? parseFloat(price) : null,
        unit ? unit.trim() : null,
        imageUrl ? imageUrl.trim() : null,
        location ? location.trim() : null,
        isAvailable !== undefined ? (isAvailable ? 1 : 0) : null,
        productId
      );

      // Update inventory if supplied
      if (quantity !== undefined || lowStockThreshold !== undefined) {
        db.prepare(`
          UPDATE inventories
          SET quantity = COALESCE(?, quantity),
              low_stock_threshold = COALESCE(?, low_stock_threshold),
              last_restocked_at = CURRENT_TIMESTAMP
          WHERE product_id = ?
        `).run(
          quantity !== undefined ? Math.max(0, parseInt(quantity, 10)) : null,
          lowStockThreshold !== undefined ? Math.max(1, parseInt(lowStockThreshold, 10)) : null,
          productId
        );
      }

      const updated = db.prepare(`
        SELECT p.*, c.name AS category_name, i.quantity AS stock_quantity, i.low_stock_threshold
        FROM products p
        JOIN categories c ON p.category_id = c.id
        JOIN inventories i ON p.id = i.product_id
        WHERE p.id = ?
      `).get(productId);

      return res.json({
        success: true,
        message: 'Product updated successfully.',
        product: updated
      });
    } catch (error) {
      next(error);
    }
  },

  deleteProduct(req, res, next) {
    try {
      const productId = parseInt(req.params.id, 10);
      const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      if (req.user.role !== 'ADMINISTRATOR' && existing.farmer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete products from your own farm.'
        });
      }

      db.prepare('DELETE FROM inventories WHERE product_id = ?').run(productId);
      db.prepare('DELETE FROM reviews WHERE product_id = ?').run(productId);
      db.prepare('DELETE FROM products WHERE id = ?').run(productId);

      return res.json({
        success: true,
        message: `Product '${existing.name}' has been successfully deleted.`
      });
    } catch (error) {
      next(error);
    }
  },

  toggleAvailability(req, res, next) {
    try {
      const productId = parseInt(req.params.id, 10);
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      if (req.user.role !== 'ADMINISTRATOR' && product.farmer_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const newStatus = product.is_available === 1 ? 0 : 1;
      db.prepare('UPDATE products SET is_available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStatus, productId);

      return res.json({
        success: true,
        message: `Product is now marked as ${newStatus === 1 ? 'Available' : 'Unavailable'}.`,
        isAvailable: newStatus === 1
      });
    } catch (error) {
      next(error);
    }
  },

  uploadImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file uploaded.' });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      return res.json({
        success: true,
        imageUrl
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = productController;
