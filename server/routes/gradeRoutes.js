const express = require('express');
const { authenticate, authorizeTeacher } = require('../middleware/auth');
const {
  addGrade,
  getMyGrades,
  getClassGrades
} = require('../controllers/gradeController');
const router = express.Router();

router.post('/', authenticate, authorizeTeacher, addGrade);
router.get('/my-grades', authenticate, getMyGrades);
router.get('/class/:classId', authenticate, getClassGrades);

module.exports = router;