const express = require('express');
const Reservation = require('../models/Reservation');
const Equipment = require('../models/Equipment');
const { auth, allowRoles } = require('../middleware/auth');
const { handleError } = require('../helpers');

const router = express.Router();

router.use(auth);

// READ - students see only their own, staff see all
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student') filter.user = req.user._id;
    if (req.query.status) filter.status = req.query.status;

    const list = await Reservation.find(filter)
      .populate('equipment', 'name equipmentCode')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    handleError(res, err);
  }
});

// checks dates and quantity, returns an error text or null
async function checkReservation(body) {
  const equipment = await Equipment.findById(body.equipment);
  if (!equipment) return 'Please select a valid equipment.';
  if (equipment.status === 'Maintenance') return 'This equipment is under maintenance.';

  const start = new Date(body.startDate);
  const end = new Date(body.endDate);
  if (isNaN(start) || isNaN(end)) return 'Start and end dates are required.';
  if (end <= start) return 'End date must be after the start date.';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (start < today) return 'Start date cannot be in the past.';

  const qty = Number(body.quantity);
  if (!qty || qty < 1) return 'Quantity must be at least 1.';
  if (qty > equipment.availableQuantity) {
    return 'Only ' + equipment.availableQuantity + ' item(s) are available.';
  }
  return null;
}

// CREATE (students)
router.post('/', allowRoles('student'), async (req, res) => {
  try {
    const problem = await checkReservation(req.body);
    if (problem) return res.status(400).json({ message: problem });

    const reservation = await Reservation.create({
      equipment: req.body.equipment,
      user: req.user._id,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      quantity: req.body.quantity,
      purpose: req.body.purpose,
    });
    res.status(201).json(reservation);
  } catch (err) {
    handleError(res, err);
  }
});

// UPDATE details - students can edit their own pending reservations
router.put('/:id', allowRoles('student'), async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found.' });
    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own reservations.' });
    }
    if (reservation.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending reservations can be edited.' });
    }

    const problem = await checkReservation({ ...req.body, equipment: reservation.equipment });
    if (problem) return res.status(400).json({ message: problem });

    reservation.startDate = req.body.startDate;
    reservation.endDate = req.body.endDate;
    reservation.quantity = req.body.quantity;
    reservation.purpose = req.body.purpose;
    await reservation.save();
    res.json(reservation);
  } catch (err) {
    handleError(res, err);
  }
});

// UPDATE status - staff approve or reject
router.put('/:id/status', allowRoles('admin', 'technician'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found.' });

    reservation.status = status;
    await reservation.save();
    res.json(reservation);
  } catch (err) {
    handleError(res, err);
  }
});

// DELETE - students delete own pending ones, admin can delete any
router.delete('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found.' });

    if (req.user.role === 'student') {
      if (reservation.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only delete your own reservations.' });
      }
      if (reservation.status !== 'pending') {
        return res.status(400).json({ message: 'Only pending reservations can be deleted.' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to do this.' });
    }

    await Reservation.findByIdAndDelete(reservation._id);
    res.json({ message: 'Reservation deleted.' });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
