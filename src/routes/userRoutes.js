const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const tokan = require('../middlewares/tokan');
const roleCheck = require('../middlewares/rolecheck');

router.post('/register', tokan, roleCheck('super-admin'), userController.register);
router.post('/login', userController.login);
router.get('/me', tokan, userController.getMe);
router.get('/all-users', tokan, userController.getAllUsers);
router.get('/all-users/admin-only', tokan, roleCheck('super-admin'), userController.getAllUsers);
router.put('/update-user-info/:email', tokan, roleCheck('super-admin'), userController.updateUserInfo);
router.delete('/delete-user/:email', tokan, roleCheck('super-admin'), userController.deleteUserByEmail);

module.exports = router;