const Customer = require('../models/Customer');

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ organizationId: req.user.id });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getCustomerByCustId = async (req, res) => {
  try {
    const customer = await Customer.findOne({ 
      organizationId: req.user.id,
      Customer_ID: req.params.id.toUpperCase()
    });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
