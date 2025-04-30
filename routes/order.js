const express = require('express');
const orderRouter = express.Router();
const Order = require('../models/order');
const res = require('express/lib/response');

orderRouter.post('/api/orders',async(req,res)=>{
    try {
        const {fullName,email,state,city,locality,productName,productPrice,quantity,category,image,buyerId,vendorId} = req.body;
        const createdAt = new Date().getMilliseconds();
        const order = new Order({
            fullName,
            email,
            state,
            city,
            locality,
            productName,
            productPrice,
            quantity,
            category,
            image,
            buyerId,
            vendorId,
            createdAt
        });
        await order.save();
        return res.status(201).json(order);
    } catch (error) {
        res.status(500).json({error:error.message});
    }

 
});

module.exports = orderRouter;