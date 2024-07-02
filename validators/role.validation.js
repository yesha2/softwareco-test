const { body, validationResult } = require('express-validator');

module.exports.accessModuleValidator = [
    body('accessModule')
        .not()
        .isEmpty()
        .withMessage("accessModule is required")
        .withMessage("User Type should be a number")
]

module.exports.validationFunction = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
        return res.status(422).json({
            status: 'Failure',
            message: errors.array()[0].message
        });
    }
    next();
}