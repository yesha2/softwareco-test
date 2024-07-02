let mongoose = require('mongoose');
let constants = require('../config/constants');

let userSchema = new mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String,
    },
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength:6
    },
    // roleId field that has reference to the role collection
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roles'
    }
}, { timestamps:true } );

let User = mongoose.model('User', userSchema)
module.exports = User;