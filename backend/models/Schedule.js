// models/Schedule.js
const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  schedualId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    required: true
  },
  finishDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Schedule', scheduleSchema);
