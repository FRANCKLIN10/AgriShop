const bcrypt = require('bcryptjs');
const db = require('../config/database');

const userController = {
  getProfile(req, res, next) {
    try {
      const user = db.prepare(`
        SELECT id, name, email, role, phone, address, city, avatar_url, is_active, created_at, updated_at
        FROM users WHERE id = ?
      `).get(req.user.id);

      let farmerProfile = null;
      if (user.role === 'FARMER') {
        farmerProfile = db.prepare('SELECT * FROM farmer_profiles WHERE user_id = ?').get(user.id);
      }

      return res.json({
        success: true,
        user: {
          ...user,
          farmerProfile
        }
      });
    } catch (error) {
      next(error);
    }
  },

  updateProfile(req, res, next) {
    try {
      const { name, phone, address, city, avatarUrl, farmName, farmLocation, specialization, farmSize } = req.body;

      db.prepare(`
        UPDATE users
        SET name = COALESCE(?, name),
            phone = COALESCE(?, phone),
            address = COALESCE(?, address),
            city = COALESCE(?, city),
            avatar_url = COALESCE(?, avatar_url),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        name ? name.trim() : null,
        phone ? phone.trim() : null,
        address ? address.trim() : null,
        city ? city.trim() : null,
        avatarUrl ? avatarUrl.trim() : null,
        req.user.id
      );

      // If user is a farmer, allow updating farm details
      if (req.user.role === 'FARMER' && (farmName || farmLocation || specialization || farmSize)) {
        db.prepare(`
          UPDATE farmer_profiles
          SET farm_name = COALESCE(?, farm_name),
              farm_location = COALESCE(?, farm_location),
              farm_size = COALESCE(?, farm_size),
              specialization = COALESCE(?, specialization)
          WHERE user_id = ?
        `).run(
          farmName || null,
          farmLocation || null,
          farmSize || null,
          specialization || null,
          req.user.id
        );
      }

      const updatedUser = db.prepare(`
        SELECT id, name, email, role, phone, address, city, avatar_url, is_active, created_at, updated_at
        FROM users WHERE id = ?
      `).get(req.user.id);

      let farmerProfile = null;
      if (updatedUser.role === 'FARMER') {
        farmerProfile = db.prepare('SELECT * FROM farmer_profiles WHERE user_id = ?').get(req.user.id);
      }

      return res.json({
        success: true,
        message: 'Profile details updated successfully.',
        user: {
          ...updatedUser,
          farmerProfile
        }
      });
    } catch (error) {
      next(error);
    }
  },

  changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Both current password and new password are required.'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters in length.'
        });
      }

      const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
      const isMatch = bcrypt.compareSync(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect.'
        });
      }

      const newHash = bcrypt.hashSync(newPassword, 10);
      db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, req.user.id);

      return res.json({
        success: true,
        message: 'Password changed successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file uploaded.'
        });
      }

      const avatarUrl = `/uploads/${req.file.filename}`;
      db.prepare('UPDATE users SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(avatarUrl, req.user.id);

      return res.json({
        success: true,
        message: 'Profile picture uploaded successfully.',
        avatarUrl
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
