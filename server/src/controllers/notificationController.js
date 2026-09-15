const db = require('../config/database');

const notificationController = {
  getNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const notifications = db.prepare(`
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `).all(userId);

      const unreadCount = db.prepare(`
        SELECT COUNT(*) AS count
        FROM notifications
        WHERE user_id = ? AND is_read = 0
      `).get(userId).count;

      return res.json({
        success: true,
        unreadCount,
        notifications
      });
    } catch (error) {
      next(error);
    }
  },

  markAsRead(req, res, next) {
    try {
      const notificationId = parseInt(req.params.id, 10);
      db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(notificationId, req.user.id);

      return res.json({
        success: true,
        message: 'Notification marked as read.'
      });
    } catch (error) {
      next(error);
    }
  },

  markAllAsRead(req, res, next) {
    try {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);

      return res.json({
        success: true,
        message: 'All notifications marked as read.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = notificationController;
