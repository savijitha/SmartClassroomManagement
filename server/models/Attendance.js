const { db } = require('../config/firebase');

class Attendance {
  constructor(data) {
    this.id = data.id;
    this.classId = data.classId;
    this.studentId = data.studentId;
    this.date = data.date;
    this.status = data.status; // 'present', 'absent', 'late'
    this.markedBy = data.markedBy; // teacherId
    this.markedAt = data.markedAt || new Date().toISOString();
  }

  static async mark(data) {
  try {
    // Check if attendance already marked for this student on this date
    const snapshot = await db.ref('attendance')
      .orderByChild('studentId_date')
      .equalTo(`${data.studentId}_${data.date}`)
      .once('value');
    
    const existing = snapshot.val();
    if (existing) {
      // Update existing
      const id = Object.keys(existing)[0];
      await db.ref(`attendance/${id}`).update({
        status: data.status,
        markedBy: data.markedBy,
        markedAt: new Date().toISOString()
      });
      return { id, ...data };
    } else {
      // Create new
      const ref = db.ref('attendance').push();
      const id = ref.key;
      const attendance = { 
        id, 
        ...data, 
        studentId_date: `${data.studentId}_${data.date}`,
        classId_date: `${data.classId}_${data.date}`,
        markedAt: new Date().toISOString() 
      };
      await ref.set(attendance);
      return attendance;
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
}

  static async getByClassAndDate(classId, date) {
    const snapshot = await db.ref('attendance')
      .orderByChild('classId_date')
      .equalTo(`${classId}_${date}`)
      .once('value');
    const records = snapshot.val();
    if (!records) return [];
    return Object.keys(records).map(id => new Attendance({ id, ...records[id] }));
  }

  static async getByStudent(studentId) {
    const snapshot = await db.ref('attendance')
      .orderByChild('studentId')
      .equalTo(studentId)
      .once('value');
    const records = snapshot.val();
    if (!records) return [];
    return Object.keys(records).map(id => new Attendance({ id, ...records[id] }));
  }
}

module.exports = Attendance;