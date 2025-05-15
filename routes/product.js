const express = require("express");
const Product = require("../models/product");
const productRouter = express.Router();
const { auth,vendorAuth } = require("../middleware/auth");

productRouter.post("/api/add-product",auth,vendorAuth,async (req, res) => {
  try {
    const { productName, images, popular, recommend, productPrice,quantity,category ,vendorId,fullName,subCategory,description } = req.body;
    const product = new Product({ productName, images, popular, recommend, productPrice,quantity,category ,subCategory,description,vendorId,fullName,});
    await product.save();
    return res.status(201).send(product);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
productRouter.get("/api/popular-products", async (req, res) => {
  try {
    const products = await Product.find({ popular: true });
    if(!products || products.length == 0){
      return res.status(404).json({msg:"products not found"});
    }else{
        return res.status(200).json(products);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/api/recommended-products", async (req, res) => {
    try {
      const products = await Product.find({ recommend: true });
      if(!products || products.length == 0){
        return res.status(404).json({msg:"products not found"});
      }else{
          return res.status(200).json({products});
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  productRouter.get('/api/products-by-category/:category', async (req, res) => {
    try {
      const {category} = req.params;
      const products = await Product.find({category,popular:true});
      if(!products || products.length == 0){
        return res.status(404).json({msg:"Product not found"});
      }else{
          return res.status(200).json(products);
      }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
      
      
  });

  // new route for retrieving products by subcategory
  productRouter.get('/api/related-products-by-subcategory/:productId', async (req, res) => {
    try {
      const {productId} = req.params;
      const product = await Product.findById(productId);
      if(!product){
        return res.status(404).json({msg:"Product not found"});
      }else{
      const relatedProducts =  await Product.find({
          subCategory: product.subCategory,
          _id: { $ne: productId }, // Exclude the current product
        });
      if(!relatedProducts || relatedProducts.length == 0){
        return res.status(404).json({msg:"Related products not found"});
      }
      return res.status(200).json(relatedProducts);
      }
      
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
      
      
  });


  //route for retrieving the top 10 highest-rated products
  productRouter.get('/api/top-rated-products', async (req, res) => {
    try {
      // Fetch the top 10 products sorted by rating in descending order
      const topRatedProducts = await Product.find().sort({ rating: -1 }).limit(10);
      if(!topRatedProducts || topRatedProducts.length == 0){
        return res.status(404).json({msg:"Products not found"});
      }else{
          return res.status(200).json(topRatedProducts);
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

module.exports = productRouter;