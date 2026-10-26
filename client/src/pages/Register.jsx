import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getError } from '../api.js';

function Register({ onLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('All fields are required.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      onLogin(res.data);
    } catch (err) {
      setError(getError(err));
    }
  }

  return (
    <div className="card small-card">
      <h2>Student Registration</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label>Full name</label>
        <input name="name" value={form.name} onChange={handleChange} />

        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} />

        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} />

        <label>Confirm password</label>
        <input name="confirm" type="password" value={form.confirm} onChange={handleChange} />

        <button className="btn" type="submit">Register</button>
      </form>

      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}

export default Register;
