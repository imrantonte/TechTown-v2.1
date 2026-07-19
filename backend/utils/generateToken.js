const jwt = require('jsonwebtoken');

const generateTokenAndSetCookie = (res, userId) => {
    // Generate token without expiration (as you requested in the .env)
    const token = jwt.sign({ userId }, process.env.JWT_SECRET);

    // Set JWT as an HTTP-Only cookie
    res.cookie('jwt', token, {
        httpOnly: true, // Prevents XSS attacks (JavaScript cannot read this cookie)
        secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // Allows cross-site cookie in production
        maxAge: 10 * 365 * 24 * 60 * 60 * 1000 // Lasts 10 years (effectively infinite)
    });
};

module.exports = generateTokenAndSetCookie;