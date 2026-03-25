const Organization = require('../models/Organization');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const org = await Organization.findOne({ email });
    if (!org) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, org.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: org._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, org: { id: org._id, name: org.name, email: org.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
