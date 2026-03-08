const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/access');
const adminController = require('../controllers/adminController');

router.get('/users', auth, requireRole('admin'), adminController.getUsers);
router.put('/users/:id/access', auth, requireRole('admin'), adminController.updateUserAccess);
router.get('/metrics', auth, requireRole('admin'), adminController.getMetrics);
router.get('/recipes', auth, requireRole('admin'), adminController.listRecipes);
router.post('/recipes', auth, requireRole('admin'), adminController.createRecipe);
router.put('/recipes/:id', auth, requireRole('admin'), adminController.updateRecipe);
router.delete('/recipes/:id', auth, requireRole('admin'), adminController.deleteRecipe);

module.exports = router;
