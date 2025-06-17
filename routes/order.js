const express = require('express');
const orderRouter = express.Router();
const Order = require('../models/order');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); 
const { auth, vendorAuth } = require('../middleware/auth');

// Create new order
orderRouter.post('/api/orders', auth, async (req, res) => {
    try {
        const {
            fullName, email, state, city, locality,
            productName, productPrice, quantity, category,
            image, productId, buyerId, vendorId,
            paymentStatus, paymentIntentId, paymentMethod
        } = req.body;

        const createdAt = new Date().getMilliseconds();
        const order = new Order({
            fullName, email, state, city, locality,
            productName, productPrice, quantity, category,
            image, productId, buyerId, vendorId,
            paymentStatus, paymentIntentId, paymentMethod,
            createdAt
        });

        await order.save();
        return res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all orders by buyerId
orderRouter.get('/api/orders/by-buyer/:buyerId', auth, async (req, res) => {
    try {
        const { buyerId } = req.params;
        const orders = await Order.find({ buyerId });

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this buyerId' });
        }

        return res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all orders by vendorId
orderRouter.get('/api/orders/by-vendor/:vendorId', auth, vendorAuth, async (req, res) => {
    try {
        const { vendorId } = req.params;
        const orders = await Order.find({ vendorId });

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this vendorId' });
        }

        return res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all orders
orderRouter.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Delete order
orderRouter.delete('/api/orders/:orderId', auth, async (req, res) => {
    try {
        const { orderId } = req.params;
        const deletedOrder = await Order.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark order as delivered
orderRouter.patch('/api/orders/:orderId/delivered', async (req, res) => {
    try {
        const { orderId } = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { delivered: true, processing: false },
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

// Mark order as processing
orderRouter.patch('/api/orders/:orderId/processing', async (req, res) => {
    try {
        const { orderId } = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { processing: false, delivered: false },
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

// Cancel order
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

// Create payment intent (simple version)
orderRouter.post('/api/payment-intent', auth, async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency
        });

        res.status(200).json({
            client_secret: paymentIntent.client_secret,
            id: paymentIntent.id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Confirm a payment (based on order info)
orderRouter.post('/api/payment', async (req, res) => {
    try {
        const { orderId, paymentMethodId, currency = 'usd' } = req.body;

        if (!orderId || !paymentMethodId || !currency) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const totalAmount = order.productPrice * order.quantity;
        const amountInCents = Math.round(totalAmount * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: currency,
            payment_method: paymentMethodId,
            automatic_payment_methods: { enabled: true },
        });

        return res.status(200).json({
            status: 'success',
            paymentMethodId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Retrieve a payment intent
orderRouter.get('/api/payment_intent/:id', auth, async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);
        return res.status(200).json(paymentIntent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = orderRouter;
