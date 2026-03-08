const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const auth = require('../middleware/auth');

router.get('/active', auth, challengeController.getActive);
router.post('/:id/join', auth, challengeController.join);
router.get('/mine', auth, challengeController.getMyChallenges);

module.exports = router;
