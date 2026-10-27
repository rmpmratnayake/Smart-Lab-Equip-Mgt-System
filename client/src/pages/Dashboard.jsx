import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getError } from '../api.js';

function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats')
      .then((res) => setStats(res.data))
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <p>You are logged in as <b>{user.role}</b>.</p>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p>Loading dashboard…</p>}

      {stats && (
        <div className="stat-grid">
          <div className="stat-box"><h3>{stats.equipment}</h3><p>Equipment items</p></div>
          <div className="stat-box"><h3>{stats.availableEquipment}</h3><p>Available now</p></div>
          <div className="stat-box"><h3>{stats.reservations}</h3><p>{user.role === 'student' ? 'My reservations' : 'Reservations'}</p></div>
          <div className="stat-box"><h3>{stats.pendingReservations}</h3><p>Pending reservations</p></div>
          <div className="stat-box"><h3>{stats.openIssues}</h3><p>Open issues</p></div>
          {stats.users !== undefined && <div className="stat-box"><h3>{stats.users}</h3><p>Users</p></div>}
        </div>
      )}

      <div className="card">
        <h3>Quick links</h3>
        <Link className="btn" to="/equipment">View equipment</Link>
        <Link className="btn" to="/reservations">Reservations</Link>
        <Link className="btn" to="/issues">Report / view issues</Link>
        {user.role !== 'student' && <Link className="btn" to="/equipment/new">Add equipment</Link>}
      </div>
    </div>
  );
}

export default Dashboard;
