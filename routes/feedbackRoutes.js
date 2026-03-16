const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/access');

// All feedback routes require authentication
router.use(auth);

// General App Feedback
router.post('/', feedbackController.submitFeedback);
router.get('/', requireRole('admin'), feedbackController.getAllFeedback);

// Recipe Specific Feedback
router.post('/recipe', feedbackController.submitRecipeReview);
router.get('/recipe/:recipe_id', feedbackController.getRecipeReviews);

module.exports = router;
