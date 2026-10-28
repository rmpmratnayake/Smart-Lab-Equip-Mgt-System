const express = require('express');
const Equipment = require('../models/Equipment');
const Reservation = require('../models/Reservation');
const Issue = require('../models/Issue');
const { auth, allowRoles } = require('../middleware/auth');
const { handleError } = require('../helpers');

const router = express.Router();

// all equipment routes need login
router.use(auth);

// READ ALL - supports search, filter and sort
// example: /api/equipment?search=pi&category=Computing&status=Available&sort=name
router.get('/', async (req, res) => {
  try {
    const { search, category, status, sort } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      // remove special characters so the regex does not break
      const text = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: text, $options: 'i' } },
        { equipmentCode: { $regex: text, $options: 'i' } },
        { location: { $regex: text, $options: 'i' } },
      ];
    }

    let sortBy = { createdAt: -1 };
    if (sort === 'name') sortBy = { name: 1 };
    if (sort === 'quantity') sortBy = { availableQuantity: -1 };
    if (sort === 'oldest') sortBy = { createdAt: 1 };

    const items = await Equipment.find(filter).sort(sortBy);
    res.json(items);
  } catch (err) {
    handleError(res, err);
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Equipment not found.' });
    res.json(item);
  } catch (err) {
    handleError(res, err);
  }
});

// CREATE (admin and technician)
router.post('/', allowRoles('admin', 'technician'), async (req, res) => {
  try {
    const data = req.body;
    // if available quantity is empty, use total quantity
    if (data.availableQuantity === undefined || data.availableQuantity === '') {
      data.availableQuantity = data.totalQuantity;
    }
    const item = await Equipment.create(data);
    res.status(201).json(item);
  } catch (err) {
    handleError(res, err);
  }
});

// UPDATE (admin and technician)
router.put('/:id', allowRoles('admin', 'technician'), async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Equipment not found.' });

    const fields = [
      'equipmentCode', 'name', 'category', 'location', 'description',
      'totalQuantity', 'availableQuantity', 'condition', 'status',
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) item[f] = req.body[f];
    });

    await item.save();
    res.json(item);
  } catch (err) {
    handleError(res, err);
  }
});

// DELETE (admin only) - not allowed if there are pending/approved reservations or open issues
router.delete('/:id', allowRoles('admin'), async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Equipment not found.' });

    const activeReservations = await Reservation.countDocuments({
      equipment: item._id,
      status: { $in: ['pending', 'approved'] },
    });
    const openIssues = await Issue.countDocuments({
      equipment: item._id,
      status: { $in: ['open', 'in_progress'] },
    });

    if (activeReservations > 0 || openIssues > 0) {
      return res.status(400).json({
        message: 'Cannot delete. This equipment has active reservations or unresolved issues.',
      });
    }

    await Equipment.findByIdAndDelete(item._id);
    res.json({ message: 'Equipment deleted successfully.' });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
