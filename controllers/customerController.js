const Customer = require('../models/Customer');

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ organizationId: req.user.id });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
