const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');

// กำหนด Endpoint
router.post('/', siteController.createSite); // ยิง POST มาที่ /api/sites เพื่อสร้าง
router.get('/', siteController.getAllSites); // ยิง GET มาที่ /api/sites เพื่อดูทั้งหมด
router.put('/:id', siteController.updateSite);

module.exports = router;