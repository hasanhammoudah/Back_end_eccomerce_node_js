// ✅ This is the cleaned and organized version of your product routes file

const express = require("express");
const Product = require("../models/product");
const Vendor = require("../models/vendor");
const { auth, vendorAuth } = require("../middleware/auth");

const productRouter = express.Router();

// Utility to enrich product data
const enrichProducts = (products) =>
  products.map((p) => {
    let discountPercent = 0;
    if (p.hasDiscount && p.discountedPrice > 0) {
      discountPercent = Math.round(
        ((p.productPrice - p.discountedPrice) / p.productPrice) * 100
      );
    }

    const labels = [];

    if (p.isNewProduct) labels.push("New");
    if (p.hasDiscount) labels.push("Discount");
    if (p.hasNextAvailableLabel) labels.push("Coming Soon");

    return {
      ...p.toObject(),
      discountPercent,
      labels,
      reviews: p.reviews ?? [],
    };
  });


// Create product
productRouter.post("/api/add-product", auth, vendorAuth, async (req, res) => {
  try {
    const {
      productName,
      images,
      popular,
      recommend,
      productPrice,
      quantity,
      category,
      vendorId,
      fullName,
      subCategory,
      description,
      hasDiscount,
      discountedPrice,
      isNewProduct,
      newLabelExpiresAt,
      returnPolicy,
      tags,
      extraAttributes,
      brand,
      warrantyPeriod,
      hasNextAvailableLabel,
      shippingInfo,
      originCountry,
      nextAvailableAt,
      isPublished,
    } = req.body;

    if (hasDiscount && discountedPrice >= productPrice) {
      return res
        .status(400)
        .json({ msg: "Discounted price must be less than original price" });
    }

    if (isNewProduct && newLabelExpiresAt) {
      const now = new Date();
      const maxDuration = 7 * 24 * 60 * 60 * 1000;
      const chosenDate = new Date(newLabelExpiresAt);

      if (chosenDate - now > maxDuration) {
        return res.status(400).json({
          msg: "Maximum allowed duration for 'New' label is 7 days",
        });
      }
      if (chosenDate <= now) {
        return res
          .status(400)
          .json({ msg: "Expiration date must be in the future" });
      }
    }

    const product = new Product({
      productName,
      images,
      popular,
      recommend,
      productPrice,
      quantity,
      category,
      vendorId,
      fullName,
      subCategory,
      description,
      hasDiscount,
      discountedPrice,
      isNewProduct,
      newLabelExpiresAt,
      returnPolicy,
      tags,
      extraAttributes,
      brand,
      warrantyPeriod,
      hasNextAvailableLabel,
      shippingInfo,
      originCountry,
      nextAvailableAt,
      isPublished,
    });

    await product.save();
    return res.status(201).send(product);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// General GET handler with enrich
const handleGetWithEnrich = async (res, filter) => {
  const products = await Product.find(filter).populate('reviews');
  if (!products || products.length === 0) {
    return res.status(404).json({ msg: "Products not found" });
  }
  return res.status(200).json(enrichProducts(products));
};

// Common product fetching routes
productRouter.get("/api/popular-products", async (req, res) => {
  try {
    await handleGetWithEnrich(res, { popular: true,isPublished: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/api/recommended-products", async (req, res) => {
  try {
    await handleGetWithEnrich(res, { recommend: true,isPublished: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/api/products-by-category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    await handleGetWithEnrich(res, { category, popular: true,isPublished: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/api/products-by-subcategory/:subCategory", async (req, res) => {
  try {
    const { subCategory } = req.params;
    await handleGetWithEnrich(res, { subCategory,isPublished: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/api/products-by-tag/:tag", async (req, res) => {
  try {
    const { tag } = req.params;
    await handleGetWithEnrich(res, { tags: tag,isPublished: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/api/products/vendor/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendorExists = await Vendor.findById(vendorId);
    if (!vendorExists) {
      return res.status(404).json({ msg: "Vendor not found" });
    }
    await handleGetWithEnrich(res, { vendorId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/api/related-products-by-subcategory/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    const related = await Product.find({
      subCategory: product.subCategory,
      _id: { $ne: productId },
    }).populate('reviews'); ;
    if (!related || related.length === 0) {
      return res.status(404).json({ msg: "Related products not found" });
    }
    return res.status(200).json(enrichProducts(related));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/api/search-products", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ msg: "Query parameter required" });
    }
    const products = await Product.find({
      isPublished: true,
      $or: [
        { productName: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    });
    if (!products || products.length === 0) {
      return res.status(404).json({ msg: "No Products found matching the query" });
    }
    return res.status(200).json(enrichProducts(products));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/api/top-rated-products", async (req, res) => {
  try {
    const topRated = await Product.find({isPublished: true}).sort({ averageRating: -1 }).limit(10).populate('reviews');;
    if (!topRated || topRated.length === 0) {
      return res.status(404).json({ msg: "Products not found" });
    }
    return res.status(200).json(enrichProducts(topRated));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.put("/api/edit-product/:productId", auth, vendorAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    if (product.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "You are not authorized to edit this product" });
    }
    const { vendorId, ...updateData } = req.body;
    const updated = await Product.findByIdAndUpdate(productId, { $set: updateData }, { new: true });
    return res.status(200).json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.delete("/api/delete-product/:productId", auth, vendorAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    if (product.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "You are not authorized to delete this product" });
    }
    await Product.findByIdAndDelete(productId);
    return res.status(200).json({ msg: "Product deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


module.exports = productRouter;
