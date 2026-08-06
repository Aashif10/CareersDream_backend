const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');
const {
    addMember,
    getAllMembers,
    getMember,
    updateMember,
    deleteMember,
    loginMember
} = require('../controllers/teamController');

// POST   /api/team/add        — Add a new team member (with optional image)
router.post('/add', upload.single('profileImage'), addMember);

// POST   /api/team/login      — Authenticate a team member
router.post('/login', loginMember);

// GET    /api/team            — Get all team members
router.get('/', getAllMembers);

// GET    /api/team/:id        — Get a single team member
router.get('/:id', getMember);

// PUT    /api/team/:id        — Update a team member (with optional new image)
router.put('/:id', upload.single('profileImage'), updateMember);

// DELETE /api/team/:id        — Delete a team member
router.delete('/:id', deleteMember);

module.exports = router;
