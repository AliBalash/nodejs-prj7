const asynchandler = require('express-async-handler');
const generateToken = require('../auth/generateToken');
const User = require('../models/UserModel');

const allUser = asynchandler(async (req, res) => {


    try {
        const users = await User.find();
        res.json(users);

    } catch (error) {
        throw new Error('some thing wrong!please try again')
    }
}
);


const createUser = asynchandler(async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = await User.create({
            name, email, password
        })
        res.json(newUser);

    } catch (error) {
        throw new Error('Error Create User : ' + error)
    }
}
);


const updateUser = asynchandler(async (req, res) => {
    const id = req?.params?.id;
    const { name, email, password } = req?.body;
    try {

        const updateUser = await User.findOneAndUpdate({ _id: id }, {
            name,
            email,
            password
        }, {
            new: true
        })
        res.json(updateUser);
    } catch (error) {
        throw new Error('Error Update User : ' + error)
    }
}
);


const login = asynchandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });


    if (user && await user.comparePassword(password)) {
        const token = generateToken(user.id);

        res.json({
            token
        })
    }
    else {
        throw new Error("Email or Password Is Not Valid")
    }

})


module.exports = {
    allUser,
    createUser,
    updateUser,
    login,
}

