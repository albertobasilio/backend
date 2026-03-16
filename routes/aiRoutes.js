const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// Configure multer for image upload (max 50MB)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas.'), false);
        }
    }
});

router.post('/analyze-image', auth, upload.single('image'), aiController.analyzeImage);
router.post('/generate-recipes', auth, aiController.generateRecipes);
router.post('/enrich-instructions', auth, aiController.enrichInstructions);

module.exports = router;
