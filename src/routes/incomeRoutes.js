const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
const tokan = require('../middlewares/tokan');

router.post('/create', tokan, incomeController.createProject);
router.get('/all', tokan, incomeController.getProjects);
router.put('/update/:id', tokan, incomeController.updateProject);

module.exports = router;
