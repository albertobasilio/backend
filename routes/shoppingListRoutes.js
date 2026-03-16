const express = require('express');
const router = express.Router();
const shoppingListController = require('../controllers/shoppingListController');
const auth = require('../middleware/auth');
const { requirePlan } = require('../middleware/access');

router.post('/', auth, requirePlan('pro'), shoppingListController.create);
router.get('/', auth, requirePlan('pro'), shoppingListController.getAll);
router.put('/item/:itemId/toggle', auth, requirePlan('pro'), shoppingListController.toggleItem);
router.delete('/:id', auth, requirePlan('pro'), shoppingListController.delete);
router.post('/generate', auth, requirePlan('pro'), shoppingListController.generateFromMealPlan);

module.exports = router;
