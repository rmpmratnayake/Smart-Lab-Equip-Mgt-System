const express = require('express');
const Issue = require('../models/Issue');
const Equipment = require('../models/Equipment');
const { auth, allowRoles } = require('../middleware/auth');
const { handleError } = require('../helpers');

const router = express.Router();

router.use(auth);

// READ - students see only their own reports
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student') filter.reportedBy = req.user._id;
    if (req.query.status) filter.status = req.query.status;

    const list = await Issue.find(filter)
      .populate('equipment', 'name equipmentCode')
      .populate('reportedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    handleError(res, err);
  }
});

// CREATE - any logged in user can report a problem
router.post('/', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.body.equipment);
    if (!equipment) return res.status(400).json({ message: 'Please select a valid equipment.' });

    const issue = await Issue.create({
      equipment: req.body.equipment,
      reportedBy: req.user._id,
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
    });
    res.status(201).json(issue);
  } catch (err) {
    handleError(res, err);
  }
});

// UPDATE status (admin and technician)
router.put('/:id', allowRoles('admin', 'technician'), async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found.' });

    if (req.body.status) issue.status = req.body.status;
    if (req.body.priority) issue.priority = req.body.priority;
    await issue.save();
    res.json(issue);
  } catch (err) {
    handleError(res, err);
  }
});

// DELETE (admin only)
router.delete('/:id', allowRoles('admin'), async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found.' });
    res.json({ message: 'Issue deleted.' });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
