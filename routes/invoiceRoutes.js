const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middleware/auth');

router.get('/', auth, invoiceController.getInvoices);
router.post('/', auth, invoiceController.createInvoice);

module.exports = router;
