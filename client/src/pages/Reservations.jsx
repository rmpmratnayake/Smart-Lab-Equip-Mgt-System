import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api, { getError, showDate, toInputDate } from '../api.js';

const emptyForm = { equipment: '', startDate: '', endDate: '', quantity: 1, purpose: '' };

function Reservations({ user }) {
  const isStudent = user?.role === 'student';
  const location = useLocation();

  const [list, setList] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [equipmentLoading, setEquipmentLoading] = useState(isStudent);

  useEffect(() => {
    loadReservations();
    if (isStudent) {
      api.get('/equipment')
        .then((res) => {
          const avail = res.data.filter((e) => e.status !== 'Maintenance');
          setEquipment(avail);
          if (location.state && location.state.equipmentId) {
            setForm((prev) => ({ ...prev, equipment: location.state.equipmentId }));
          }
        })
        .catch((err) => setError(getError(err)))
        .finally(() => setEquipmentLoading(false));
    }
  }, []);

  async function loadReservations() {
    try {
      const res = await api.get('/reservations');
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

    // client side validation
    if (!form.equipment || !form.startDate || !form.endDate || !form.purpose.trim()) {
      setError('Please fill all the fields.');
      return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError('End date must be after the start date.');
      return;
    }
    if (Number(form.quantity) < 1) {
      setError('Quantity must be at least 1.');
      return;
    }

    try {
      if (editingId) {
        await api.put('/reservations/' + editingId, form);
        setMessage('Reservation updated.');
      } else {
        await api.post('/reservations', form);
        setMessage('Reservation request sent.');
      }
      setForm(emptyForm);
      setEditingId(null);
      loadReservations();
    } catch (err) {
      setError(getError(err));
    }
  }

  function startEdit(r) {
    setEditingId(r._id);
    setForm({
      equipment: r.equipment ? (r.equipment._id || r.equipment) : '',
      startDate: toInputDate(r.startDate),
      endDate: toInputDate(r.endDate),
      quantity: r.quantity,
      purpose: r.purpose,
    });
    setMessage('');
    setError('');
    window.scrollTo(0, 0);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function changeStatus(id, status) {
    try {
      await api.put('/reservations/' + id + '/status', { status });
      setMessage('Reservation ' + status + '.');
      setError('');
      loadReservations();
    } catch (err) {
      setError(getError(err));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this reservation?')) return;
    try {
      await api.delete('/reservations/' + id);
      setMessage('Reservation deleted.');
      setError('');
      loadReservations();
    } catch (err) {
      setError(getError(err));
    }
  }

  return (
    <div>
      <h2>Reservations</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {isStudent && (
        <div className="card">
          <h3>{editingId ? 'Edit Reservation' : 'New Reservation'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label>Equipment *</label>
                <select name="equipment" value={form.equipment} onChange={handleChange} disabled={editingId !== null}>
                  <option value="">-- select equipment --</option>
                  {equipment.map((e) => (
                    <option key={e._id} value={e._id}>{e.name} ({e.availableQuantity} available)</option>
                  ))}
              </select>
              {equipmentLoading && <small>Loading equipment…</small>}
              {!equipmentLoading && equipment.length === 0 && <small>No equipment is currently available for reservations.</small>}
              </div>
              <div>
                <label>Quantity *</label>
                <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} />
              </div>
              <div>
                <label>Start *</label>
                <input name="startDate" type="datetime-local" value={form.startDate} onChange={handleChange} />
              </div>
              <div>
                <label>End *</label>
                <input name="endDate" type="datetime-local" value={form.endDate} onChange={handleChange} />
              </div>
            </div>
            <label>Purpose *</label>
            <input name="purpose" value={form.purpose} onChange={handleChange} placeholder="Why do you need it?" />

            <button className="btn" type="submit">{editingId ? 'Update' : 'Send Request'}</button>
            {editingId && <button type="button" className="btn btn-light" onClick={cancelEdit}>Cancel</button>}
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading reservations…</p>
      ) : error ? null : list.length === 0 ? (
        <p>No reservations yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Equipment</th>
                {!isStudent && <th>Student</th>}
                <th>From</th>
                <th>To</th>
                <th>Qty</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r._id}>
                  <td>{r.equipment ? r.equipment.name : 'Deleted equipment'}</td>
                  {!isStudent && <td>{r.user ? r.user.name : '-'}</td>}
                  <td>{showDate(r.startDate)}</td>
                  <td>{showDate(r.endDate)}</td>
                  <td>{r.quantity}</td>
                  <td>{r.purpose}</td>
                  <td><span className={'badge badge-' + r.status}>{r.status}</span></td>
                  <td className="actions">
                    {isStudent && r.status === 'pending' && (
                      <>
                        <button className="btn btn-small btn-edit" onClick={() => startEdit(r)}>Edit</button>
                        <button className="btn btn-small btn-danger" onClick={() => handleDelete(r._id)}>Delete</button>
                      </>
                    )}
                    {!isStudent && r.status === 'pending' && (
                      <>
                        <button className="btn btn-small" onClick={() => changeStatus(r._id, 'approved')}>Approve</button>
                        <button className="btn btn-small btn-danger" onClick={() => changeStatus(r._id, 'rejected')}>Reject</button>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <button className="btn btn-small btn-danger" onClick={() => handleDelete(r._id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Reservations;
