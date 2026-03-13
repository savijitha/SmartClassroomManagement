const Attendance = require('../models/Attendance');
const Class = require('../models/Class');

const markAttendance = async (req, res) => {
  try {
    const { classId, date, records } = req.body;

    // Validate input
    if (!classId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Invalid attendance data' });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check if user is the teacher of this class
    if (classData.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to mark attendance for this class' });
    }

    const attendanceRecords = [];
    for (const record of records) {
      if (!record.studentId || !record.status) {
        continue; // Skip invalid records
      }
      
      const attendance = await Attendance.mark({
        classId,
        studentId: record.studentId,
        date,
        status: record.status,
        markedBy: req.user.id
      });
      attendanceRecords.push(attendance);
    }

    res.json({ 
      message: 'Attendance marked successfully', 
      records: attendanceRecords 
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

const getAttendanceByClassAndDate = async (req, res) => {
  try {
    const { classId, date } = req.params;
    const attendance = await Attendance.getByClassAndDate(classId, date);
    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.getByStudent(req.user.id);
    res.json(attendance);
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

module.exports = {
  markAttendance,
  getAttendanceByClassAndDate,
  getMyAttendance
};