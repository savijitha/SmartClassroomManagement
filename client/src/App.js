import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import TeacherDashboard from './components/Dashboard/TeacherDashboard';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import ClassList from './components/Classes/ClassList';
import ClassDetails from './components/Classes/ClassDetails';
import CreateClass from './components/Classes/CreateClass';
import AttendanceView from './components/Attendance/AttendanceView';
import MarkAttendance from './components/Attendance/MarkAttendance';
import AssignmentList from './components/Assignments/AssignmentList';
import CreateAssignment from './components/Assignments/CreateAssignment';
import GradeView from './components/Grades/GradeView';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import SubmitAssignment from './components/Assignments/SubmitAssignment';
import GradeAssignment from './components/Assignments/GradeAssignment';
import AddGrade from './components/Grades/AddGrade';
import NotFound from './components/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  {({ user }) => (
                    user?.role === 'teacher' ? 
                    <TeacherDashboard /> : 
                    <StudentDashboard />
                  )}
                </PrivateRoute>
              } />
              
              <Route path="/classes" element={
                <PrivateRoute>
                  <ClassList />
                </PrivateRoute>
              } />
              
              <Route path="/classes/:id" element={
                <PrivateRoute>
                  <ClassDetails />
                </PrivateRoute>
              } />
              
              <Route path="/classes/create" element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <CreateClass />
                </PrivateRoute>
              } />
              
              <Route path="/attendance" element={
                <PrivateRoute>
                  <AttendanceView />
                </PrivateRoute>
              } />
              
              <Route path="/attendance/mark/:classId" element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <MarkAttendance />
                </PrivateRoute>
              } />
              
              <Route path="/assignments" element={
                <PrivateRoute>
                  <AssignmentList />
                </PrivateRoute>
              } />
              
              <Route path="/assignments/create/:classId" element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <CreateAssignment />
                </PrivateRoute>
              } />
              
              <Route path="/grades" element={
                <PrivateRoute>
                  <GradeView />
                </PrivateRoute>
              } />
              <Route path="/assignments/:id/submit" element={
  <PrivateRoute allowedRoles={['student']}>
    <SubmitAssignment />
  </PrivateRoute>
} />

<Route path="/assignments/:id/grade" element={
  <PrivateRoute allowedRoles={['teacher']}>
    <GradeAssignment />
  </PrivateRoute>
} />

<Route path="/grades/add" element={
  <PrivateRoute allowedRoles={['teacher']}>
    <AddGrade />
  </PrivateRoute>
} />
              
              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;