const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'organization' },
  profile: {
    address: { type: String, default: 'SNS Kalvinagar, Valliyampalayam' },
    city: { type: String, default: 'Coimbatore' },
    state: { type: String, default: 'Tamil Nadu' },
    country: { type: String, default: 'India' },
    postal_code: { type: String, default: '641035' },
    phone: String,
    website: String,
    logo_url: String,
    tax_id: String // GSTIN
  }
}, { timestamps: true });

module.exports = mongoose.model('Organization', OrganizationSchema);
