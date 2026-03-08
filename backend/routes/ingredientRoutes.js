const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const auth = require('../middleware/auth');
const { requirePlan } = require('../middleware/access');

// Static routes MUST come before parameterized routes
router.get('/history/scans', auth, requirePlan('basic'), ingredientController.getScanHistory);
router.post('/scan', auth, requirePlan('basic'), ingredientController.saveScanResults);
router.post('/substitutions', auth, ingredientController.getSubstitutions);
router.get('/', ingredientController.getAll);
router.get('/:id', ingredientController.getById);

module.exports = router;
