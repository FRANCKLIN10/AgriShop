const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', paymentController.makePayment);
router.get('/:id', paymentController.getPaymentDetails);

module.exports = router;
