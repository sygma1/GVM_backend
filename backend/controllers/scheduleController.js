const service = require('../services/scheduleService');

// Format a Schedule document into a frontend-friendly object
const formatSchedule = (s) => ({
  id: s.schedualId,
  name: s.name,
  comment: s.comment || '',
  startDate: s.startDate,
  finishDate: s.finishDate,
  createdAt: s.createdAt,
  updatedAt: s.updatedAt,
});

// Create Schedule
exports.create = async (req, res) => {
  try {
    const schedule = await service.createSchedule(req.body);
    res.json({
      success: true,
      id: schedule.schedualId,
      message: 'Schedule created successfully',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Schedules
exports.getAll = async (_req, res) => {
  try {
    const schedules = await service.getSchedules();
    res.json(schedules.map(formatSchedule));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get One Schedule
exports.getOne = async (req, res) => {
  try {
    const schedule = await service.getSchedule(req.params.id);
    res.json(formatSchedule(schedule));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Schedule
exports.update = async (req, res) => {
  try {
    const updated = await service.updateSchedule(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Schedule updated successfully',
      updated: formatSchedule(updated),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Schedule
exports.remove = async (req, res) => {
  try {
    const deleted = await service.deleteSchedule(req.params.id);
    res.json({
      success: true,
      message: 'Schedule deleted successfully',
      deletedId: deleted.schedualId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
