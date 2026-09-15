const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireApprovedFarmer } = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

router.get('/', requireApprovedFarmer, inventoryController.getFarmerInventory);
router.put('/:productId', requireApprovedFarmer, inventoryController.updateStock);

module.exports = router;
