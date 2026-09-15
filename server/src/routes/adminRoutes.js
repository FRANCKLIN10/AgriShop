const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard-stats', adminController.getDashboardStats);

// Users
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Farmers
router.get('/farmers', adminController.getFarmers);
router.put('/farmers/:id/validate', adminController.validateFarmer);

// Products & Categories
router.get('/products', adminController.getAllAdminProducts);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Orders & Transactions
router.get('/orders', adminController.getAllOrders);
router.get('/transactions', adminController.getTransactions);

module.exports = router;
