const express = require('express');
const Equipment = require('../models/Equipment');
const Reservation = require('../models/Reservation');
const Issue = require('../models/Issue');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { handleError } = require('../helpers');

const router = express.Router();

// numbers shown on the dashboard
router.get('/', auth, async (req, res) => {
  try {
    const isStudent = req.user.role === 'student';
    const reservationFilter = isStudent ? { user: req.user._id } : {};
    const issueFilter = isStudent ? { reportedBy: req.user._id } : {};

    const stats = {
      equipment: await Equipment.countDocuments(),
      availableEquipment: await Equipment.countDocuments({ status: 'Available' }),
      reservations: await Reservation.countDocuments(reservationFilter),
      pendingReservations: await Reservation.countDocuments({ ...reservationFilter, status: 'pending' }),
      issues: await Issue.countDocuments(issueFilter),
      openIssues: await Issue.countDocuments({ ...issueFilter, status: { $in: ['open', 'in_progress'] } }),
    };
    if (req.user.role === 'admin') stats.users = await User.countDocuments();

    res.json(stats);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
