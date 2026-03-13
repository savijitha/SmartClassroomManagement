const Assignment = require('../models/Assignment');
const Class = require('../models/Class');

const createAssignment = async (req, res) => {
  try {
    const { classId, title, description, dueDate } = req.body;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (classData.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to create assignments for this class' });
    }

    const assignment = await Assignment.create({
      classId,
      title,
      description,
      dueDate,
      createdBy: req.user.id
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

const getClassAssignments = async (req, res) => {
  try {
    const { classId } = req.params;
    const assignments = await Assignment.getByClassId(classId);
    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { submissionText } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    await assignment.submit(req.user.id, submissionText);
    res.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
};

const gradeAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, grade } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const classData = await Class.findById(assignment.classId);
    if (classData.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to grade this assignment' });
    }

    await assignment.gradeSubmission(studentId, grade);
    res.json({ message: 'Assignment graded successfully' });
  } catch (error) {
    console.error('Grade assignment error:', error);
    res.status(500).json({ error: 'Failed to grade assignment' });
  }
};

module.exports = {
  createAssignment,
  getClassAssignments,
  submitAssignment,
  gradeAssignment
};