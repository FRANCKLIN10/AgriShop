const db = require('../config/database');

const notificationService = {
  create({ userId, title, message, type = 'info', link = null }) {
    try {
      const stmt = db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
      `);
      return stmt.run(userId, title, message, type, link);
    } catch (err) {
      console.error('Failed to create notification:', err.message);
      return null;
    }
  },

  notifyAdmins({ title, message, type = 'info', link = null }) {
    try {
      const admins = db.prepare("SELECT id FROM users WHERE role = 'ADMINISTRATOR' AND is_active = 1").all();
      for (const admin of admins) {
        this.create({ userId: admin.id, title, message, type, link });
      }
    } catch (err) {
      console.error('Failed to notify admins:', err.message);
    }
  }
};

module.exports = notificationService;
