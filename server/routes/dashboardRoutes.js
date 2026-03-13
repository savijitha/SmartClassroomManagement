const express = require('express');
const { authenticate, authorizeTeacher } = require('../middleware/auth');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const router = express.Router();

// Teacher stats endpoint
router.get('/teacher-stats', authenticate, authorizeTeacher, async (req, res) => {
  try {
    const classes = await Class.getByTeacherId(req.user.id);
    
    let totalStudents = 0;
    let pendingAssignments = 0;
    let todaysClasses = 0;
    
    const today = new Date().toLocaleDateString('en', { weekday: 'long' });
    
    for (const cls of classes) {
      totalStudents += cls.students?.length || 0;
      
      // Check if class is today
      if (cls.schedule && cls.schedule.includes(today)) {
        todaysClasses++;
      }
      
      // Get assignments for this class
      try {
        const assignments = await Assignment.getByClassId(cls.id);
        const now = new Date();
        const pending = assignments.filter(a => new Date(a.dueDate) > now);
        pendingAssignments += pending.length;
      } catch (err) {
        console.log(`No assignments for class ${cls.id}`);
      }
    }
    
    res.json({
      totalClasses: classes.length,
      totalStudents,
      pendingAssignments,
      todaysClasses
    });
  } catch (error) {
    console.error('Teacher stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;