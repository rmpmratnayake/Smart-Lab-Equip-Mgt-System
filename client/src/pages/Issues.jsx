import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api, { getError, showDate } from '../api.js';

const emptyForm = { equipment: '', title: '', description: '', priority: 'medium' };

function Issues({ user }) {
  const location = useLocation();
  const [list, setList] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [equipmentLoading, setEquipmentLoading] = useState(true);

  const isStaff = user.role === 'admin' || user.role === 'technician';

  useEffect(() => {
    loadIssues();
    api.get('/equipment')
      .then((res) => {
        setEquipment(res.data);
        if (location.state && location.state.equipmentId) {
          setForm((prev) => ({ ...prev, equipment: location.state.equipmentId }));
        }
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setEquipmentLoading(false));
  }, []);

  async function loadIssues() {
    try {
      const res = await api.get('/issues');
      setList(res.data);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.equipment || !form.title.trim() || !form.description.trim()) {
      setError('Please select equipment and fill the title and description.');
      return;
    }

    try {
      await api.post('/issues', form);
      setMessage('Issue reported.');
      setForm(emptyForm);
      loadIssues();
    } catch (err) {
      setError(getError(err));
    }
  }

  async function changeStatus(id, status) {
    try {
      await api.put('/issues/' + id, { status });
      setMessage('Issue status updated.');
      setError('');
      loadIssues();
    } catch (err) {
      setError(getError(err));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this issue?')) return;
    try {
      await api.delete('/issues/' + id);
      setMessage('Issue deleted.');
      setError('');
      loadIssues();
    } catch (err) {
      setError(getError(err));
    }
  }

  return (
    <div>
      <h2>Equipment Issues</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h3>Report a problem</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label>Equipment *</label>
              <select name="equipment" value={form.equipment} onChange={handleChange}>
                <option value="">-- select equipment --</option>
                {equipment.map((e) => <option key={e._id} value={e._id}>{e.name} ({e.equipmentCode})</option>)}
              </select>
              {equipmentLoading && <small>Loading equipment…</small>}
              {!equipmentLoading && equipment.length === 0 && <small>No equipment found.</small>}
            </div>
            <div>
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <label>Title *</label>
          <input name="title" value={form.title} onChange={handleChange} />
          <label>Description *</label>
          <textarea name="description" rows="3" value={form.description} onChange={handleChange}></textarea>
          <button className="btn" type="submit">Submit</button>
        </form>
      </div>

      {loading ? (
        <p>Loading issues…</p>
      ) : error ? null : list.length === 0 ? (
        <p>No issues reported.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Title</th>
                <th>Description</th>
                <th>Reported by</th>
                <th>Date</th>
                <th>Priority</th>
                <th>Status</th>
                {isStaff && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {list.map((i) => (
                <tr key={i._id}>
                  <td>{i.equipment ? i.equipment.name : 'Deleted equipment'}</td>
                  <td>{i.title}</td>
                  <td>{i.description}</td>
                  <td>{i.reportedBy ? i.reportedBy.name : '-'}</td>
                  <td>{showDate(i.createdAt)}</td>
                  <td><span className={'badge badge-' + i.priority}>{i.priority}</span></td>
                  <td>
                    {isStaff ? (
                      <select value={i.status} onChange={(e) => changeStatus(i._id, e.target.value)}>
                        <option value="open">open</option>
                        <option value="in_progress">in progress</option>
                        <option value="resolved">resolved</option>
                      </select>
                    ) : (
                      <span className={'badge badge-' + i.status}>{i.status.replace('_', ' ')}</span>
                    )}
                  </td>
                  {isStaff && (
                    <td className="actions">
                      {user.role === 'admin' && (
                        <button className="btn btn-small btn-danger" onClick={() => handleDelete(i._id)}>Delete</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Issues;
