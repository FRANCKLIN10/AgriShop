const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireApprovedFarmer } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public Marketplace routes
router.get('/categories', productController.getCategories);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected Farmer / Admin routes
router.post('/', authMiddleware, requireApprovedFarmer, productController.createProduct);
router.put('/:id', authMiddleware, requireApprovedFarmer, productController.updateProduct);
router.delete('/:id', authMiddleware, requireApprovedFarmer, productController.deleteProduct);
router.put('/:id/availability', authMiddleware, requireApprovedFarmer, productController.toggleAvailability);
router.post('/upload', authMiddleware, requireApprovedFarmer, upload.single('image'), productController.uploadImage);

module.exports = router;
