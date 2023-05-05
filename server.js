const express = require('express');
const app = express();
const PORT = process.env.PORT || 3030;
const apiRoute = require('./routes/api')



//  middleware
app.use(express.urlencoded({ extended: true }));
//  handel json body data
app.use(express.json({ extended: true }));



//  routes
app.use('/api/', apiRoute)




//  run server 
app.listen(PORT, () => {
    console.log(`Server in running on PORT ${PORT}`);
});



