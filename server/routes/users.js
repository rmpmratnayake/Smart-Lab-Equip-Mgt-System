const express = require('express');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const Issue = require('../models/Issue');
const { auth, allowRoles } = require('../middleware/auth');
const { handleError } = require('../helpers');

const router = express.Router();

// only admin can manage users
router.use(auth, allowRoles('admin'));

// READ
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    handleError(res, err);
  }
});

// UPDATE role
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'technician', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own role.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.role = role;
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    handleError(res, err);
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // also remove this user's reservations and issues
    await Reservation.deleteMany({ user: user._id });
    await Issue.deleteMany({ reportedBy: user._id });
    await User.findByIdAndDelete(user._id);
    res.json({ message: 'User deleted.' });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
