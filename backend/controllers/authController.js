const User = require('../models/User');
const generateTokenAndSetCookie = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user (password is automatically hashed by our Mongoose model)
        const user = await User.create({
            name,
            email,
            phone,
            password
        });

        if (user) {
            generateTokenAndSetCookie(res, user._id);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email and explicitly select the password field
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            generateTokenAndSetCookie(res, user._id);
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0) // Instantly expire the cookie
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private (Requires Token)
const getMe = async (req, res) => {
    // req.user is populated by our 'protect' middleware!
    const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role
    };

    res.status(200).json(user);
};

// @desc    Apply to become a seller
// @route   POST /api/auth/apply-seller
// @access  Private
const applySeller = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.sellerStatus === 'pending') {
            return res.status(400).json({ message: 'You already have a pending seller request.' });
        }
        if (user.role === 'seller' || user.role === 'admin') {
            return res.status(400).json({ message: 'You are already a seller or admin.' });
        }

        // FIX: Bypass pre-save hooks and update the document directly
        await User.findByIdAndUpdate(req.user._id, { sellerStatus: 'pending' });

        res.status(200).json({ message: 'Seller application submitted successfully!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all pending seller requests
// @route   GET /api/auth/seller-requests
// @access  Private/Admin
const getSellerRequests = async (req, res) => {
    try {
        const requests = await User.find({ sellerStatus: 'pending' }).select('-password');
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or Reject a seller
// @route   PUT /api/auth/:id/seller-status
// @access  Private/Admin
const updateSellerStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Prepare exactly what we want to change
        const updatedData = { sellerStatus: status };
        if (status === 'approved') {
            updatedData.role = 'seller';
        }

        // FIX: Bypass pre-save hooks and update the document directly
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true } // Tells Mongoose to return the fresh data
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: `Seller request ${status}`, user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    applySeller,
    getSellerRequests,
    updateSellerStatus
};