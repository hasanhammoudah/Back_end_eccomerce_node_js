const express = require('express');
const promoCode = require('../models/promo_code');
const PromoCode = require('../models/promo_code');
const promoCodeRouter = express.Router();
//
promoCodeRouter.post('/api/promoCode', async (req, res) => {
    try {
        
        const { code, discountType, discountValue, expiryDate } = req.body;
        const existingCode = await PromoCode.findOne({ code: code.toUpperCase()});
        if( existingCode) {
            return res.status(400).json({ msg: "Promo code already exists" });
        }
        const promoCode = new PromoCode({
            code:code.toUpperCase(), 
            discountType, 
            discountValue,
            expiryDate });
        await promoCode.save();
        return res.status(201).send(promoCode);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

promoCodeRouter.get('/api/promoCode/:code', async (req, res) => {
    try {
        const {code} = req.params;
        const promo = await PromoCode.findOne({ code: code.toUpperCase(),isActive: true });
        if(!promo){
            return res.status(404).json({ msg: "Promo code not found or inactive" });
        }
        if(promo.expiryDate < new Date()){
            return res.status(400).json({ msg: "Promo code has expired" });
        }
        return res.status(200).json(promo);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
promoCodeRouter.get('/api/promoCodes', async (req, res) => {
    try {
        const promoCodes = await PromoCode.find({ isActive: true });
        if(!promoCodes || promoCodes.length == 0){
            return res.status(404).json({ msg: "No active promo codes found" });
        }
        return res.status(200).json(promoCodes);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

promoCodeRouter.put('/api/promoCode/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { code, discountType, discountValue, expiryDate, isActive } = req.body;
        const promoCode = await PromoCode.findByIdAndUpdate(id, {
            code: code.toUpperCase(),
            discountType,
            discountValue,
            expiryDate,
            isActive
        }, { new: true });
        if (!promoCode) {
            return res.status(404).json({ msg: "Promo code not found" });
        }
        return res.status(200).json(promoCode);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

promoCodeRouter.delete('/api/promoCode/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await PromoCode.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ msg: "Promo code not found" });
        }
        return res.status(200).json({ msg: "Promo code deleted successfully" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = promoCodeRouter;