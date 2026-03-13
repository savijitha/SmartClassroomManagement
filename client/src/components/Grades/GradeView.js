import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const GradeView = () => {
  const { isTeacher, user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, gradesRes] = await Promise.all([
        api.get('/classes'),
        api.get(isTeacher ? '/grades/all' : '/grades/my-grades')
      ]);
      
      setClasses(classesRes.data);
      setGrades(gradesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGrades = grades.filter(grade => {
    if (selectedClass !== 'all' && grade.classId !== selectedClass) return false;
    return true;
  });

  const calculateGPA = (grades) => {
    if (grades.length === 0) return '0.0';
    const total = grades.reduce((sum, grade) => {
      const percentage = (grade.score / grade.maxScore) * 100;
      if (percentage >= 90) return sum + 4.0;
      if (percentage >= 80) return sum + 3.0;
      if (percentage >= 70) return sum + 2.0;
      if (percentage >= 60) return sum + 1.0;
      return sum + 0.0;
    }, 0);
    return (total / grades.length).toFixed(2);
  };

  const getLetterGrade = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'var(--success)';
    if (percentage >= 80) return 'var(--info)';
    if (percentage >= 70) return 'var(--warning)';
    return 'var(--error)';
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
          <h1>{isTeacher ? 'Grade Management' : 'My Grades'}</h1>
          <p style={{ color: 'var(--text-light)' }}>
            {isTeacher 
              ? 'View and manage student grades' 
              : 'Track your academic performance'}
          </p>
        </div>
      </div>

      {/* GPA Card (for students) */}
      {!isTeacher && (
        <div className="card" style={{ 
          marginBottom: 'var(--space-xl)',
          background: 'var(--gradient-maroon)',
          color: 'white'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-md)'
          }}>
            <div>
              <h3 style={{ color: 'white', marginBottom: 'var(--space-xs)' }}>Current GPA</h3>
              <p style={{ opacity: 0.9 }}>Based on {grades.length} graded assignments</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold',
                lineHeight: 1
              }}>
                {calculateGPA(grades)}
              </div>
              <div style={{ opacity: 0.9 }}>out of 4.0</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-lg)'
        }}>
          <div className="form-group">
            <label className="form-label">Filter by Class</label>
            <select 
              className="form-control"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Semester</label>
            <select 
              className="form-control"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="current">Current Semester</option>
              <option value="fall2023">Fall 2023</option>
              <option value="spring2023">Spring 2023</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="card">
        <h3>Grade Overview</h3>
        
        {filteredGrades.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {isTeacher && <th>Student</th>}
                  <th>Assignment</th>
                  <th>Class</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Date</th>
                  {isTeacher && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map(grade => (
                  <tr key={grade.id}>
                    {isTeacher && <td>{grade.studentName}</td>}
                    <td>{grade.assignmentTitle}</td>
                    <td>{grade.className}</td>
                    <td>
                      <span style={{ fontWeight: '600' }}>
                        {grade.score}/{grade.maxScore}
                      </span>
                      <span style={{ 
                        marginLeft: 'var(--space-sm)',
                        color: 'var(--text-light)',
                        fontSize: '0.9rem'
                      }}>
                        ({Math.round((grade.score/grade.maxScore)*100)}%)
                      </span>
                    </td>
                    <td>
                      <span style={{
                        background: getGradeColor(grade.score, grade.maxScore),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}>
                        {getLetterGrade(grade.score, grade.maxScore)}
                      </span>
                    </td>
                    <td>{new Date(grade.gradedAt).toLocaleDateString()}</td>
                    {isTeacher && (
                      <td>
                        <button className="btn btn-outline" style={{ padding: '4px 8px' }}>
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-xxl)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}>📊</div>
            <h3>No Grades Available</h3>
            <p style={{ color: 'var(--text-light)' }}>
              {isTeacher 
                ? "You haven't added any grades yet."
                : "No grades have been posted yet."}
            </p>
          </div>
        )}
      </div>

      {/* Grade Distribution (for teachers) */}
      {isTeacher && filteredGrades.length > 0 && (
        <div style={{ 
          marginTop: 'var(--space-xl)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-lg)'
        }}>
          <div className="card">
            <h3>Grade Distribution</h3>
            <div style={{ padding: 'var(--space-md)' }}>
              {['A', 'B', 'C', 'D', 'F'].map(letter => {
                const count = filteredGrades.filter(g => 
                  getLetterGrade(g.score, g.maxScore) === letter
                ).length;
                const percentage = (count / filteredGrades.length) * 100;
                
                return (
                  <div key={letter} style={{ marginBottom: 'var(--space-md)' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginBottom: 'var(--space-xs)'
                    }}>
                      <span>Grade {letter}</span>
                      <span>{count} students ({Math.round(percentage)}%)</span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      background: 'var(--cream-dark)',
                      borderRadius: '4px'
                    }}>
                      <div style={{ 
                        width: `${percentage}%`, 
                        height: '100%', 
                        background: getGradeColor(
                          letter === 'A' ? 95 : 
                          letter === 'B' ? 85 : 
                          letter === 'C' ? 75 : 
                          letter === 'D' ? 65 : 50, 
                          100
                        ),
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3>Class Average</h3>
            <div style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold',
                color: 'var(--maroon-primary)'
              }}>
                {Math.round(filteredGrades.reduce((sum, g) => 
                  sum + (g.score/g.maxScore * 100), 0
                ) / filteredGrades.length)}%
              </div>
              <p style={{ color: 'var(--text-light)' }}>
                Based on {filteredGrades.length} graded assignments
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeView;