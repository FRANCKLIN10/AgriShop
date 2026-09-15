const db = require('../config/database');

const reviewController = {
  createReview(req, res, next) {
    try {
      const productId = parseInt(req.params.productId, 10);
      const { rating, comment } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be a whole number between 1 and 5.'
        });
      }

      const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      const insert = db.prepare(`
        INSERT INTO reviews (product_id, user_id, rating, comment, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(productId, req.user.id, parseInt(rating, 10), comment || '');

      const newReview = db.prepare(`
        SELECT r.*, u.name AS user_name, u.avatar_url AS user_avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
      `).get(insert.lastInsertRowid);

      return res.status(201).json({
        success: true,
        message: 'Review posted successfully.',
        review: newReview
      });
    } catch (error) {
      next(error);
    }
  },

  getProductReviews(req, res, next) {
    try {
      const productId = parseInt(req.params.productId, 10);
      const reviews = db.prepare(`
        SELECT r.*, u.name AS user_name, u.avatar_url AS user_avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
      `).all(productId);

      return res.json({
        success: true,
        reviews
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = reviewController;
