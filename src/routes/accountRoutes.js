const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const tokan = require('../middlewares/tokan');

router.post('/create-account', tokan, accountController.createAccount);
router.get('/all-accounts', tokan, accountController.getAllAccounts);
router.get('/single-account/:id', tokan, accountController.getSingleAccount);
router.put('/update-account/:id', tokan, accountController.updateAccount);
router.delete('/delete-account/:id', tokan, accountController.deleteAccount);

module.exports = router;