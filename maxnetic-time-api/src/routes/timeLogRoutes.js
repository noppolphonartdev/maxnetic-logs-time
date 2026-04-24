// src/routes/timeLogRoutes.js
const express = require('express');
const router = express.Router();
const timeLogController = require('../controllers/timeLogController');

router.post('/clock-in', timeLogController.clockIn);
router.get('/', timeLogController.getAllLogs);

router.get('/status/:userId', timeLogController.checkTodayStatus);
router.post('/clock-out', timeLogController.clockOut);

module.exports = router;