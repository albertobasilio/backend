const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');
const auth = require('../middleware/auth');
const { requirePlan } = require('../middleware/access');
const { validateMealPlan } = require('../middleware/validate');

router.post('/', auth, requirePlan('basic'), validateMealPlan, mealPlanController.create);
router.get('/', auth, requirePlan('basic'), mealPlanController.getAll);
router.get('/:id', auth, requirePlan('basic'), mealPlanController.getById);
router.delete('/:id', auth, requirePlan('basic'), mealPlanController.delete);

module.exports = router;
