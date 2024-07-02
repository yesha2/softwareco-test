let User = require('../models/user');
const constants = require('../config/constants')
const jwt = require('jsonwebtoken');
const moment = require('moment');


exports.generateAuthToken = async (email) => {
    let user = await User.findOne({ email });
    let token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    console.log("Token--->", token);
    const expiry = moment().add(30, 'days').format('X');
    return { token, expiry };
}