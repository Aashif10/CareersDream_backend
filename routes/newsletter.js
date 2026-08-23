const express = require('express');
const router = express.Router();
const { subscribe, getSubscribers } = require('../controllers/newsletterController');

router.post('/subscribe', subscribe);
router.get('/', getSubscribers);

module.exports = router;
