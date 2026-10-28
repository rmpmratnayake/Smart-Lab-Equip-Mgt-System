import { NavLink, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  function logout() {
    onLogout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="nav-title">Smart Lab</div>
      <div className="nav-links">
        {user && (
          <>
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/equipment">Equipment</NavLink>
            <NavLink to="/reservations">Reservations</NavLink>
            <NavLink to="/issues">Issues</NavLink>
            {user.role === 'admin' && <NavLink to="/users">Users</NavLink>}
          </>
        )}
      </div>
      <div className="nav-user">
        {user ? (
          <>
            <span>{user.name} ({user.role})</span>
            <button className="btn btn-light" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
