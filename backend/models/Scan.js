const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  target: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['instant', 'scheduled']
  },
  results: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scan', scanSchema);