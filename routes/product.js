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
      const topRatedProducts = await Product.find()
      .sort({ averageRating: -1 })
      .limit(10);      if(!topRatedProducts || topRatedProducts.length == 0){
        return res.status(404).json({msg:"Products not found"});
      }else{
          return res.status(200).json(topRatedProducts);
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  productRouter.get('/api/products-by-subcategory/:subCategory',async(req,res)=>{
  try {
    const {subCategory} = req.params;
    const products = await Product.find({subCategory:subCategory});
    if(!products || products.length == 0){
      return res.status(404).json({msg:"No Products found in this subcategory"});
    }else{
        return res.status(200).json(products);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
  });

  //Route for searching products by name or description
productRouter.get('/api/search-products', async (req, res) => {
  try {
    //Extract the query parameter from the request
    const {query}= req.query;
    //Validate that a query parameter is provided.
    // if missing,return a 400 status with an error message
    if(!query){
      return res.status(400).json({msg:"Query parameter required"});
    }
    //search for the product collection for documents where either 'productName' or 'description' contains the query string
    //contains the specified query String 
   const products =  await Product.find({
      $or:[
        //Regex will match any productName containing the query string
        //For example, if the query is "shoe", it will match "shoe", "shoes", "shoeing", etc.
        //if "apple" is part of any product name, so products name "apple pie" will be returned
        //or if "apple" is part of any description, so products name "apple pie" will be returned
        { productName: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]

    });
    //Check if any products were found
    if(!products || products.length == 0){
      return res.status(404).json({msg:"No Products found matching the query"});
    }
    //If products are found, return them with a 200 status code
    return res.status(200).json(products);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Route to edit an existing product

productRouter.put('/api/edit-product/:productId',auth,vendorAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if(!product){
      return res.status(404).json({msg:"Product not found"});
    }
    if(product.vendorId.toString()!== req.user.id){
      return res.status(403).json({msg:"You are not authorized to edit this product"});
    }
    //Destructure req.body to exclude vendorId
    const {vendorId,...updateData} = req.body;
    //Update the product with the new data
    const updatedProduct = await Product.findByIdAndUpdate(productId, {$set:updateData}, { new: true });
    return res.status(200).json(updatedProduct);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = productRouter;