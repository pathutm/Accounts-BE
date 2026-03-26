const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const auth = require('../middleware/auth');

router.get('/', auth, vendorController.getVendors);

module.exports = router;
