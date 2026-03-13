const Class = require('../models/Class');
const User = require('../models/User');

const createClass = async (req, res) => {
  try {
    const { name, description, schedule } = req.body;
    
    const newClass = await Class.create({
      name,
      description,
      schedule,
      teacherId: req.user.id,
      teacherName: req.user.name
    });

    res.status(201).json(newClass);
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
};

const getMyClasses = async (req, res) => {
  try {
    let classes;
    if (req.user.role === 'teacher') {
      classes = await Class.getByTeacherId(req.user.id);
    } else {
      classes = await Class.getByStudentId(req.user.id);
    }
    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};

const getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json(classData);
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ error: 'Failed to fetch class' });
  }
};

const enrollStudent = async (req, res) => {
  try {
    const { studentId } = req.body;  // Can be sent from student dashboard
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Allow两种情况:
    // 1. Teacher enrolling a student (authorized)
    // 2. Student enrolling themselves (self-enrollment)
    const isTeacher = classData.teacherId === req.user.id;
    const isSelfEnrollment = req.user.id === studentId && req.user.role === 'student';

    if (!isTeacher && !isSelfEnrollment) {
      return res.status(403).json({ error: 'Not authorized to enroll in this class' });
    }

    // If it's self-enrollment, studentId must be the current user
    let targetStudentId = studentId;
    if (isSelfEnrollment) {
      targetStudentId = req.user.id;
    }

    const student = await User.findById(targetStudentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    // Check if already enrolled
    if (classData.students && classData.students.includes(targetStudentId)) {
      return res.status(400).json({ error: 'Student already enrolled in this class' });
    }

    await classData.addStudent(targetStudentId);
    res.json({ message: 'Student enrolled successfully' });
  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({ error: 'Failed to enroll student' });
  }
};
// ✅ Define getTeachers BEFORE it's used in exports
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.getAllTeachers();
    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
};

// ✅ Define getClassStudents
const getClassStudents = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Get student details
    const students = [];
    for (const studentId of classData.students || []) {
      const student = await User.findById(studentId);
      if (student) {
        students.push({
          id: student.id,
          name: student.name,
          email: student.email
        });
      }
    }
    
    res.json(students);
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// ✅ SINGLE module.exports at the end with ALL functions
module.exports = {
  createClass,
  getMyClasses,
  getClassById,
  enrollStudent,
  getTeachers,       // Now this works because it's defined above
  getClassStudents   // New function added
};