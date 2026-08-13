import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import TeacherDashboard from './pages/TeacherDashboard.jsx'
import RecordSession from './pages/RecordSession.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/join/:inviteCode" element={<Login />} />
      <Route path="/profesor" element={<TeacherDashboard />} />
      <Route path="/profesor/grabar/:studentId" element={<RecordSession />} />
      <Route path="/alumno" element={<StudentDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
