const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutritionController');
const auth = require('../middleware/auth');
const { requirePlan } = require('../middleware/access');
const { validateNutritionLog } = require('../middleware/validate');

router.post('/log', auth, requirePlan('pro'), validateNutritionLog, nutritionController.logMeal);
router.get('/daily', auth, requirePlan('pro'), nutritionController.getDailySummary);
router.get('/weekly', auth, requirePlan('pro'), nutritionController.getWeeklySummary);
router.get('/tips', auth, requirePlan('pro'), nutritionController.getTips);

module.exports = router;
