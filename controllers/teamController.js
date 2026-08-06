const TeamMember = require('../models/TeamMember');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
// @desc    Add a new team member
// @route   POST /api/team/add
// @access  Private (Admin)
exports.addMember = async (req, res) => {
    try {
        const { name, phone, email, password } = req.body;

        // Validate required fields
        if (!name || !phone || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, phone, email, and password'
            });
        }

        // Check if email already exists
        const existing = await TeamMember.findOne({ email });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'A team member with this email already exists'
            });
        }

        // Build member data
        const memberData = { name, phone, email, password };

        // Attach uploaded image path if provided
        if (req.file) {
            memberData.profileImage = req.file.filename;
        }

        const member = await TeamMember.create(memberData);

        res.status(201).json({
            success: true,
            message: 'Team member added successfully',
            data: {
                _id: member._id,
                name: member.name,
                phone: member.phone,
                email: member.email,
                profileImage: member.profileImage,
                role: member.role,
                createdAt: member.createdAt
            }
        });
    } catch (error) {
        console.error('addMember error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Authenticate a team member
// @route   POST /api/team/login
// @access  Public
exports.loginMember = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        // Check for member (include password for comparison)
        const member = await TeamMember.findOne({ email }).select('+password');

        if (!member) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await member.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        res.status(200).json({
            success: true,
            _id: member.id,
            name: member.name,
            email: member.email,
            role: member.role,
            profileImage: member.profileImage,
            token: generateToken(member._id)
        });
    } catch (error) {
        console.error('Team login error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get all team members
// @route   GET /api/team
// @access  Private (Admin)
exports.getAllMembers = async (req, res) => {
    try {
        const members = await TeamMember.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: members.length,
            data: members
        });
    } catch (error) {
        console.error('getAllMembers error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get single team member
// @route   GET /api/team/:id
// @access  Private (Admin)
exports.getMember = async (req, res) => {
    try {
        const member = await TeamMember.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }
        res.status(200).json({ success: true, data: member });
    } catch (error) {
        console.error('getMember error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update a team member
// @route   PUT /api/team/:id
// @access  Private (Admin)
exports.updateMember = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Don't allow password update through this route
        delete updateData.password;

        // Update profile image if a new file was uploaded
        if (req.file) {
            updateData.profileImage = req.file.filename;
        }

        const member = await TeamMember.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Team member updated successfully',
            data: member
        });
    } catch (error) {
        console.error('updateMember error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete a team member
// @route   DELETE /api/team/:id
// @access  Private (Admin)
exports.deleteMember = async (req, res) => {
    try {
        const member = await TeamMember.findByIdAndDelete(req.params.id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Team member deleted successfully'
        });
    } catch (error) {
        console.error('deleteMember error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
