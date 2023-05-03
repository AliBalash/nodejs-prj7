const express = require('express');
const app = express();
const PORT = process.env.PORT || 3030;
const apiRoute = require('./routes/api')



//  middleware
app.use(express.urlencoded({extended : false}));



//  routes
app.use('/api/' ,apiRoute)




//  run server 
app.listen(PORT , ()=>{
    console.log(`Server in running on PORT ${PORT}`);
});



