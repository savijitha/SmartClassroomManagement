const { db } = require('../config/firebase');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.role = data.role; // 'teacher' or 'student'
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  static async create(userData) {
    const ref = db.ref('users').push();
    const id = ref.key;
    const user = { id, ...userData, createdAt: new Date().toISOString() };
    await ref.set(user);
    return new User(user);
  }

  static async findByEmail(email) {
    const snapshot = await db.ref('users').orderByChild('email').equalTo(email).once('value');
    const users = snapshot.val();
    if (!users) return null;
    
    const userId = Object.keys(users)[0];
    return new User({ id: userId, ...users[userId] });
  }

  static async findById(id) {
    const snapshot = await db.ref(`users/${id}`).once('value');
    const user = snapshot.val();
    return user ? new User({ id, ...user }) : null;
  }

  static async getAllTeachers() {
    const snapshot = await db.ref('users').orderByChild('role').equalTo('teacher').once('value');
    const teachers = snapshot.val();
    if (!teachers) return [];
    return Object.keys(teachers).map(id => new User({ id, ...teachers[id] }));
  }
}

module.exports = User;