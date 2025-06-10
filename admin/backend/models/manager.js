const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String
  },
  status: {
  type: String,
  enum: ['online', 'offline', 'inactive', 'active'], // ✅ Add allowed values
  default: 'offline'
}

}, { timestamps: true });

module.exports = mongoose.model('Manager', managerSchema);