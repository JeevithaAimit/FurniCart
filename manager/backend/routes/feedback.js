const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback');

// GET all feedbacks
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    if (!feedbacks.length) {
      return res.status(404).json({ message: 'No feedback available' });
    }
    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
