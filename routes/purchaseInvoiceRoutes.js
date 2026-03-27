const express = require('express');
const router = express.Router();
const purchaseInvoiceController = require('../controllers/purchaseInvoiceController');
const auth = require('../middleware/auth');

// Get all invoices for the authenticated vendor/organization
router.get('/', auth, purchaseInvoiceController.getVendorInvoices);

// Get single invoice by ID
router.get('/:id', auth, purchaseInvoiceController.getInvoiceById);

module.exports = router;
