const Question = require('../models/Question');
const TestSubmission = require('../models/TestSubmission');

// Standard scoring scales
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

const NORMAL_OPTION_MARKS = {
    'Strongly Disagree': 1,
    'Disagree': 2,
    'Neutral': 3,
    'Agree': 4,
    'Strongly Agree': 5
};

const REVERSE_OPTION_MARKS = {
    'Strongly Disagree': 5,
    'Disagree': 4,
    'Neutral': 3,
    'Agree': 2,
    'Strongly Agree': 1
};

// Helper to evaluate personality insight based on percentage/score
const generateReportSummary = (percentage, totalScore, maxScore) => {
    if (percentage >= 80) {
        return 'High Independence & Critical Analytical Orientation: Demonstrates strong individual autonomy, high critical scrutiny, and deep reflective problem-solving capabilities.';
    } else if (percentage >= 60) {
        return 'Balanced Pragmatist & Strategic Thinker: Exhibits a well-rounded balance between analytical skepticism and open collaborative execution.';
    } else if (percentage >= 40) {
        return 'Harmonious & Cooperative Team Collaborator: Shows strong inclinations toward consensus building, adaptability, and high team synergy.';
    } else {
        return 'High Receptivity & Adaptive Specialist: Characterized by strong openness to new directions, rapid learning agility, and supportive execution.';
    }
};

