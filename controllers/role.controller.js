let User = require('../models/user');
let Role = require('../models/roles');
let LoginHistory = require('../models/login_history');
const constants = require('../config/constants');
let { generateAuthToken } = require('../services/commonFunctions');


module.exports.createRole = async (req, res) => {
    try {

        const roleObj = {
            roleName: req.body.roleName,
            accessModules: req.body.accessModules,
        };

        // Check if the role already exists
        const existingRole = await Role.findOne({ roleName: roleObj.roleName });
        if (existingRole) {
            return res.status(400).json({
                status: false,
                message: 'Role already exists',
            });
        }

        const role = await Role.create(roleObj);
        res.json({
            status: true,
            message: 'Role added successfully',
            data: role
        });
    } catch (error) {
        console.error('Error(addAccessModule):', error);
        res.status(500).json({
            status: false,
            message: 'Error while adding access module',
        });
    }
};

module.exports.addAccessModule = async (req, res) => {
    try {

        // Find the role
        const role = await Role.findById(req.params.roleId);
        if (!role) {
            return res.status(404).json({
                status: false,
                message: 'Role not found',
            });
        }

        // Check if the access module already exists
        if (role.accessModules.includes(req.body.accessModule)) {
            return res.status(400).json({
                status: false,
                message: 'Access module already exist',
            });
        }

        // Add the access module
        role.accessModules.push(req.body.accessModule);
        await role.save();

        res.json({
            status: true,
            message: 'Access module added successfully',
            data: {
                accessModules: role.accessModules,
            }
        });
    } catch (error) {
        console.error('Error(addAccessModule):', error);
        res.status(500).json({
            status: false,
            message: 'Error while adding access module',
        });
    }
};

module.exports.updateAccessModules = async (req, res) => {
    try {

        // Find the role by ID
        const role = await Role.findById(req.params.roleId);

        if (!role) {
            return res.status(404).json({ status: false, message: 'Role not found' });
        }

        // Update the access modules
        role.accessModules = req.body.accessModules;

        await role.save();

        res.status(200).json({ status: true, message: 'Access modules updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

module.exports.removeAccessModule = async (req, res) => {
    try {

        // Find the role
        const role = await Role.findById(req.params.roleId);
        if (!role) {
            return res.status(404).json({
                status: false,
                message: 'Role not found',
            });
        }

        // Check if the access module exists
        if (!role.accessModules.includes(req.body.accessModule)) {
            return res.status(404).json({
                status: false,
                message: 'Access module not found',
            });
        }

        // Remove the access module
        role.accessModules = role.accessModules.filter((module) => module !== req.body.accessModule);
        await role.save();

        res.json({
            status: true,
            message: 'Access module removed successfully',
            data: {
                accessModules: role.accessModules,
            },
        });
    } catch (error) {
        console.error('Error(removeAccessModule):', error);
        res.status(500).json({
            status: false,
            message: 'Error while removing access module',
        });
    }
};