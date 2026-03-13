const express = require('express');
const { authenticate, authorizeTeacher } = require('../middleware/auth');
const {
  markAttendance,
  getAttendanceByClassAndDate,
  getMyAttendance
} = require('../controllers/attendanceController');
const router = express.Router();

router.post('/mark', authenticate, authorizeTeacher, markAttendance);
router.get('/class/:classId/date/:date', authenticate, getAttendanceByClassAndDate);
router.get('/my-attendance', authenticate, getMyAttendance);

module.exports = router;