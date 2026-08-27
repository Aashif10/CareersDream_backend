const mongoose = require('mongoose');

const NORMAL_OPTIONS = [
    { label: 'Strongly Disagree', marks: 1 },
    { label: 'Disagree', marks: 2 },
    { label: 'Neutral', marks: 3 },
    { label: 'Agree', marks: 4 },
    { label: 'Strongly Agree', marks: 5 }
];

const REVERSE_OPTIONS = [
    { label: 'Strongly Disagree', marks: 5 },
    { label: 'Disagree', marks: 4 },
    { label: 'Neutral', marks: 3 },
    { label: 'Agree', marks: 2 },
    { label: 'Strongly Agree', marks: 1 }
];

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Please add question text'],
        trim: true
    },
    category: {
        type: String,
        default: 'General Personality',
        trim: true
    },
    scoringType: {
        type: String,
        enum: ['Normal', 'Reverse'],
        default: 'Normal'
    },
    options: {
        type: [
            {
                label: { type: String, required: true },
                marks: { type: Number, required: true }
            }
        ],
        default: NORMAL_OPTIONS
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Question', questionSchema);
module.exports.NORMAL_OPTIONS = NORMAL_OPTIONS;
module.exports.REVERSE_OPTIONS = REVERSE_OPTIONS;

