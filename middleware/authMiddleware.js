const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            return next(); // ← use return so code below is never reached
        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    // If we reach here, no token was found
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
};
