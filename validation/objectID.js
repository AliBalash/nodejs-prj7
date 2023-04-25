const { check,validationResult } = require('express-validator');


const isIdValid = [
    check('id').isMongoId().withMessage('Id Ss Not Valid'),
    (req , res , next)=>{
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

]

module.exports = isIdValid;