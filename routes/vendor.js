const express = require("express");
const Vendor = require("../models/vendor");
const vendorRouter = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { auth } = require("../middleware/auth");

vendorRouter.post("/api/v2/vendor/signup", async (req, res) => {
  try {
    const {
      fullName,
      email,
      storeName,
      storeImage,
      storeDescription,
      password,
      state,
      city,
      locallity,
    } = req.body;
    //check if the email already exists in the regular users collection
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res
        .status(400)
        .json({ msg: "Email already exists in regular users" });
    }
    const existingEmail = await Vendor.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ msg: "Email already exists" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      let vendor = new Vendor({
        fullName,
        email,
        state: req.body.state,
        city: req.body.city,
        locallity: req.body.locallity,
        storeName,
        storeImage,
        storeDescription,
        password: hashedPassword,
      });
      await vendor.save();
      res.json({ vendor, msg: "Vendor created successfully" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

vendorRouter.post("/api/v2/vendor/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const findVendor = await Vendor.findOne({ email });
    if (!findVendor) {
      res.status(400).json({ msg: "Vendor not found" });
    } else {
      const isMatch = await bcrypt.compare(password, findVendor.password);
      if (!isMatch) {
        res.status(400).json({ msg: "Invalid Password" });
      } else {
        const token = jwt.sign({ id: findVendor._id }, "passwordkey", {
          expiresIn: "30m",
        });

        //remove sensitive information
        const { password, ...vendorWithoutPassword } = findVendor._doc;
        //send then response
        res.json({ token, vendorWithoutPassword });
      }
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
//check token validity
vendorRouter.post("/vendor-tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);
    //verify the token
    const verified = jwt.verify(token, "passwordkey");
    if (!verified) return res.json(false);
    //if verification failed(expired or invalid token), jwt.verify will throw an error
    const vendor = await Vendor.findById(verified.id);
    if (!vendor) return res.json(false);
    //if everything is valid,return true
    return res.json(true);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
//Define a Get Route for the authentication router
vendorRouter.get("/get-vendor", auth, async (req, res) => {
  try {
    // Retrieve the vendor from the database using the ID from the token
    const vendor = await Vendor.findById(req.user);
    //send the vendor data as json response, including all the vendor document fields and the token
    return res.json({ ...vendor._doc, token: req.token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//fetch all vendors(exclude(password) api endpoint)
vendorRouter.get("/api/vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find().select("-password");
    return res.status(200).json(vendors);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// put route for updating user
vendorRouter.put("/api/vendor/:id", async (req, res) => {
    try {
      //Extract the user id from the request parameters
      const { id } = req.params;
      const { storeImage, storeDescription } = req.body;
      //Find the user by id and update the user data
      const updatedUser = await Vendor.findByIdAndUpdate(
        id,
        { storeImage, storeDescription },
        { new: true }
      );
      //if the user is not found, return an error message
      if (!updatedUser) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      // Return the updated user data
      return res.status(200).json(updatedUser);
    } catch (error) {}
  });

  //fetch all users(exclude(password) api endpoint)
vendorRouter.get("/api/vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find().select("-password");
    return res.status(200).json(vendors);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
  

module.exports = vendorRouter;
