const express = require('express');
const { authenticate, authorizeTeacher } = require('../middleware/auth');
const {
  createClass,
  getMyClasses,
  getClassById,
  enrollStudent,
  getTeachers,
  getClassStudents  // ✅ ADDED: Import the new controller function
} = require('../controllers/classController');
const router = express.Router();

router.get('/teachers', authenticate, getTeachers);
router.post('/', authenticate, authorizeTeacher, createClass);
router.get('/', authenticate, getMyClasses);
router.get('/:id', authenticate, getClassById);
router.post('/:id/enroll', authenticate, authorizeTeacher, enrollStudent);
router.post('/:id/enroll', authenticate, enrollStudent);
// ✅ ADDED: New route to get students in a class
router.get('/:id/students', authenticate, getClassStudents);

module.exports = router;