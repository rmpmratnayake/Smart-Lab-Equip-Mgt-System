import { useEffect, useState } from 'react';
import api, { getError } from '../api.js';

function Users({ user }) {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }

  async function changeRole(id, role) {
    try {
      await api.put('/users/' + id, { role });
      setMessage('Role updated.');
      setError('');
      loadUsers();
    } catch (err) {
      setMessage('');
      setError(getError(err));
    }
  }

  async function handleDelete(u) {
    if (!window.confirm('Delete user ' + u.name + '?')) return;
    try {
      await api.delete('/users/' + u._id);
      setMessage('User deleted.');
      setError('');
      loadUsers();
    } catch (err) {
      setMessage('');
      setError(getError(err));
    }
  }

  return (
    <div>
      <h2>Manage Users</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? <p>Loading users…</p> : !error && <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select value={u.role} disabled={u._id === (user.id || user._id)} onChange={(e) => changeRole(u._id, e.target.value)}>
                    <option value="student">student</option>
                    <option value="technician">technician</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="actions">
                  {u._id !== (user.id || user._id) && (
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(u)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </div>
  );
}

export default Users;
