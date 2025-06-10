// routes/managers.js
const express = require('express');
const router = express.Router();
const Manager = require('../models/manager');

// Get all managers
router.get('/', async (req, res) => {
  try {
    const managers = await Manager.find().select('-password');
    res.json(managers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new manager
router.post('/', async (req, res) => {
  const manager = new Manager({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    gender: req.body.gender,
    password: req.body.password // In production, you should hash this
  });

  try {
    const newManager = await manager.save();
    res.status(201).json(newManager);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update manager
router.patch('/:id', async (req, res) => {
  try {
    const manager = await Manager.findById(req.params.id);
    if (!manager) return res.status(404).json({ message: 'Manager not found' });

    if (req.body.name) manager.name = req.body.name;
    if (req.body.email) manager.email = req.body.email;
    if (req.body.phone) manager.phone = req.body.phone;
    if (req.body.gender) manager.gender = req.body.gender;
    if (req.body.password) manager.password = req.body.password;

    const updatedManager = await manager.save();
    res.json(updatedManager);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete manager
router.delete('/:id', async (req, res) => {
  try {
    const manager = await Manager.findByIdAndDelete(req.params.id);
    if (!manager) return res.status(404).json({ message: 'Manager not found' });
    res.json({ message: 'Manager deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;