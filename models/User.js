const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'vendor', 'organization'],
    required: true,
    default: 'organization'
  },
  organizationId: { type: String }, // For 'organization' role or 'vendor' linked to org
  vendorId: { type: String } // Only for 'vendor' role
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
