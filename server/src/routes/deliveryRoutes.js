const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const authMiddleware = require('../middlewares/authMiddleware');
const { hasRole } = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.use(hasRole('DELIVERY_SERVICE', 'ADMINISTRATOR'));

router.get('/requests', deliveryController.getDeliveryRequests);
router.get('/assigned', deliveryController.getAssignedDeliveries);
router.get('/history', deliveryController.getDeliveryHistory);
router.get('/:id', deliveryController.getDeliveryDetails);
router.put('/:id/accept', deliveryController.acceptDelivery);
router.put('/:id/status', deliveryController.updateDeliveryStatus);

module.exports = router;
