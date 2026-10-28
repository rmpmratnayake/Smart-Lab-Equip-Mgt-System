import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getError } from '../api.js';

const categories = ['Computing', 'Electronics', 'Measurement', 'Networking', 'Robotics', 'Other'];

const emptyForm = {
  equipmentCode: '',
  name: '',
  category: 'Computing',
  location: '',
  description: '',
  totalQuantity: 1,
  availableQuantity: 1,
  condition: 'Good',
  status: 'Available',
};

// this page is used for both "add" and "edit"
function EquipmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(id));

  // if there is an id in the url we are editing, so load the old data
  useEffect(() => {
    if (id) {
      api.get('/equipment/' + id)
        .then((res) => setForm(res.data))
        .catch((err) => setError(getError(err)))
        .finally(() => setLoading(false));
    }
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // client side validation
    if (!form.equipmentCode.trim() || !form.name.trim() || !form.location.trim()) {
      setError('Code, name and location are required.');
      return;
    }
    const total = Number(form.totalQuantity);
    const available = Number(form.availableQuantity);
    if (!Number.isInteger(total) || total < 1) {
      setError('Total quantity must be a whole number of at least 1.');
      return;
    }
    if (!Number.isInteger(available) || available < 0) {
      setError('Available quantity must be 0 or more.');
      return;
    }
    if (available > total) {
      setError('Available quantity cannot be more than total quantity.');
      return;
    }

    const data = { ...form, totalQuantity: total, availableQuantity: available };

    try {
      if (id) {
        await api.put('/equipment/' + id, data);
        navigate('/equipment', { state: { message: 'Equipment updated successfully.' } });
      } else {
        await api.post('/equipment', data);
        navigate('/equipment', { state: { message: 'Equipment added successfully.' } });
      }
    } catch (err) {
      setError(getError(err));
    }
  }

  return (
    <div className="card">
      <h2>{id ? 'Edit Equipment' : 'Add Equipment'}</h2>
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? <p>Loading equipment…</p> : (

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label>Equipment code *</label>
            <input name="equipmentCode" value={form.equipmentCode} onChange={handleChange} placeholder="LAB-XXX-001" />
          </div>
          <div>
            <label>Name *</label>
            <input name="name" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <label>Category *</label>
            <select name="category" value={form.category} onChange={handleChange}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label>Location *</label>
            <input name="location" value={form.location} onChange={handleChange} />
          </div>
          <div>
            <label>Total quantity *</label>
            <input name="totalQuantity" type="number" min="1" value={form.totalQuantity} onChange={handleChange} />
          </div>
          <div>
            <label>Available quantity *</label>
            <input name="availableQuantity" type="number" min="0" value={form.availableQuantity} onChange={handleChange} />
          </div>
          <div>
            <label>Condition</label>
            <select name="condition" value={form.condition} onChange={handleChange}>
              <option>Excellent</option>
              <option>Good</option>
              <option>Fair</option>
              <option>Needs Repair</option>
            </select>
          </div>
          <div>
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option>Available</option>
              <option>Limited</option>
              <option>Maintenance</option>
            </select>
          </div>
        </div>

        <label>Description</label>
        <textarea name="description" rows="3" value={form.description} onChange={handleChange}></textarea>

        <button className="btn" type="submit">{id ? 'Update' : 'Save'}</button>
        <Link className="btn btn-light" to="/equipment">Cancel</Link>
      </form>
      )}
    </div>
  );
}

export default EquipmentForm;
