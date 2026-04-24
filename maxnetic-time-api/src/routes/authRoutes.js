const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/admin/register', authController.adminRegister);
router.post('/admin/login', authController.adminLogin);
router.post('/register', authController.register); // สร้างพนักงานใหม่
router.post('/login', authController.login);       // ล็อคอิน
router.get('/users', authController.getAllUsers);

module.exports = router;