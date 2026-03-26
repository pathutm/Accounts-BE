const Budget = require('../models/Budget');

exports.getBudgets = async (req, res) => {
  try {
    const organizationId = req.user.id;
    const budgets = await Budget.find({ organizationId });
    res.json(budgets);
  } catch (err) {
    console.error('Error fetching budgets:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBudgetByCategory = async (req, res) => {
  try {
    const organizationId = req.user.id;
    const { category } = req.params;
    
    // Find active budget for current fiscal year and category
    const budget = await Budget.findOne({ 
      organizationId, 
      category,
      status: 'ACTIVE' 
    }).sort({ created_at: -1 }); // Get latest active budget
    
    if (!budget) {
      return res.status(404).json({ message: 'No active budget found for this category' });
    }
    
    res.json(budget);
  } catch (err) {
    console.error('Error fetching budget by category:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
