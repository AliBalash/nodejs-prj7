const mongooes = require('mongoose');
const bcrypt = require('bcryptjs');
const objectId = mongooes.Schema.Types.ObjectId;
const userSchema = new mongooes.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    // books: [{
    //     type: objectId, ref: "Book"
    // }],
},
    {
        timestamps: true
    }
)

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hashSync(this.password, 8);
    next();
})

userSchema.pre('findOneAndUpdate', async function (next) {
    if (!this._update.password) {
      return next(); // password not updated, move to next middleware
    }
    this._update.password = await bcrypt.hash(this._update.password, 8);
    next();
  });
  



userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compareSync(enteredPassword, this.password);
}



module.exports = mongooes.model('User', userSchema, 'User');