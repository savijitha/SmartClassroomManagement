const { db } = require('../config/firebase');

class Assignment {
  constructor(data) {
    this.id = data.id;
    this.classId = data.classId;
    this.title = data.title;
    this.description = data.description;
    this.dueDate = data.dueDate;
    this.createdBy = data.createdBy; // teacherId
    this.createdAt = data.createdAt || new Date().toISOString();
    this.submissions = data.submissions || [];
  }

  static async create(assignmentData) {
    const ref = db.ref('assignments').push();
    const id = ref.key;
    const assignment = { id, ...assignmentData, submissions: [], createdAt: new Date().toISOString() };
    await ref.set(assignment);
    return new Assignment(assignment);
  }

  static async findById(id) {
    const snapshot = await db.ref(`assignments/${id}`).once('value');
    const assignment = snapshot.val();
    return assignment ? new Assignment({ id, ...assignment }) : null;
  }

  static async getByClassId(classId) {
    const snapshot = await db.ref('assignments').orderByChild('classId').equalTo(classId).once('value');
    const assignments = snapshot.val();
    if (!assignments) return [];
    return Object.keys(assignments).map(id => new Assignment({ id, ...assignments[id] }));
  }

  async submit(studentId, submissionText) {
    const submission = {
      studentId,
      submissionText,
      submittedAt: new Date().toISOString(),
      grade: null
    };
    
    this.submissions.push(submission);
    await db.ref(`assignments/${this.id}`).update({ submissions: this.submissions });
    return submission;
  }

  async gradeSubmission(studentId, grade) {
    const submissionIndex = this.submissions.findIndex(s => s.studentId === studentId);
    if (submissionIndex >= 0) {
      this.submissions[submissionIndex].grade = grade;
      await db.ref(`assignments/${this.id}`).update({ submissions: this.submissions });
    }
    return this;
  }
}

module.exports = Assignment;