const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { requireAuth, requireRole } = require('../middleware/auth');
const { createHiveCase } = require('../services/hiveService');



// Get all tickets (Manager sees all, Analyst sees assigned)
router.get('/', requireAuth, async (req, res) => {
  if (req.user.role === 'manager') {
    const tickets = await Ticket.find().populate('assignee createdBy');
    return res.json(tickets);
  }
  const tickets = await Ticket.find({ assignee: req.user._id });
  res.json(tickets);
});

// Create ticket (Manager only)
router.post('/', requireRole('manager'), async (req, res) => {
  try {
    const sanitizeHtml = require('sanitize-html');
    const cleanDescription = sanitizeHtml(req.body.description, {
      allowedTags: [],
      allowedAttributes: {}
    });
    
    const ticket = new Ticket({ ...req.body, description: cleanDescription, createdBy: req.user._id });
    
    // Create TheHive case
    const hiveCaseId = await createHiveCase(req.body);
    if (hiveCaseId) ticket.hiveCaseId = hiveCaseId;
    
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Ticket creation failed' });
  }
});

// Update ticket (Different permissions based on role)
router.put('/:id', requireAuth, async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  
  if (req.user.role === 'analyst') {
    if (!ticket.assignee.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not assigned to this ticket' });
    }
    if (req.body.status === 'Closed') {
      return res.status(403).json({ message: 'Analysts cannot close tickets' });
    }
    ticket.progress = req.body.progress;
    ticket.status = req.body.status;
    if (req.body.status === 'Pending Closure') {
      ticket.needsManagerConfirmation = true;
    }
  } else {
    if (req.body.status === 'Closed') {
      ticket.needsManagerConfirmation = false;
    }
    Object.assign(ticket, req.body);
  }
  
  await ticket.save();
  res.json(ticket);
});

// Delete ticket (Manager only)
router.delete('/:id', requireRole('manager'), async (req, res) => {
  await Ticket.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

module.exports = router;