const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to Mongoose!'))
    .catch((error) => { console.log('MONGO ERROR : ' + error) });

module.exports = mongoose;