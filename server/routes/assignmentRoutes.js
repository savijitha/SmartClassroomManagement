const express = require('express');
const { authenticate, authorizeTeacher, authorizeStudent } = require('../middleware/auth');
const {
  createAssignment,
  getClassAssignments,
  submitAssignment,
  gradeAssignment
} = require('../controllers/assignmentController');
const router = express.Router();

router.post('/', authenticate, authorizeTeacher, createAssignment);
router.get('/class/:classId', authenticate, getClassAssignments);
router.post('/:id/submit', authenticate, authorizeStudent, submitAssignment);
router.post('/:id/grade', authenticate, authorizeTeacher, gradeAssignment);

module.exports = router;