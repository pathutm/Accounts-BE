const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const auth = require('../middleware/auth');

// Get organization by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    res.json(org);
  } catch (err) {
    console.error('Error fetching organization:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user's organization
router.get('/me/profile', auth, async (req, res) => {
  try {
    const org = await Organization.findById(req.user.id);
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    res.json(org);
  } catch (err) {
    console.error('Error fetching current organization:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
