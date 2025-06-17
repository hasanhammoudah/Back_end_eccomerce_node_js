const express = require("express");
const User = require("../models/user");
const Vendor = require("../models/vendor");
const bcrypt = require("bcryptjs");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const sendOtpEmail = require("../helper/send_email");
const crypto = require("crypto");
const { auth } = require("../middleware/auth");

const otpStore = new Map(); // In-memory store for OTPs
authRouter.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    //check if the account has been created by a vendor before
    const existingVendorEmail = await Vendor.findOne({ email });
    if (existingVendorEmail) {
      return res.status(400).json({ msg: "Email already exists for a vendor" });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ msg: "Email already exists" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      // Generate OTP
      const otp = crypto.randomInt(100000, 999999);
      //Save OTP in memory store with expiration time
      otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // Store OTP with expiration time (10 minutes)

      let user = new User({
        fullName,
        email,
        password: hashedPassword,
        isVerified: false,
      });
      user = await user.save();

      // res.json({user})
      //send OTP via email
      emailResponse = await sendOtpEmail(email, otp);
      res.status(201).json({
        msg: "Signup successfully, please verify your email",
        emailResponse,
      });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//signin api endpoint
authRouter.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email });
    if (!findUser) {
      res.status(400).json({ msg: "User not found" });
    } else if (!findUser.isVerified) {
      return res.status(403).json({
        msg: "Email not verified, Please verify your email to sign in",
      });
    } else {
      const isMatch = await bcrypt.compare(password, findUser.password);
      if (!isMatch) {
        res.status(400).json({ msg: "Invalid Password" });
      } else {
        const token = jwt.sign({ id: findUser._id }, "passwordkey", {
          expiresIn: "1m",
        }); // set token expiration to 1 minute`2q1a         `1

        //remove sensitive information
        const { password, ...userWithoutPassword } = findUser._doc;
        //send then response
        res.json({ token, userWithoutPassword });
      }
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//check token validity
authRouter.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);
    //verify the token
    const verified = jwt.verify(token, "passwordkey");
    if (!verified) return res.json(false);
    //if verification failed(expired or invalid token), jwt.verify will throw an error
    const user = await User.findById(verified.id);
    if (!user) return res.json(false);
    //if everything is valid,return true
    return res.json(true);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
//Define a Get Route for the authentication router
authRouter.get("/", auth, async (req, res) => {
  try {
    // Retrieve the user from the database using the ID from the token
    const user = await User.findById(req.user);
    //send the user data as json response, including all the user document fields and the token
    return res.json({ ...user._doc, token: req.token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// verify email api endpoint
authRouter.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    // Check if the OTP exists for the email and is not expired
    const storedOtpData = otpStore.get(email);
    if (!storedOtpData) {
      return res.status(400).json({ msg: "OTP not found or expired" });
    }
    if (storedOtpData.otp !== parseInt(otp)) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }
    // check if OTP has expired

    if (storedOtpData.expiresAt < Date.now()) {
      otpStore.delete(email); // Remove expired OTP
      return res
        .status(400)
        .json({ msg: "OTP has expired, please request a new one" });
    }
    // Mark user as verified
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    otpStore.delete(email); // Remove OTP after successful verification
    // send welcome email
    res.status(200).json({ msg: "Email verified successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// put route for updating user
authRouter.put("/api/user/:id", async (req, res) => {
  try {
    //Extract the user id from the request parameters
    const { id } = req.params;
    //Extract the updated user data such as state,city,locality from the request body
    const { state, city, locality } = req.body;
    //Find the user by id and update the user data
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { state, city, locality },
      { new: true }
    );
    //if the user is not found, return an error message
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    // Return the updated user data
    return res.status(200).json(updatedUser);
  } catch (error) {}
});

//fetch all users(exclude(password) api endpoint)
authRouter.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//Delete user or vendor api
authRouter.delete("/api/user/delete-account/:id", auth, async (req, res) => {
  try {
    //Extract the ID from the request parameters
    const { id } = req.params;
    //check if a regular user or vendor with the provided ID exists in the Database
    const user = await User.findByIdAndDelete(id);
    const vendor = await Vendor.findById(id);

    //we can check if the user is a vendor or a regular user
    if (!user && !vendor) {
      return res.status(404).json({ message: "User or Vendor not found" });
    }
    //Delete the user or vendor based on their type
    if (user) {
      await User.findByIdAndDelete(id);
    } else if (vendor) {
      await Vendor.findByIdAndDelete(id);
    }
    // Return a success message
    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = authRouter;
