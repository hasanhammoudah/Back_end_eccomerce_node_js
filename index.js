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
const promoCodeRouter = require('./routes/promo_code');
require("dotenv").config();
// Define the port number the server will listen on
const PORT =process.env.PORT || 3000;

// create an instance of an express application
//because it give us the starting point

const app = express();
// Define the database connection string

//middleware - to register the router
app.use(express.json());
app.use(cors());
app.use(authRouter);
app.use(bannerRouter);
app.use(categoryRouter);
app.use(subCategoryRouter);
app.use(productRouter);
app.use(productReviewRouter);
app.use(vendorRouter);
app.use(orderRouter);
app.use(promoCodeRouter);


//connect to the database
mongoose.connect(process.env.DATABASE).then(()=>{
    console.log("connection successful");
}).catch((err)=>console.log(err));

//start the server and listen on the specified port
app.listen(PORT,"0.0.0.0",function(){
    console.log(`server is running on port ${PORT}`);
})
