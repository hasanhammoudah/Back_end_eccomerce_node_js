const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        trim:true,
        required: true,
    },
    images: [
        {
            type: String,
            required: true,
        },
    ],
    popular: {
        type: Boolean,
        default: true,
    },
    recommend: {
        type: Boolean,
        default: false,
    },
    productPrice: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    vendorId: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    subCategory: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;