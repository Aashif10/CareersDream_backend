const mongoose = require('mongoose');

const responseItemSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    },
    questionText: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'General'
    },
    selectedOption: {
        type: String,
        required: true
    },
    marksObtained: {
        type: Number,
        required: true
    }
}, { _id: false });

const testSubmissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    userName: {
        type: String,
        required: [true, 'User name is required'],
        trim: true
    },
    userEmail: {
        type: String,
        required: [true, 'User email is required'],
        trim: true
    },
    userPhone: {
        type: String,
        trim: true,
        default: ''
    },
    responses: [responseItemSchema],
    totalScore: {
        type: Number,
        required: true
    },
    maxScore: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    categoryBreakdown: [
        {
            category: String,
            score: Number,
            maxScore: Number,
            percentage: Number
        }
    ],
    summary: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TestSubmission', testSubmissionSchema);
