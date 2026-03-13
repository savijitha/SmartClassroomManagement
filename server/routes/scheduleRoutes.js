const express = require('express');
const { authenticate, authorizeTeacher } = require('../middleware/auth');
const {
  createSchedule,
  getMySchedules,
  updateSchedule
} = require('../controllers/scheduleController');
const router = express.Router();

router.post('/', authenticate, authorizeTeacher, createSchedule);
router.get('/', authenticate, authorizeTeacher, getMySchedules);
router.put('/:id', authenticate, authorizeTeacher, updateSchedule);

module.exports = router;