const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');


const auchCheck = asyncHandler(async (req, res, next) => {
    let token;

    if (req?.headers?.authorization?.startsWith('Bearer')) {
        token = req?.headers?.authorization?.split(' ')[1];
        if (token) {
            const decode = jwt.verify(token, process.env.JWT_SECRET)
            const user = await User.findById(decode.id)
            if (!user) {

                res.status(400).json({
                    error: "Not Authorized token Valid , User Not Found"
                })
            }
            console.log(user);

            req.user = user;
            next();
        }

    } else {
        res.status(400).json({
            error: "there is no token atached to Authorized"
        })
    }


})

module.exports = auchCheck