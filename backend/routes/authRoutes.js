const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('phoneNumber').isMobilePhone('any'),
    body('password').isStrongPassword({ minLength: 8, minSymbols: 1 })
  ],
  authController.register
);

router.post('/login', authController.login);
router.post('/request-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

const { protect } = require('../middleware/auth');
const userController = require('../controllers/userController');
router.get('/me', protect, userController.getMe);

router.put("/update", protect, authController.updateProfile);


module.exports = router;
