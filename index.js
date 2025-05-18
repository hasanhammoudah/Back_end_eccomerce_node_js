// import the express module
const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./routes/auth');
const bannerRouter = require('./routes/banner');
const categoryRouter = require('./routes/category');
const subCategoryRouter = require('./routes/sub_category');
const productRouter = require('./routes/product');
const productReviewRouter = require('./routes/product_review');
const vendorRouter = require('./routes/vendor');
const cors = require('cors');
const orderRouter = require('./routes/order');
// Define the port number the server will listen on
const PORT =process.env.PORT || 3000;

// create an instance of an express application
//because it give us the starting point

const app = express();
//middleware - to register the router
app.use(express.json());
app.use(cors());
app.use('/api',authRouter);
app.use('/api',bannerRouter);
app.use('/api',categoryRouter);
app.use('/api',subCategoryRouter);
app.use('/api',productRouter);
app.use('/api',productReviewRouter);
app.use('/api',vendorRouter);
app.use('/api',orderRouter);


//connect to the database
const DB = "mongodb+srv://hassunh98:Hasan_670013176@cluster0.khrdi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(DB).then(()=>{
    console.log("connection successful");
}).catch((err)=>console.log(err));

//start the server and listen on the specified port
app.listen(PORT,"0.0.0.0",function(){
    console.log(`server is running on port ${PORT}`);
})
