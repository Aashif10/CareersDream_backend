const Newsletter = require('../models/Newsletter');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email address.' });
        }

        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if already subscribed
        const existingSubscriber = await Newsletter.findOne({ email: normalizedEmail });

        if (existingSubscriber) {
            if (!existingSubscriber.isActive) {
                existingSubscriber.isActive = true;
                existingSubscriber.subscribedAt = new Date();
                await existingSubscriber.save();
                return res.status(200).json({
                    success: true,
                    message: 'Welcome back! You have re-subscribed to our newsletter.'
                });
            }
            return res.status(400).json({
                success: false,
                message: 'This email is already subscribed to our newsletter!'
            });
        }

        // Create subscriber
        await Newsletter.create({
            email: normalizedEmail
        });

        res.status(201).json({
            success: true,
            message: 'Thank you for subscribing to CareersDream newsletter!'
        });
    } catch (error) {
        console.error('Newsletter subscribe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe. Please try again later.'
        });
    }
};

// @desc    Get all subscribers (for admin)
// @route   GET /api/newsletter
// @access  Private/Admin
exports.getSubscribers = async (req, res) => {
    try {
        const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });
        res.status(200).json({
            success: true,
            count: subscribers.length,
            data: subscribers
        });
    } catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
