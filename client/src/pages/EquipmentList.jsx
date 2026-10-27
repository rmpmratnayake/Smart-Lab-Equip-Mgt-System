import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { getError } from '../api.js';

const categories = ['Computing', 'Electronics', 'Measurement', 'Networking', 'Robotics', 'Other'];

function EquipmentList({ user }) {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('');
  const [message, setMessage] = useState(location.state ? location.state.message : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const canEdit = user.role === 'admin' || user.role === 'technician';

  // load equipment from the server whenever a filter changes
  useEffect(() => {
    loadEquipment();
  }, [search, category, status, sort]);

  async function loadEquipment() {
    try {
      const res = await api.get('/equipment', { params: { search, category, status, sort } });
      setItems(res.data);
      setError('');
    } catch (err) {
      setError(getError(err));
    }
    setLoading(false);
  }

  async function handleDelete(item) {
    if (!window.confirm('Delete ' + item.name + '?')) return;
    try {
      await api.delete('/equipment/' + item._id);
      setMessage(item.name + ' was deleted.');
      setError('');
      loadEquipment();
    } catch (err) {
      setMessage('');
      setError(getError(err));
    }
  }

  function clearFilters() {
    setSearch('');
    setCategory('');
    setStatus('');
    setSort('');
  }

  return (
    <div>
      <div className="page-top">
        <h2>Lab Equipment</h2>
        {canEdit && <Link className="btn" to="/equipment/new">+ Add Equipment</Link>}
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card filter-row">
        <input placeholder="Search by name, code or location" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All status</option>
          <option>Available</option>
          <option>Limited</option>
          <option>Maintenance</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name (A-Z)</option>
          <option value="quantity">Most available</option>
        </select>
        <button className="btn btn-light" onClick={clearFilters}>Clear</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No equipment found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Location</th>
                <th>Available</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item.equipmentCode}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.location}</td>
                  <td>{item.availableQuantity} / {item.totalQuantity}</td>
                  <td><span className={'badge badge-' + item.status.toLowerCase()}>{item.status}</span></td>
                  <td className="actions">
                    <Link className="btn btn-small" to={'/equipment/' + item._id}>View</Link>
                    {canEdit && <Link className="btn btn-small btn-edit" to={'/equipment/' + item._id + '/edit'}>Edit</Link>}
                    {user.role === 'admin' && (
                      <button className="btn btn-small btn-danger" onClick={() => handleDelete(item)}>Delete</button>
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

export default EquipmentList;
