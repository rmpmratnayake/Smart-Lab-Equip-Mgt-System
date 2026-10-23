const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { handleError } = require('../helpers');

const router = express.Router();

function makeToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'smartlab_secret_key_123', { expiresIn: '7d' });
}

// REGISTER - new accounts are always students
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: 'student' });

    res.status(201).json({
      token: makeToken(user._id),
      user: { id: user._id, _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    handleError(res, err);
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    res.json({
      token: makeToken(user._id),
      user: { id: user._id, _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    handleError(res, err);
  }
});

// current user
router.get('/me', auth, (req, res) => {
  const u = req.user;
  res.json({ id: u._id, _id: u._id, name: u.name, email: u.email, role: u.role });
});

module.exports = router;
