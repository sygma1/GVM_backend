const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Pending Closure', 'Closed'],
    default: 'Open'
  },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  needsManagerConfirmation: { type: Boolean, default: false },
  hiveCaseId: String // To store TheHive case ID when integrated
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);