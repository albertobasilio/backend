const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateProfile
} = require('../middleware/validate');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/guest-login', authController.guestLogin);
router.post('/log-action', authController.logGuestAction);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, validateProfile, authController.updateProfile);
router.put('/dietary-profile', auth, authController.updateDietaryProfile);

module.exports = router;
