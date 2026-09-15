const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:productId/reviews', reviewController.getProductReviews);
router.post('/:productId/reviews', authMiddleware, reviewController.createReview);

module.exports = router;
