const express = require('express');
const router = express.Router();
const { 
    subscribe, 
    getSubscribers, 
    deleteSubscriber,
    toggleSubscriberStatus 
} = require('../controllers/newsletterController');

router.post('/subscribe', subscribe);
router.get('/', getSubscribers);
router.delete('/:id', deleteSubscriber);
router.patch('/:id/toggle', toggleSubscriberStatus);

module.exports = router;

