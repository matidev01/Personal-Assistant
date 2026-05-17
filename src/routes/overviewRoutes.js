const express = require('express');
const router = express.Router();
const { getOverviewStats } = require('../controllers/overviewController');
const tokan = require('../middlewares/tokan');

router.get('/stats', tokan, getOverviewStats);

module.exports = router;
