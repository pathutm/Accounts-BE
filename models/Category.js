const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  type: String,
  label: String,
  behavior: String,
  risk: String,
  strategy: {
    title: String,
    action: String
  },
  outcome: {
    best_case: String,
    worst_case: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
