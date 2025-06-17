const mongoose = require('mongoose');
const ProductReview = require('./product_review');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    trim: true,
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
  averageRating: {
    type: Number,
    default: 0,
  },
  totalRating: {
    type: Number,
    default: 0,
  },
  
  hasDiscount: {
    type: Boolean,
    default: false,
  },
  discountedPrice: {
    type: Number,
    default: 0,
  },
  productPrice: {
    type: Number,
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

  isNewProduct: {
    type: Boolean,
    default: false,
  },
  newLabelExpiresAt: {
    type: Date,
  },
  returnPolicy: {
    type: String,
    default: 'No return policy specified',
  },
  tags: {
    type: [String],
    default: [],
  },
  extraAttributes: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  nextAvailableAt: {
    type: Date,
  },
  brand: {
    type: String,
    default: 'No brand specified',
  },
  warrantyPeriod: {
    type: String,
    default: 'No warranty',
  },
  shippingInfo: {
    type: String,
    default: 'Standard shipping',
  },
  originCountry: {
    type: String,
    default: 'Unknown',
  },
  hasNextAvailableLabel: {
    type: Boolean,
    default: false,
  },
  isPublished: {
    type: Boolean,
    default: true, 
  },
  
  

});

productSchema.virtual('nextAvailableLabel').get(function () {
  if (!this.nextAvailableAt) return null;

  return this.nextAvailableAt.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});
// ✅ virtual للـ reviews المرتبطة من Collection ثاني
productSchema.virtual('reviews', {
  ref: 'ProductReview',           // اسم الـ Model الثاني
  localField: '_id',              // من هذا المودل
  foreignField: 'productId',      // يطابق هذا الحقل في review
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
