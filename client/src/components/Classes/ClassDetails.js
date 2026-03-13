import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ClassChat from '../Chat/ClassChat';
import DiscussionList from '../Discussions/DiscussionList';

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isTeacher, user } = useAuth();
  
  // State declarations - MAKE SURE ALL THESE EXIST
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEnrollModal, setShowEnrollModal] = useState(false);  // For enroll modal
  const [enrollEmail, setEnrollEmail] = useState('');             // For enroll email input
  const [enrollError, setEnrollError] = useState('');             // For enroll error messages
  const [unreadCount, setUnreadCount] = useState(0);              // For chat unread count

  useEffect(() => {
    fetchClassData();
    fetchUnreadCount();
  }, [id]);

  useEffect(() => {
    fetchClassData();
    fetchUnreadCount();
  }, [id]);

  const fetchClassData = async () => {
    try {
      const [classRes, studentsRes, assignmentsRes] = await Promise.all([
        api.get(`/classes/${id}`),
        api.get(`/classes/${id}/students`),
        api.get(`/assignments/class/${id}`)
      ]);

      setClassData(classRes.data);
      setStudents(studentsRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error("Failed to load class data", error);
    } finally {
      setLoading(false);
    }
  };
  const handleEnrollStudent = async (e) => {
  e.preventDefault();
  setEnrollError('');
  
  try {
    // First find student by email
    const studentRes = await api.get(`/users?email=${enrollEmail}`);
    const student = studentRes.data;
    
    // Then enroll using the student ID
    await api.post(`/classes/${id}/enroll`, { 
      studentId: student.id  // Teacher enrolls a different student
    });
    
    setShowEnrollModal(false);
    setEnrollEmail('');
    fetchClassData();
    alert('Student enrolled successfully!');
  } catch (error) {
    console.error('Enrollment error:', error);
    setEnrollError(error.response?.data?.error || 'Failed to enroll student');
  }
};

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get(`/chat/${id}/unread`);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Unread count error:", error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="dashboard">
        <div className="alert alert-error">Class not found</div>
        <Link to="/classes" className="btn btn-primary">Back to Classes</Link>
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <Link to="/classes" className="btn btn-outline">
            ← Back to Classes
          </Link>

          <h1>{classData.name}</h1>
          <p>{classData.description}</p>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-number">{students.length}</div>
          <div className="stat-label">Students</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-number">{assignments.length}</div>
          <div className="stat-label">Assignments</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-number">{classData.schedule || "TBD"}</div>
          <div className="stat-label">Schedule</div>
        </div>

      </div>

      {/* TABS */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          borderBottom: "2px solid #eee",
          marginBottom: "20px"
        }}
      >

        <button
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>

        <button
          className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('students')}
        >
          Students ({students.length})
        </button>

        <button
          className={`btn ${activeTab === 'assignments' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments ({assignments.length})
        </button>

        <button
          className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance
        </button>

        {/* CHAT TAB */}
        <button
          className={`btn ${activeTab === 'chat' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('chat')}
          style={{ position: "relative" }}
        >
          💬 Chat

          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                background: "red",
                color: "white",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* DISCUSSIONS TAB */}
        <button
          className={`btn ${activeTab === 'discussions' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('discussions')}
        >
          💬 Discussions
        </button>

      </div>

      {/* TAB CONTENT */}

      {activeTab === 'overview' && (
        <div className="card">
          <h3>Class Information</h3>

          <p><strong>Teacher:</strong> {classData.teacherName}</p>
          <p><strong>Schedule:</strong> {classData.schedule}</p>
          <p><strong>Students:</strong> {students.length}</p>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="card">

          <h3>Students</h3>

          {students.map(student => (
            <div key={student.id}>
              {student.name} — {student.email}
            </div>
          ))}

        </div>
      )}

      {activeTab === 'assignments' && (
        <div>

          {assignments.map(a => (
            <div key={a.id} className="assignment-item">
              <div>
                <h4>{a.title}</h4>
                <p>
                  Due: {new Date(a.dueDate).toLocaleDateString()}
                </p>
              </div>

              <Link to={`/assignments/${a.id}`} className="btn btn-outline">
                View
              </Link>
            </div>
          ))}

        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="card">

          <h3>Attendance</h3>

          <input type="date" className="form-control"/>

          <button className="btn btn-primary">
            View Attendance
          </button>

        </div>
      )}

      {/* CHAT CONTENT */}
      {activeTab === 'chat' && (
        <div className="card" style={{ padding: 0 }}>
          <ClassChat classId={id} className={classData.name} />
        </div>
      )}

      {/* DISCUSSIONS CONTENT */}
      {activeTab === 'discussions' && (
        <div className="card">

          <DiscussionList classId={id} />

        </div>
      )}

    </div>
  );
};

export default ClassDetails;
