import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

// Save timetable entry to Firestore
export const saveTimetableToFirestore = async (timetableData) => {
  try {
    const docRef = await addDoc(collection(db, 'timetables'), {
      ...timetableData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving timetable:', error);
    throw error;
  }
};

// Get timetable for a specific class
export const getClassTimetable = async (classId) => {
  try {
    const q = query(
      collection(db, 'timetables'),
      where('classId', '==', classId),
      orderBy('day'),
      orderBy('startTime')
    );
    
    const querySnapshot = await getDocs(q);
    const timetable = [];
    querySnapshot.forEach((doc) => {
      timetable.push({ id: doc.id, ...doc.data() });
    });
    
    // Group by day
    const groupedByDay = timetable.reduce((acc, item) => {
      if (!acc[item.day]) {
        acc[item.day] = [];
      }
      acc[item.day].push(item);
      return acc;
    }, {});
    
    return groupedByDay;
  } catch (error) {
    console.error('Error fetching timetable:', error);
    throw error;
  }
};

// Get today's classes
export const getTodaysClasses = async (classId) => {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    
    const q = query(
      collection(db, 'timetables'),
      where('classId', '==', classId),
      where('day', '==', today),
      orderBy('startTime')
    );
    
    const querySnapshot = await getDocs(q);
    const classes = [];
    querySnapshot.forEach((doc) => {
      classes.push({ id: doc.id, ...doc.data() });
    });
    
    return classes;
  } catch (error) {
    console.error('Error fetching today\'s classes:', error);
    throw error;
  }
};