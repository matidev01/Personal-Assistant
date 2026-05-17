const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const tokan = require('../middlewares/tokan');

router.post('/create', tokan, loanController.createLoan);
router.get('/all', tokan, loanController.getLoans);
router.get('/:id', tokan, loanController.getLoan);
router.put('/update/:id', tokan, loanController.updateLoan);
router.delete('/delete/:id', tokan, loanController.deleteLoan);
router.post('/:id/payment', tokan, loanController.addPayment);
router.post('/:id/comment', tokan, loanController.addComment);

module.exports = router;
