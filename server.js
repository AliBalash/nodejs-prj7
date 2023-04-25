const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 3030;
const dbConnection = require('./config/dbConnection')
const userRoute = require('./routes/user')



//  middleware
app.use(express.urlencoded({extended : false}));



//  routes
app.use('/api/user' ,userRoute )




//  run server 
app.listen(PORT , ()=>{
    console.log(`Server in running on PORT ${PORT}`);
});



