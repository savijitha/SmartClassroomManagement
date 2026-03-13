const { db } = require('../config/firebase');

class Class {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.teacherId = data.teacherId;
    this.teacherName = data.teacherName;
    this.description = data.description;
    this.schedule = data.schedule;
    this.students = data.students || [];
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  static async create(classData) {
    const ref = db.ref('classes').push();
    const id = ref.key;
    const newClass = { id, ...classData, students: [], createdAt: new Date().toISOString() };
    await ref.set(newClass);
    return new Class(newClass);
  }

  static async findById(id) {
    const snapshot = await db.ref(`classes/${id}`).once('value');
    const classData = snapshot.val();
    return classData ? new Class({ id, ...classData }) : null;
  }

  static async getByTeacherId(teacherId) {
    const snapshot = await db.ref('classes').orderByChild('teacherId').equalTo(teacherId).once('value');
    const classes = snapshot.val();
    if (!classes) return [];
    return Object.keys(classes).map(id => new Class({ id, ...classes[id] }));
  }

  static async getByStudentId(studentId) {
    const snapshot = await db.ref('classes').once('value');
    const classes = snapshot.val();
    if (!classes) return [];
    
    return Object.keys(classes)
      .filter(id => classes[id].students && classes[id].students.includes(studentId))
      .map(id => new Class({ id, ...classes[id] }));
  }

  async addStudent(studentId) {
    if (!this.students.includes(studentId)) {
      this.students.push(studentId);
      await db.ref(`classes/${this.id}`).update({ students: this.students });
    }
    return this;
  }

  async removeStudent(studentId) {
    this.students = this.students.filter(id => id !== studentId);
    await db.ref(`classes/${this.id}`).update({ students: this.students });
    return this;
  }
}

module.exports = Class;