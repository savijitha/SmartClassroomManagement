const { db } = require('../config/firebase');

class Schedule {
  constructor(data) {
    this.id = data.id;
    this.teacherId = data.teacherId;
    this.classId = data.classId;
    this.className = data.className;
    this.startTime = data.startTime; // "10:00"
    this.endTime = data.endTime; // "11:30"
    this.days = data.days || []; // ["Monday", "Wednesday"]
    this.room = data.room || '';
    this.alertBefore = data.alertBefore || 5; // minutes before class
    this.lastAlerted = data.lastAlerted || null;
    this.isActive = data.isActive !== false;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  static async create(scheduleData) {
    const ref = db.ref('schedules').push();
    const id = ref.key;
    const schedule = { id, ...scheduleData, createdAt: new Date().toISOString() };
    await ref.set(schedule);
    return new Schedule(schedule);
  }

  static async getByTeacherId(teacherId) {
    const snapshot = await db.ref('schedules')
      .orderByChild('teacherId')
      .equalTo(teacherId)
      .once('value');
    const schedules = snapshot.val();
    if (!schedules) return [];
    return Object.keys(schedules).map(id => new Schedule({ id, ...schedules[id] }));
  }

  static async getByClassId(classId) {
    const snapshot = await db.ref('schedules')
      .orderByChild('classId')
      .equalTo(classId)
      .once('value');
    const schedules = snapshot.val();
    if (!schedules) return [];
    return Object.keys(schedules).map(id => new Schedule({ id, ...schedules[id] }));
  }

  static async updateLastAlerted(id) {
    await db.ref(`schedules/${id}`).update({
      lastAlerted: new Date().toISOString()
    });
  }
}

module.exports = Schedule;