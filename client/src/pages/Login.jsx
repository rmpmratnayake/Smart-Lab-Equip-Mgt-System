import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getError } from '../api.js';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // client side validation
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      const res = await api.post('/auth/login', { email, password });
      onLogin(res.data);
    } catch (err) {
      setError(getError(err));
    }
  }

  // fills the form with a demo account
  function fillDemo(demoEmail, demoPassword) {
    setEmail(demoEmail);
    setPassword(demoPassword);
  }

  return (
    <div className="card small-card">
      <h2>Login</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button className="btn" type="submit">Login</button>
      </form>

      <p>No account? <Link to="/register">Register here</Link></p>

      <div className="demo-box">
        <b>Demo accounts</b> (click to fill)
        <div>
          <button type="button" className="btn btn-small" onClick={() => fillDemo('admin@smartlab.lk', 'Admin@123')}>Admin</button>
          <button type="button" className="btn btn-small" onClick={() => fillDemo('tech@smartlab.lk', 'Tech@123')}>Technician</button>
          <button type="button" className="btn btn-small" onClick={() => fillDemo('student@smartlab.lk', 'Student@123')}>Student</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
