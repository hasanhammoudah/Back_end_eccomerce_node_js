const express = require("express");
const ProductReview = require("../models/product_review");
const ProductReviewRouter = express.Router();
const Product = require('../models/product'); // غيّر المسار حسب مكان ملف product.js


// ProductReviewRouter.post("/api/product-review", async (req, res) => {
//   try {
//     const { buyerId, email, fullName, productId, rating, review } = req.body;
//     //check if the user has already reviewed the product
//     const existingReview = await ProductReview.findOne({ buyerId, productId });
//     if (existingReview) {
//       return res.status(400).json({ error: "You have already reviewed this product" });
//     }
//     const productReview = new ProductReview({
//       buyerId,
//       email,
//       fullName,
//       productId,
//       rating,
//       review,
//     });
//     await productReview.save();
//     // find the product associated with the review and update its average rating
//     const product = await Product.findById(productId);
//     if(!product){
//       return res.status(404).json({ error: "Product not found" });
//     }
//     //Update the totalRating and averageRating of the product
//     product.totalRating += 1;
//     product.averageRating = ((product.averageRating * (product.totalRating - rating)) + rating) / product.totalRating;
//     // Save the updated product
//     await product.save();
//     res.status(201).send(productReview);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });
//

ProductReviewRouter.post("/api/product-review", async (req, res) => {
  try {
    const { buyerId, email, fullName, productId, rating, review,orderId} = req.body;

    // Check if the user has already reviewed the product
    const existingReview = await ProductReview.findOne({ buyerId, productId,orderId });
    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this product" });
    }

    // Save the new review
    const productReview = new ProductReview({
      buyerId,
      email,
      fullName,
      productId,
      rating,
      review,
    });
    await productReview.save();

    // Recalculate averageRating and totalRating
    const allReviews = await ProductReview.find({ productId });
    const totalRating = allReviews.length;
    const sumRatings = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = sumRatings / totalRating;

    // Update the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.totalRating = totalRating;
    product.averageRating = averageRating;
    await product.save();

    res.status(201).send(productReview);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


ProductReviewRouter.get("/api/reviews", async (req, res) => {
  try {
    const productReviews = await ProductReview.find();
    return res.status(200).json(productReviews);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = ProductReviewRouter;
