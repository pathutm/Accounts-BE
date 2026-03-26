const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const auth = require('../middleware/auth');

router.get('/', auth, budgetController.getBudgets);
router.get('/category/:category', auth, budgetController.getBudgetByCategory);

module.exports = router;
