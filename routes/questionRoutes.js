const express = require('express');
const router = express.Router();
const {
    createQuestion,
    getActiveQuestions,
    getAllQuestionsAdmin,
    updateQuestion,
    deleteQuestion,
    seedQuestions,
    submitTest,
    checkEmailSubmission,
    getAllSubmissions,
    getSubmissionById,
    deleteSubmission
} = require('../controllers/questionController');

// Question CRUD Routes
router.post('/questions', createQuestion);
router.get('/questions', getActiveQuestions);
router.get('/questions/admin', getAllQuestionsAdmin);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);
router.post('/questions/seed', seedQuestions);

// Test Submission & Reports Routes
router.get('/test/check/:email', checkEmailSubmission);
router.post('/test/submit', submitTest);
router.get('/test/reports', getAllSubmissions);
router.get('/test/reports/:id', getSubmissionById);
router.delete('/test/reports/:id', deleteSubmission);

module.exports = router;
