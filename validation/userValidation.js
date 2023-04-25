const { check, validationResult } = require('express-validator');

const addUserValid = [
  check('name').notEmpty().withMessage('Name is required'),
  check('email').notEmpty().withMessage('Email  is required').isEmail().withMessage('Invalid email'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map(error => {
          return {
            path: error.path,
            message: error.msg
          }
        })
      });
    }
    next();
  }
];

const updateUserValid = [
  check('email').isEmail().withMessage('Invalid email').optional({ nullable: true }),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res ,next)=>{
    const errors = validationResult(req);
    if(! errors.isEmpty()){
        return res.status(400).json(
          {
            errors : errors.array().map(error=>{
              return {
                path:error.path,
                message:error.msg,
              }
            })
          }
        )
    }
  next();
  }
]



module.exports = {
  addUserValid,
  updateUserValid
}