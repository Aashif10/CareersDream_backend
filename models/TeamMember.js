const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teamMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a full name'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    profileImage: {
        type: String,          // stores filename / relative path
        default: null
    },
    role: {
        type: String,
        default: 'member'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
teamMemberSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
teamMemberSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('TeamMember', teamMemberSchema);
