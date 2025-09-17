import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Contacts from './pages/Contacts.jsx'
import { useNavigate } from "react-router";

function App() {
  let navigate = useNavigate();
  function RequireAuth({ children }) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      navigate("/login") 
    }
    return children;
  }

  function RedirectIfAuthed({ children }) {
    const location = useLocation();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      location
    }
    return children;
  }

  return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
        <Route path="/register" element={<RedirectIfAuthed><Register /></RedirectIfAuthed>} />
        <Route path="/contacts" element={<RequireAuth><Contacts /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  )
}

export default App
