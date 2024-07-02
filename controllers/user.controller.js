const bcrypt = require('bcrypt');
let User = require('../models/user');
let Role = require('../models/roles');
let LoginHistory = require('../models/login_history');
const constants = require('../config/constants');
let { generateAuthToken } = require('../services/commonFunctions');


module.exports.userSignup = async (req, res) => {
    try {
        const userFound = await User.findOne({ email: req.body.email });
        if (userFound) {
            return res.status(400).json({
                status: false,
                message: "You already have an account, Please login!"
            });
        }

        const newUserObj = {
            firstName: req.body?.firstName || "",
            lastName: req.body?.lastName || "",
            userName: req.body.userName,
            email: req.body.email,
            roleId: req.body?.roleId || null
        }

        newUserObj.password = await bcrypt.hash(req.body.password, 10);
        let user = await User.create(newUserObj);

        res.status(201).json({
            status: true,
            message: 'User created Successfully',
            data: user
        })
    } catch (error) {
        console.error("Error(userSignup): ", error)
        res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
}


module.exports.login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email }).lean();
        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found, Please Register!'
            })
        }
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: false,
                message: 'Invalid Credentials'
            })
        }
        console.log("User logged in--->", user);
        let { token, expiry } = await generateAuthToken(user.email);

        await LoginHistory.create({
            userId: user._id,
            authToken: token,
            tokenExpiry: expiry,
            status: constants.USER_STATUS.ACTIVE
        });
        user.token = token;
        user.tokenExpiry = Number(expiry);

        res.json({
            status: true,
            message: 'Login Successfull',
            data: user
        })
    } catch (error) {
        console.error("Error(login): ", error)
        res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
}


module.exports.listUsers = async (req, res) => {
    try {
        let condition = {};

        if (req.query.searchTerm) {
            condition = {
                $or: [
                    { userName: new RegExp(req.query.searchTerm, 'i') },
                    { firstName: new RegExp(req.query.searchTerm, 'i') },
                    { lastName: new RegExp(req.query.searchTerm, 'i') },
                    { email: new RegExp(req.query.searchTerm, 'i') }
                ]
            };
        }

        console.log(condition);
        let aggregateCond = [
            { $match: condition },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'roleId',
                    foreignField: '_id',
                    as: 'role'
                }
            },
            { $unwind: '$role' },
            {
                $project: {
                    _id: 1,
                    userName: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    roleName: '$role.roleName',
                    accessModules: '$role.accessModules'
                }
            }
        ];

        let users = await User.aggregate(aggregateCond);
        const userList = users.map(user => {
            return {
                _id: user._id,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                userName: user.userName || "",
                email: user.email,
                roleName: user.roleName || "",
                accessModules: user.accessModules || []
            };
        });

        res.json({
            status: true,
            message: 'User List fetched successfully!',
            data: userList
        })
    } catch (error) {
        console.error("Error(listUsers):", error);
        res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
}

module.exports.checkAccess = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User Not found!"
            });
        }

        let role = await Role.findById(user.roleId);
        if (!role) {
            return res.status(404).json({
                status: false,
                message: "Role not found!"
            });
        }

        // Check if the user has access to particular module  or not
        let accessModules = role.accessModules;
        if (!accessModules.includes(req.body.module)) {
            return res.status(403).json({
                status: false,
                message: "Access denied! You don't have access to this module."
            });
        }

        res.json({
            status: true,
            message: 'Access Granted!',
            data: accessModules
        })

    } catch (error) {
        console.error("Error(checkAccess): ", error)
        res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
}

module.exports.updateSameDataForManyUsers = async (req, res) => {
    try {

        // {
        //     "users": ["5e9f8f8f8f8f8f8f8f8f8f8", "5e9f8f8f8f8f8f8f8f8f8f9"],
        //     "updateData": {
        //       "lastName": "Thakkar"
        //     }
        //   }

        if (req.body.updateData.email || req.body.updateData.password) {
            return res.status(400).json({
                status: false,
                message: "email or password cannot be updated!"
            })
        }

        await User.updateMany({ _id: { $in: req.body.users } }, { $set: req.body.updateData });

        const updatedUsers = await User.find({ _id: { $in: req.body.users } });
        res.json({
            status: true,
            message: 'Users data updated successfully!',
            data: updatedUsers
        })
    } catch (error) {
        console.error("Error(updateSameDataForManyUsers): ", error)
        res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
}

module.exports.updateDifferentDataForManyUsers = async (req, res) => {
    try {

        // "userUpdates" : [
        //     {
        //         "userId": "66842ab2dec7b5a08b521001",
        //         "updates": {
        //             "firstName": "Yesha"
        //         }
        //     },
        //     {
        //         "userId": "668423b7a6c662a7d6402fd7",
        //         "updates": {
        //             "userName": "Jack123"
        //         }
        //     }
        // ]

        for (const userUpdate of req.body.userUpdates) {
            const { userId, updates } = userUpdate;

            const user = await User.findById(userId);
            if (!user) {
                continue;
            }

            // Update the user fields
            Object.keys(updates).forEach((key) => {
                user[key] = updates[key];
            });

            await user.save();
        }

        res.status(200).json({ 
            status: true, 
            message: 'Users updated successfully' 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
}

module.exports.logout = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User Not found!"
            });
        }

        await LoginHistory.findOneAndUpdate({ authToken: req.token }, {
            status: constants.USER_STATUS.INACTIVE,
            $unset: {
                authToken: 1,
                tokenExpiry: 1
            }
        });
        res.json({
            status: true,
            message: 'User Logged Out Successfully!'
        })
    } catch (error) {
        console.error("Error(login): ", error);
        res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
}