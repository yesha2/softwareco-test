var express = require('express');
var router = express.Router();
let {
    accessModuleValidator,
    validationFunction } = require("../validators/role.validation");
const { addAccessModule, removeAccessModule, updateAccessModules, createRole } = require('../controllers/role.controller');

router.post('/create-role', createRole);
router.put('/add-access-module/:roleId', accessModuleValidator, validationFunction, addAccessModule);
router.put('/update-access-module/:roleId', accessModuleValidator, validationFunction, updateAccessModules);
router.put('/remove-access-module/:roleId', accessModuleValidator, validationFunction, removeAccessModule);

module.exports = router;
