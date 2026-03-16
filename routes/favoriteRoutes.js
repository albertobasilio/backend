const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const auth = require('../middleware/auth');
const { requirePlan } = require('../middleware/access');

router.post('/', auth, requirePlan('basic'), favoriteController.add);
router.delete('/:recipeId', auth, requirePlan('basic'), favoriteController.remove);
router.get('/', auth, requirePlan('basic'), favoriteController.getAll);
router.get('/check/:recipeId', auth, requirePlan('basic'), favoriteController.check);

module.exports = router;
