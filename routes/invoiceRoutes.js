const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middleware/auth');

router.get('/', auth, invoiceController.getInvoices);

module.exports = router;
