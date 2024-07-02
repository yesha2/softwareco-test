const { body, validationResult } = require('express-validator');

module.exports.signupValidator = [
    body('email')
        .not()
        .isEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please enter a valid email address"),

    body('userName')
        .not()
        .isEmpty()
        .withMessage("userName is required")
        .isString()
        .withMessage("userName should be a string value"),

    body('password')
        .custom((value) => {
            if(!value) throw new Error('Password is required');
            if(typeof value !== 'string') throw new Error('Password must be a string')
            if(value.length < 6 || value.length >= 12) throw new Error('Password length must be between 6 to 12 characters');
            return true;
        })
]


module.exports.loginValidator = [
    body('email')
        .not()
        .isEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please enter a valid email address"),

    body('password')
    .custom((value) => {
        if(!value) throw new Error('Password is required');
        else {
            if(typeof value !== 'string') throw new Error('Password must be a string')
            else {
                if(value.length < 6 || value.length >= 12) throw new Error('Password length must be between 6 to 12 characters');
                else return true;
            }
        }
    })
]

module.exports.validationFunction = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty) {
        return res.status(422).json({
            status: 'Failure',
            message: errors.array()[0].message
        });
    }
    next();
}