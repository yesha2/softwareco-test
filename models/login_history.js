let mongoose = require('mongoose');
let constants = require('../config/constants');

let loginHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    status: {
        type: Number
    },
    authToken: {
        type: String,
        default: constants.USER_STATUS.ACTIVE
    },
    tokenExpiry:{
        type: Number
    }
},{
    timestamps: true
})

loginHistorySchema.index({userId:1});
loginHistorySchema.index({userId:1, status:1});


let LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);
module.exports = LoginHistory;