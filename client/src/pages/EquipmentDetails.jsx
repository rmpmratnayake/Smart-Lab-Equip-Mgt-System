import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getError } from '../api.js';

function EquipmentDetails({ user }) {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/equipment/' + id)
      .then((res) => setItem(res.data))
      .catch((err) => setError(getError(err)));
  }, [id]);

  if (error) {
    return (
      <div>
        <div className="alert alert-error">{error}</div>
        <Link className="btn btn-light" to="/equipment">Back</Link>
      </div>
    );
  }
  if (!item) return <p>Loading equipment…</p>;

  const canEdit = user.role === 'admin' || user.role === 'technician';

  return (
    <div className="card">
      <h2>{item.name}</h2>
      <table className="details-table">
        <tbody>
          <tr><th>Code</th><td>{item.equipmentCode}</td></tr>
          <tr><th>Category</th><td>{item.category}</td></tr>
          <tr><th>Location</th><td>{item.location}</td></tr>
          <tr><th>Quantity</th><td>{item.availableQuantity} available out of {item.totalQuantity}</td></tr>
          <tr><th>Condition</th><td>{item.condition}</td></tr>
          <tr><th>Status</th><td><span className={'badge badge-' + item.status.toLowerCase()}>{item.status}</span></td></tr>
          <tr><th>Description</th><td>{item.description || '-'}</td></tr>
        </tbody>
      </table>

      <Link className="btn btn-light" to="/equipment">Back</Link>
      {user.role === 'student' && item.status !== 'Maintenance' && (
        <Link className="btn" to="/reservations" state={{ equipmentId: item._id }}>Reserve</Link>
      )}
      <Link className="btn btn-light" to="/issues" state={{ equipmentId: item._id }}>Report an issue</Link>
      {canEdit && <Link className="btn btn-edit" to={'/equipment/' + item._id + '/edit'}>Edit</Link>}
    </div>
  );
}

export default EquipmentDetails;
