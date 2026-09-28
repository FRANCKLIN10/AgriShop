const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const env = require('../config/env');
const notificationService = require('../services/notificationService');

const authController = {
  register(req, res, next) {
    try {
      const {
        name,
        email,
        password,
        role = 'USER',
        phone,
        address,
        city,
        // Farmer profile fields if role === 'FARMER'
        farmName,
        farmLocation,
        farmSize,
        nationalId,
        specialization
      } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide full name, email address, and a secure password.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters in length.'
        });
      }

      // Disallow self-registering as ADMINISTRATOR
      const allowedRoles = ['USER', 'CUSTOMER', 'SELLER_BUYER', 'FARMER', 'DELIVERY_SERVICE'];
      const targetRole = allowedRoles.includes(role) ? role : 'USER';

      // Check if email is already taken
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please login.'
        });
      }

      const passwordHash = bcrypt.hashSync(password, 10);

      // Insert User
      const userInsert = db.prepare(`
        INSERT INTO users (name, email, password_hash, role, phone, address, city, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `).run(
        name.trim(),
        email.toLowerCase().trim(),
        passwordHash,
        targetRole,
        phone || null,
        address || null,
        city || null
      );

      const userId = Number(userInsert.lastInsertRowid);
      let farmerStatus = null;

      // If registered as FARMER, create pending farmer profile
      if (targetRole === 'FARMER') {
        const fpInsert = db.prepare(`
          INSERT INTO farmer_profiles (user_id, farm_name, farm_location, farm_size, national_id, specialization, status)
          VALUES (?, ?, ?, ?, ?, ?, 'Pending')
        `).run(
          userId,
          farmName || `${name}'s Farm`,
          farmLocation || city || 'Cameroon',
          farmSize || 'Standard Farm',
          nationalId || null,
          specialization || 'General Crops'
        );
        farmerStatus = 'Pending';

        // Notify Admins
        notificationService.notifyAdmins({
          title: 'New Farmer Application',
          message: `${name} has registered a new farm '${farmName || name}' and is waiting for validation.`,
          type: 'farmer',
          link: '/admin/farmers'
        });
      }

      // Welcome Notification for user
      notificationService.create({
        userId,
        title: 'Welcome to AGRISHOP!',
        message: targetRole === 'FARMER'
          ? 'Your farmer account was registered. Our administration will review your farm credentials shortly.'
          : 'Thank you for joining Cameroon\'s premier agricultural marketing platform.',
        type: 'success'
      });

      const token = jwt.sign(
        { id: userId, email, role: targetRole },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );

      const newUser = db.prepare('SELECT id, name, email, role, phone, address, city, avatar_url, created_at FROM users WHERE id = ?').get(userId);

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: {
          ...newUser,
          farmerStatus
        }
      });
    } catch (error) {
      next(error);
    }
  },

  login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both email address and password.'
        });
      }

      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email address or password.'
        });
      }

      if (user.is_active !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please reach out to platform support.'
        });
      }

      const isMatch = bcrypt.compareSync(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email address or password.'
        });
      }

      let farmerProfile = null;
      if (user.role === 'FARMER') {
        farmerProfile = db.prepare('SELECT * FROM farmer_profiles WHERE user_id = ?').get(user.id);
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );

      const { password_hash, ...safeUser } = user;

      return res.json({
        success: true,
        message: 'Logged in successfully.',
        token,
        user: {
          ...safeUser,
          farmerStatus: farmerProfile ? farmerProfile.status : null,
          farmerProfile: farmerProfile || null
        }
      });
    } catch (error) {
      next(error);
    }
  },

  me(req, res, next) {
    try {
      let farmerProfile = null;
      if (req.user.role === 'FARMER') {
        farmerProfile = db.prepare('SELECT * FROM farmer_profiles WHERE user_id = ?').get(req.user.id);
      }

      return res.json({
        success: true,
        user: {
          ...req.user,
          farmerStatus: farmerProfile ? farmerProfile.status : null,
          farmerProfile: farmerProfile || null
        }
      });
    } catch (error) {
      next(error);
    }
  },

  logout(req, res) {
    return res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  }
};

module.exports = authController;