// @desc    Create a new question (Admin)
// @route   POST /api/questions
// @access  Public / Admin
exports.createQuestion = async (req, res) => {
    try {
        const { question, category, order, options, scoringType, isActive } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({ success: false, message: 'Question text is required' });
        }

        const type = (scoringType === 'Reverse') ? 'Reverse' : 'Normal';

        // Use custom options if supplied with proper labels & marks, otherwise options based on scoringType
        let questionOptions;
        if (options && Array.isArray(options) && options.length > 0) {
            questionOptions = options;
        } else {
            questionOptions = (type === 'Reverse') ? REVERSE_OPTIONS : NORMAL_OPTIONS;
        }

        const newQuestion = await Question.create({
            question: question.trim(),
            category: category ? category.trim() : 'General Personality',
            scoringType: type,
            options: questionOptions,
            order: order !== undefined ? Number(order) : 0,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({
            success: true,
            message: 'Question added successfully',
            data: newQuestion
        });
    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get active questions for users to take the test
// @route   GET /api/questions
// @access  Public
exports.getActiveQuestions = async (req, res) => {
    try {
        const questions = await Question.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        res.status(200).json({
            success: true,
            count: questions.length,
            data: questions
        });
    } catch (error) {
        console.error('Get active questions error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get all questions for Admin (including active & inactive)
// @route   GET /api/questions/admin
// @access  Admin
exports.getAllQuestionsAdmin = async (req, res) => {
    try {
        const questions = await Question.find().sort({ order: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            count: questions.length,
            data: questions
        });
    } catch (error) {
        console.error('Get admin questions error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Update a question (Admin)
// @route   PUT /api/questions/:id
// @access  Admin
exports.updateQuestion = async (req, res) => {
    try {
        const { question, category, order, options, scoringType, isActive } = req.body;
        const target = await Question.findById(req.params.id);

        if (!target) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        if (question !== undefined) target.question = question.trim();
        if (category !== undefined) target.category = category.trim();
        if (order !== undefined) target.order = Number(order);
        if (isActive !== undefined) target.isActive = isActive;

        if (scoringType !== undefined) {
            const type = (scoringType === 'Reverse') ? 'Reverse' : 'Normal';
            target.scoringType = type;
            if (!options) {
                target.options = (type === 'Reverse') ? REVERSE_OPTIONS : NORMAL_OPTIONS;
            }
        }

        if (options && Array.isArray(options) && options.length > 0) {
            target.options = options;
        }

        await target.save();

        res.status(200).json({
            success: true,
            message: 'Question updated successfully',
            data: target
        });
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Delete a question (Admin)
// @route   DELETE /api/questions/:id
// @access  Admin
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        res.status(200).json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Seed sample questions if empty (Admin / Utility)
// @route   POST /api/questions/seed
// @access  Admin / Public
exports.seedQuestions = async (req, res) => {
    try {
        const sampleQuestions = [
            {
                question: 'I prefer working independently and taking full responsibility for complex project decisions.',
                category: 'Work Autonomy & Leadership',
                scoringType: 'Normal',
                options: NORMAL_OPTIONS,
                order: 1
            },
            {
                question: 'I actively seek out intellectually challenging tasks even when no immediate guidance is provided.',
                category: 'Critical Thinking & Problem Solving',
                scoringType: 'Normal',
                options: NORMAL_OPTIONS,
                order: 2
            },
            {
                question: 'I find it easy to adapt to sudden changes in strategy, environment, or project scope.',
                category: 'Adaptability & Resilience',
                scoringType: 'Normal',
                options: NORMAL_OPTIONS,
                order: 3
            },
            {
                question: 'I prefer structured, clearly defined rules over open-ended, ambiguous assignments.',
                category: 'Work Structure & Discipline',
                scoringType: 'Normal',
                options: NORMAL_OPTIONS,
                order: 4
            },
            {
                question: 'I feel energized when collaborating and brainstorming in large group environments.',
                category: 'Interpersonal Communication',
                scoringType: 'Normal',
                options: NORMAL_OPTIONS,
                order: 5
            },
            {
                question: 'I thoroughly analyze data and evidence before making any major conclusion.',
                category: 'Analytical Orientation',
                scoringType: 'Normal',
                options: NORMAL_OPTIONS,
                order: 6
            },
            {
                question: 'I stay calm and maintain clear focus when working under high-pressure deadlines.',
                category: 'Emotional Stability & Stress Management',
                scoringType: 'Normal',
                options: NORMAL_OPTIONS,
                order: 7
            },
            {
                question: 'I enjoy mentoring others and helping team members overcome learning hurdles.',
                category: 'Empathy & Mentorship',
                scoringType: 'Normal',
                options: NORMAL_OPTIONS,
                order: 8
            },
            {
                question: 'I frequently look for innovative, out-of-the-box approaches to solve everyday problems.',
                category: 'Innovation & Creativity',
                scoringType: 'Normal',
                options: NORMAL_OPTIONS,
                order: 9
            },
            {
                question: 'I prioritize meticulous attention to detail over rapid speed of execution.',
                category: 'Quality & Precision',
                scoringType: 'Normal',
                options: NORMAL_OPTIONS,
                order: 10
            }
        ];

        const inserted = [];
        for (const item of sampleQuestions) {
            const exists = await Question.findOne({ question: item.question });
            if (!exists) {
                const created = await Question.create({
                    ...item,
                    isActive: true
                });
                inserted.push(created);
            }
        }

        res.status(200).json({
            success: true,
            message: `Seeded ${inserted.length} standard questions successfully`,
            data: inserted
        });
    } catch (error) {
        console.error('Seed questions error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ============================================================================
// USER TEST SUBMISSION & ADMIN REPORT CONTROLLER
// ============================================================================

// @desc    Check if an email has already taken the test
// @route   GET /api/test/check/:email
// @access  Public
exports.checkEmailSubmission = async (req, res) => {
    try {
        const email = req.params.email;
        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const existing = await TestSubmission.findOne({
            userEmail: { $regex: new RegExp(`^${email.trim()}$`, 'i') }
        }).sort({ createdAt: -1 });

        if (existing) {
            return res.status(200).json({
                success: true,
                hasTakenTest: true,
                message: 'A student can take this test only once using one email ID. You have already completed this test.',
                data: existing
            });
        }

        return res.status(200).json({
            success: true,
            hasTakenTest: false
        });
    } catch (error) {
        console.error('Check test submission error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Submit user test, compute scores & marks, generate & save report
// @route   POST /api/test/submit
// @access  Public
exports.submitTest = async (req, res) => {
    try {
        const { userName, userEmail, userPhone, userId, responses } = req.body;

        if (!userName || !userName.trim()) {
            return res.status(400).json({ success: false, message: 'User name is required' });
        }
        if (!userEmail || !userEmail.trim()) {
            return res.status(400).json({ success: false, message: 'User email is required' });
        }
        if (!responses || !Array.isArray(responses) || responses.length === 0) {
            return res.status(400).json({ success: false, message: 'Test responses are required' });
        }

        const normalizedEmail = userEmail.trim().toLowerCase();

        // Enforce 1 test per email ID
        const existingSubmission = await TestSubmission.findOne({
            userEmail: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
        }).sort({ createdAt: -1 });

        if (existingSubmission) {
            return res.status(400).json({
                success: false,
                alreadyTaken: true,
                message: 'A student can take this test only once using one email ID. You have already completed this assessment.',
                data: existingSubmission
            });
        }

        // Fetch questions from DB if IDs are provided to get accurate option scoring
        const questionIds = responses
            .map(r => r.questionId)
            .filter(id => id && id.toString().match(/^[0-9a-fA-F]{24}$/));

        let questionsMap = {};
        if (questionIds.length > 0) {
            try {
                const dbQuestions = await Question.find({ _id: { $in: questionIds } });
                dbQuestions.forEach(q => {
                    questionsMap[q._id.toString()] = q;
                });
            } catch (e) {
                console.warn('Error fetching question documents for scoring:', e);
            }
        }

        // Process each response, look up question details or calculate marks according to question scale
        let totalScore = 0;
        const processedResponses = [];
        const categoryMap = {};

        for (const resp of responses) {
            let questionText = resp.questionText || '';
            let category = resp.category || 'General';
            let marks = null;
            const optionLabel = (resp.selectedOption || '').trim();

            const qDoc = resp.questionId ? questionsMap[resp.questionId.toString()] : null;
            if (qDoc) {
                questionText = qDoc.question || questionText;
                category = qDoc.category || category;
                if (qDoc.options && Array.isArray(qDoc.options)) {
                    const matchedOpt = qDoc.options.find(
                        o => o.label.toLowerCase() === optionLabel.toLowerCase()
                    );
                    if (matchedOpt) {
                        marks = matchedOpt.marks;
                    }
                }
            }

            // If not resolved from DB question, check sent marksObtained or fallback mapping
            if (marks === null || marks === undefined) {
                if (resp.marksObtained !== undefined && resp.marksObtained !== null) {
                    marks = Number(resp.marksObtained);
                } else if (NORMAL_OPTION_MARKS[optionLabel] !== undefined) {
                    marks = NORMAL_OPTION_MARKS[optionLabel];
                } else {
                    marks = 3; // fallback Neutral
                }
            }

            totalScore += marks;

            processedResponses.push({
                questionId: resp.questionId || null,
                questionText: questionText || 'Question',
                category: category,
                selectedOption: optionLabel,
                marksObtained: marks
            });

            // Track category breakdowns
            if (!categoryMap[category]) {
                categoryMap[category] = { score: 0, count: 0 };
            }
            categoryMap[category].score += marks;
            categoryMap[category].count += 1;
        }

        const maxScore = processedResponses.length * 5;
        const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
        const summary = generateReportSummary(percentage, totalScore, maxScore);

        const categoryBreakdown = Object.keys(categoryMap).map((catKey) => {
            const catItem = categoryMap[catKey];
            const catMax = catItem.count * 5;
            return {
                category: catKey,
                score: catItem.score,
                maxScore: catMax,
                percentage: catMax > 0 ? Math.round((catItem.score / catMax) * 100) : 0
            };
        });

        // Save submission in database
        const submission = await TestSubmission.create({
            user: userId || (req.user ? req.user.id : null),
            userName: userName.trim(),
            userEmail: normalizedEmail,
            userPhone: userPhone ? userPhone.trim() : '',
            responses: processedResponses,
            totalScore,
            maxScore,
            percentage,
            categoryBreakdown,
            summary
        });

        res.status(201).json({
            success: true,
            message: 'Test submitted and report generated successfully',
            data: submission
        });
    } catch (error) {
        console.error('Submit test error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get all test reports / submissions (Admin)
// @route   GET /api/test/reports
// @access  Admin
exports.getAllSubmissions = async (req, res) => {
    try {
        const submissions = await TestSubmission.find()
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(200).json({
            success: true,
            count: submissions.length,
            data: submissions
        });
    } catch (error) {
        console.error('Get all submissions error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get single test report by ID (Admin or User)
// @route   GET /api/test/reports/:id
// @access  Public / Admin
exports.getSubmissionById = async (req, res) => {
    try {
        const submission = await TestSubmission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }
        res.status(200).json({
            success: true,
            data: submission
        });
    } catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Delete a test submission (Admin)
// @route   DELETE /api/test/reports/:id
// @access  Admin
exports.deleteSubmission = async (req, res) => {
    try {
        const submission = await TestSubmission.findByIdAndDelete(req.params.id);
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        console.error('Delete submission error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

