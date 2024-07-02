var express = require('express');
var router = express.Router();
let {
    signupValidator,
    loginValidator,
    validationFunction } = require("../validators/user.validation");
let {
    userSignup,
    login,
    logout,
    listUsers, 
    checkAccess,
    updateSameDataForManyUsers,
    updateDifferentDataForManyUsers} = require("../controllers/user.controller");
let { authenticate } = require("../middleware/authenticate");


router.post('/signup', signupValidator, validationFunction, userSignup);
router.post('/login', loginValidator, validationFunction, login);
router.get('/list-users', authenticate, listUsers);

// API to check whether or not the user has access to a particular module for that role or not
router.post('/check-access', checkAccess)

router.put('/update-same-data', authenticate, updateSameDataForManyUsers)
router.put('/update-different-data', authenticate, updateDifferentDataForManyUsers)
router.get('/logout', authenticate, logout);



module.exports = router;
