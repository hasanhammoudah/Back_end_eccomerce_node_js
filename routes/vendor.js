const express = require('express');
const Vendor = require('../models/vendor');
const vendorRouter = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



vendorRouter.post('/api/vendor/signup', async (req, res) => {
    try {
        const {fullName,email,password} = req.body;
        const existingEmail = await Vendor.findOne({email});
        if(existingEmail){
            res.status(400).json({msg: "Email already exists"});
        }else{
           const salt = await bcrypt.genSalt(10); 
           const hashedPassword = await bcrypt.hash(password, salt);
           let vendor = new Vendor({fullName,email,password:hashedPassword});
           await vendor.save();
           res.json({vendor,msg: "Vendor created successfully"});
        }
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

vendorRouter.post('/api/vendor/signin', async (req, res) => {
    try {
        const {email,password} = req.body;
        const findVendor = await Vendor.findOne({email});
        if(!findVendor){
            res.status(400).json({msg: "Vendor not found"});
        }else{
           const isMatch =  await bcrypt.compare(password, findVendor.password);
           if(!isMatch){
            res.status(400).json({msg: "Invalid Password"});
        }else{
          const token = jwt.sign({id: findVendor._id},"passwordkey");

          //remove sensitive information
          const{password,...vendorWithoutPassword} = findVendor._doc;
          //send then response
          res.json({token,vendor:vendorWithoutPassword});

        }
    }
    } catch (e) {
      res.status(500).json({error: e.message});
    }   

});

module.exports = vendorRouter;