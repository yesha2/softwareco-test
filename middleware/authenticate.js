let jwt = require('jsonwebtoken');

let User = require('../models/user');
let LoginHistory = require('../models/login_history');
const constants = require('../config/constants');


exports.authenticate = async (req, res, next) => {
    try {
        console.log("Authorization: ", req.header('Authorization'))
        if (!req.header('Authorization')) {
            return res.status(401).json({
                status: false,
                message: "You are Unauthorized to login!"
            });
        }

        let token = req.header('Authorization').toString().replace("Bearer ", "");
        console.log("Token--->", token)
        if (!token) {
            return res.status(401).json({
                status: false,
                message: "You are Unauthorized to login"
            });
        }

        let authorizedUser = jwt.verify(token, process.env.JWT_SECRET);
        console.log("authorizedUser--->", authorizedUser)

        let authToken = await LoginHistory.findOne({ authToken: token, status: constants.USER_STATUS.ACTIVE });
        console.log("Login Data found--->", authToken);

        if (!authToken) {
            return res.status(401).json({
                status: false,
                message: "You are Unauthorized to login."
            });
        }

        req.token = token;
        req.user = await User.findOne({ email: authorizedUser.email });
        console.log("Req User--->", req.user);
        next();
    } catch (error) {
        console.error("Error(authenticate):", error);
        res.status(500).json({
            status: false,
            message: 'Error authenticating User!'
        })
    }
}