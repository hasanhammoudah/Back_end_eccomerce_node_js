const express = require('express');
const orderRouter = express.Router();
const Order = require('../models/order');
const res = require('express/lib/response');
const { auth,vendorAuth } = require('../middleware/auth');

orderRouter.post('/api/orders', auth,async (req, res) => {
    try {
        const { fullName, email, state, city, locality, productName, productPrice, quantity, category, image, buyerId, vendorId } = req.body;
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
        res.status(500).json({ error: error.message });
    }


});

// Get route for fetching all orders by buyerId

orderRouter.get('/api/orders/by-buyer/:buyerId', auth,async (req, res) => {
    try {
        // Extract buyerId from request parameters
        const { buyerId } = req.params;
        // Fetch all orders for the given buyerId
        const orders = await Order.find({ buyerId });
        // Check of orders are found,return 404 if not
        if (orders.length == 0) {
            return res.status(404).json({ message: 'No orders found for this buyerId' });
        }
        // if orders are found,return them with a 200 status code
        return res.status(200).json(orders);
    } catch (error) {
        // Handle any errors that occur during the process
        res.status(500).json({ error: error.message });
    }
});

// Delete route for deleting an order by orderId
orderRouter.delete('/api/orders/:orderId', auth,async (req, res) => {
    try {
        // Extract orderId from request parameters
        const { orderId } = req.params;
        // Find the order by orderId and delete it
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        // Check if the order was found and deleted
        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // If the order was deleted, return a success message with a 200 status code
        return res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        // Handle any errors that occur during the process
        res.status(500).json({ error: error.message });
    }
});

// Get route for fetching orders by vendorId

orderRouter.get('/api/orders/by-vendor/:vendorId', auth,vendorAuth,async (req, res) => {
    try {
        // Extract vendorId from request parameters
        const { vendorId } = req.params;
        // Fetch all orders for the given vendorId
        const orders = await Order.find({ vendorId });
        // Check if orders are found, return 404 if not
        if (orders.length == 0) {
            return res.status(404).json({ message: 'No orders found for this vendorId' });
        }
        // If orders are found, return them with a 200 status code
        return res.status(200).json(orders);
    } catch (error) {
        // Handle any errors that occur during the process
        res.status(500).json({ error: error.message });
    }
});

orderRouter.patch('/api/orders/:orderId/delivered', async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find the order by ID and update its status
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { delivered:true,processing:false },
            { new: true }
        );

        // Check if the order was found and updated
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Return the updated order with a 200 status code
        return res.status(200).json(updatedOrder);
    } catch (error) {
        // Handle any errors that occur during the process
        res.status(500).json({ error: error.message });
    }
});


orderRouter.patch('/api/orders/:orderId/processing', async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find the order by ID and update its status
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { processing:false,delivered:false },
            { new: true }
        );

        // Check if the order was found and updated
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Return the updated order with a 200 status code
        return res.status(200).json(updatedOrder);
    } catch (error) {
        // Handle any errors that occur during the process
        res.status(500).json({ error: error.message });
    }
});


orderRouter.patch('/api/orders/:orderId/cancel', async (req, res) => {
    try {
      const { orderId } = req.params;
  
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { cancelled: true, processing: false, delivered: false },
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      return res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  orderRouter.get('/api/orders',async(req,res)=>{
    try {
        const orders = await Order.find();
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
  });



module.exports = orderRouter;