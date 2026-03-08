const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const { validateRecipeGenerate } = require('../middleware/validate');

router.get('/', optionalAuth, recipeController.getAll);
router.get('/public/:id', recipeController.getPublicById);
router.get('/:id', auth, recipeController.getById);
router.post('/generate', auth, validateRecipeGenerate, recipeController.generateFromIngredients);
router.post('/match', auth, recipeController.getMatchingRecipes);
router.post('/save', auth, recipeController.saveRecipe);

module.exports = router;
