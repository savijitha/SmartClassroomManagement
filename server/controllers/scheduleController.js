const Schedule = require('../models/Schedule');
const Class = require('../models/Class');

const createSchedule = async (req, res) => {
  try {
    const { classId, startTime, endTime, days, room, alertBefore } = req.body;

    // Verify class belongs to teacher
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (classData.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const schedule = await Schedule.create({
      teacherId: req.user.id,
      classId,
      className: classData.name,
      startTime,
      endTime,
      days,
      room,
      alertBefore: alertBefore || 5
    });

    res.status(201).json(schedule);
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
};

const getMySchedules = async (req, res) => {
  try {
    const schedules = await Schedule.getByTeacherId(req.user.id);
    res.json(schedules);
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify ownership (implement proper check)
    await db.ref(`schedules/${id}`).update(updates);
    res.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
};

module.exports = {
  createSchedule,
  getMySchedules,
  updateSchedule
};