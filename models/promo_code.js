const mongoose = require('mongoose');
const promoCodeSchema = new mongoose.Schema({ 
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType:{
        type: String,
        enum:['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    expiryDate: {
        type: Date,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }

});
const PromoCode = mongoose.model('PromoCode', promoCodeSchema);
module.exports = PromoCode;