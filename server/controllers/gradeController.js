const Grade = require('../models/Grade');
const Assignment = require('../models/Assignment');
const Class = require('../models/Class');

const addGrade = async (req, res) => {
  try {
    const { studentId, classId, assignmentId, score, maxScore, comments } = req.body;

    const classData = await Class.findById(classId);
    if (!classData || classData.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to add grades for this class' });
    }

    const grade = await Grade.create({
      studentId,
      classId,
      assignmentId,
      score,
      maxScore,
      comments,
      gradedBy: req.user.id
    });

    res.status(201).json(grade);
  } catch (error) {
    console.error('Add grade error:', error);
    res.status(500).json({ error: 'Failed to add grade' });
  }
};

const getMyGrades = async (req, res) => {
  try {
    const grades = await Grade.getByStudentId(req.user.id);
    res.json(grades);
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
};

const getClassGrades = async (req, res) => {
  try {
    const { classId } = req.params;
    const grades = await Grade.getByClassId(classId);
    res.json(grades);
  } catch (error) {
    console.error('Get class grades error:', error);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
};

module.exports = {
  addGrade,
  getMyGrades,
  getClassGrades
};