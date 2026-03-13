import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../services/api';

const MarkAttendance = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    location.state?.date || new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [classId]);

  const fetchData = async () => {
    try {
      const [classRes, studentsRes] = await Promise.all([
        api.get(`/classes/${classId}`),
        api.get(`/classes/${classId}/students`)
      ]);
      
      setClassData(classRes.data);
      setStudents(studentsRes.data);
      
      // Initialize attendance with default 'present'
      const initialAttendance = {};
      studentsRes.data.forEach(student => {
        initialAttendance[student.id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status
      }));

      await api.post('/attendance/mark', {
        classId,
        date: selectedDate,
        records
      });

      navigate(`/attendance?class=${classId}&date=${selectedDate}`);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to mark attendance');
    } finally {
      setSaving(false);
    }
  };

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
          <Link to={`/attendance`} className="btn btn-outline" style={{ marginBottom: 'var(--space-md)' }}>
            ← Back to Attendance
          </Link>
          <h1>Mark Attendance - {classData?.name}</h1>
          <p style={{ color: 'var(--text-light)' }}>
            Record attendance for your class
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-md)'
        }}>
          <div>
            <label className="form-label" style={{ marginBottom: 'var(--space-xs)' }}>Attendance Date</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{ width: '200px' }}
            />
          </div>

          <div>
            <span style={{ marginRight: 'var(--space-md)', color: 'var(--text-medium)' }}>
              Quick Actions:
            </span>
            <button 
              className="btn btn-success" 
              onClick={() => handleMarkAll('present')}
              style={{ marginRight: 'var(--space-sm)' }}
            >
              All Present
            </button>
            <button 
              className="btn btn-warning" 
              onClick={() => handleMarkAll('late')}
              style={{ marginRight: 'var(--space-sm)' }}
            >
              All Late
            </button>
            <button 
              className="btn btn-danger" 
              onClick={() => handleMarkAll('absent')}
            >
              All Absent
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
          {error}
        </div>
      )}

      <div className="card">
        <h3>Student List</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: 'var(--space-lg)' }}>
          Total Students: {students.length}
        </p>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Student Name</th>
                <th>Email</th>
                <th style={{ width: '200px' }}>Attendance Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      <div className="user-avatar" style={{ width: '30px', height: '30px' }}>
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      {student.name}
                    </div>
                  </td>
                  <td>{student.email}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="radio"
                          name={`attendance-${student.id}`}
                          value="present"
                          checked={attendance[student.id] === 'present'}
                          onChange={() => handleStatusChange(student.id, 'present')}
                        />
                        <span className="status-badge status-present">Present</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="radio"
                          name={`attendance-${student.id}`}
                          value="late"
                          checked={attendance[student.id] === 'late'}
                          onChange={() => handleStatusChange(student.id, 'late')}
                        />
                        <span className="status-badge status-late">Late</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="radio"
                          name={`attendance-${student.id}`}
                          value="absent"
                          checked={attendance[student.id] === 'absent'}
                          onChange={() => handleStatusChange(student.id, 'absent')}
                        />
                        <span className="status-badge status-absent">Absent</span>
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 'var(--space-md)',
          marginTop: 'var(--space-xl)'
        }}>
          <Link to="/attendance" className="btn btn-outline">
            Cancel
          </Link>
          <button 
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;