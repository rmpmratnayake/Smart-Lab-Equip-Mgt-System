import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EquipmentList from './pages/EquipmentList.jsx';
import EquipmentForm from './pages/EquipmentForm.jsx';
import EquipmentDetails from './pages/EquipmentDetails.jsx';
import Reservations from './pages/Reservations.jsx';
import Issues from './pages/Issues.jsx';
import Users from './pages/Users.jsx';

// only logged in users (with the right role) can open these pages
function Private({ user, roles, children }) {
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  });

  function handleLogin(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="container">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register onLogin={handleLogin} />} />

          <Route path="/" element={<Private user={user}><Dashboard user={user} /></Private>} />
          <Route path="/equipment" element={<Private user={user}><EquipmentList user={user} /></Private>} />
          <Route path="/equipment/new" element={<Private user={user} roles={['admin', 'technician']}><EquipmentForm /></Private>} />
          <Route path="/equipment/:id/edit" element={<Private user={user} roles={['admin', 'technician']}><EquipmentForm /></Private>} />
          <Route path="/equipment/:id" element={<Private user={user}><EquipmentDetails user={user} /></Private>} />
          <Route path="/reservations" element={<Private user={user}><Reservations user={user} /></Private>} />
          <Route path="/issues" element={<Private user={user}><Issues user={user} /></Private>} />
          <Route path="/users" element={<Private user={user} roles={['admin']}><Users user={user} /></Private>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
