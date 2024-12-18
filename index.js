// import the express module
const express = require('express');

const helloRoute = require('./routes/hello');

// Define the port number the server will listen on
const PORT = 3000;

// create an instance of an express application
//because it give us the starting point

const app = express();

// middleware
app.use(helloRoute);

//start the server and listen on the specified port
app.listen(PORT,"0.0.0.0",function(){
    console.log(`server is running on port ${PORT}`);
})