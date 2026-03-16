import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import TimetableDisplay from './TimetableDisplay';
import TimetableUpload from './TimetableUpload';
import { getClassTimetable } from '../../services/firestoreService';

const TimetablePage = () => {
  const { user, isTeacher } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'upload'

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
      if (response.data.length > 0) {
        setSelectedClass(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    try {
      const data = await getClassTimetable(selectedClass);
      setTimetableData(data);
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
    }
  };

  const selectedClassData = classes.find(c => c.id === selectedClass);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Class Timetable</h1>
          <p style={{ color: 'var(--text-light)' }}>
            View and manage weekly class schedules
          </p>
        </div>
      </div>

      {/* Class Selector */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="form-group">
          <label className="form-label">Select Class</label>
          <select
            className="form-control"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{ maxWidth: '400px' }}
          >
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Teacher Upload Tab (only for teachers) */}
      {isTeacher && (
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{ 
            display: 'flex', 
            gap: 'var(--space-md)', 
            borderBottom: '2px solid var(--border-color)',
            marginBottom: 'var(--space-lg)'
          }}>
            <button
              className={`btn ${activeTab === 'view' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('view')}
            >
              View Timetable
            </button>
            <button
              className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('upload')}
            >
              Upload Timetable
            </button>
          </div>

          {activeTab === 'upload' && selectedClassData && (
            <TimetableUpload 
              classId={selectedClass} 
              className={selectedClassData.name} 
            />
          )}
        </div>
      )}

      {/* Timetable Display */}
      {selectedClass && (
        <TimetableDisplay 
          classId={selectedClass} 
          className={selectedClassData?.name} 
        />
      )}
    </div>
  );
};

export default TimetablePage;