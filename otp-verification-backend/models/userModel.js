// models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Student', 'Faculty'],
    default: 'Student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});
module.exports = mongoose.model('User', userSchema);