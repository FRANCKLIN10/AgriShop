const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', orderController.placeOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/history', orderController.getOrderHistory);
router.get('/farmer-incoming', orderController.getFarmerIncomingOrders);
router.get('/:id', orderController.getOrderDetails);
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
