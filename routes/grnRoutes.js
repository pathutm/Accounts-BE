const express = require('express');
const router = express.Router();
const grnController = require('../controllers/grnController');

const auth = require('../middleware/auth');

// Webhook endpoint (Public or Secured by other means)
router.post('/webhook', grnController.createFromWebhook);

// List all GRNs (Secured)
router.get('/', auth, grnController.getGRNs);

module.exports = router;
