const { db } = require('../config/firebase');

class Grade {
  constructor(data) {
    this.id = data.id;
    this.studentId = data.studentId;
    this.classId = data.classId;
    this.assignmentId = data.assignmentId;
    this.score = data.score;
    this.maxScore = data.maxScore;
    this.comments = data.comments;
    this.gradedBy = data.gradedBy; // teacherId
    this.gradedAt = data.gradedAt || new Date().toISOString();
  }

  static async create(gradeData) {
    const ref = db.ref('grades').push();
    const id = ref.key;
    const grade = { id, ...gradeData, gradedAt: new Date().toISOString() };
    await ref.set(grade);
    return new Grade(grade);
  }

  static async getByStudentId(studentId) {
    const snapshot = await db.ref('grades').orderByChild('studentId').equalTo(studentId).once('value');
    const grades = snapshot.val();
    if (!grades) return [];
    return Object.keys(grades).map(id => new Grade({ id, ...grades[id] }));
  }

  static async getByClassId(classId) {
    const snapshot = await db.ref('grades').orderByChild('classId').equalTo(classId).once('value');
    const grades = snapshot.val();
    if (!grades) return [];
    return Object.keys(grades).map(id => new Grade({ id, ...grades[id] }));
  }

  static async getByAssignmentId(assignmentId) {
    const snapshot = await db.ref('grades').orderByChild('assignmentId').equalTo(assignmentId).once('value');
    const grades = snapshot.val();
    if (!grades) return [];
    return Object.keys(grades).map(id => new Grade({ id, ...grades[id] }));
  }
}

module.exports = Grade;