// import the express module
const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./routes/auth');
const bannerRouter = require('./routes/banner');
const categoryRouter = require('./routes/category');
const subCategoryRouter = require('./routes/sub_category');
const productRouter = require('./routes/product');
const productReviewRouter = require('./routes/product_review');
// Define the port number the server will listen on
const PORT = 3000;

// create an instance of an express application
//because it give us the starting point

const app = express();
//middleware - to register the router
app.use(express.json());
app.use(authRouter);
app.use(bannerRouter);
app.use(categoryRouter);
app.use(subCategoryRouter);
app.use(productRouter);
app.use(productReviewRouter);

//connect to the database
const DB = "mongodb+srv://hassunh98:Hasan_670013176@cluster0.khrdi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(DB).then(()=>{
    console.log("connection successful");
}).catch((err)=>console.log(err));

//start the server and listen on the specified port
app.listen(PORT,"0.0.0.0",function(){
    console.log(`server is running on port ${PORT}`);
})
