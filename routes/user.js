const express = require('express');
const auchCheck = require('../auth/authCheck');
const router = express.Router();
const { allUser, createUser, updateUser, login } = require('../controller/userController');
const isIdValid = require('../validation/objectID');
const { addUserValid, updateUserValid } = require('../validation/userValidation');


router.post('/login',login);
router.post('/all',auchCheck,allUser);
router.post('/add',auchCheck,addUserValid,createUser);
router.post('/update/:id', isIdValid, updateUserValid, updateUser)






module.exports = router;