const express = require("express");
const ProductReview = require("../models/product_review");
const ProductReviewRouter = express.Router();

ProductReviewRouter.post("/api/product-review", async (req, res) => {
  try {
    const { buyerId, email, fullName, productId, rating, review } = req.body;
    const productReview = new ProductReview({
      buyerId,
      email,
      fullName,
      productId,
      rating,
      review,
    });
    await productReview.save();
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
