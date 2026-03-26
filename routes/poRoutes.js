const express = require('express');
const router = express.Router();
const poController = require('../controllers/poController');
const auth = require('../middleware/auth');

router.post('/', auth, poController.createPO);
router.get('/', auth, poController.getPOs);
router.get('/:id', auth, poController.getPOById);

module.exports = router;
