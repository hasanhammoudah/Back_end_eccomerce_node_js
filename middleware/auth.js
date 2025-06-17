const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Vendor = require('../models/vendor');

//authentication middleware
//this middleware will check if the user is authenticated or not

const auth = async (req, res, next) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).json({ msg: "No authentication token, authorization denied" });
        }
        //verify the jwt token using the secret key
        const verified = jwt.verify(token, "passwordkey");
        if (!verified) {
            return res.status(401).json({ msg: "Token verification failed" });

        }
        //find the user by id
        const user = await User.findById(verified.id).select('-password') || await Vendor.findById(verified.id).select('-password');
        if (!user) {
            return res.status(401).json({ msg: "User or Vendor does not found, authorization denied" });
        }

        //attact the authorized user to the request object
        req.user = user;

        //attact the token to the request object
     
        req.token = token;

        //call the next middleware
        next();


    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

//vendor authentication middleware
//this middleware will check if the vendor is authenticated or not
//it should be used for vendor routes only
const vendorAuth= (req,res,next)=>{
   try {
    if(!req.user.role || req.user.role !== 'vendor'){
        return res.status(401).json({msg:"Access denied,only vendors are allowed"});
    }

    //if the user a vendor,proceed to the next middleware or route handler
    next();
   } catch (error) {
    return res.status(500).json({error:error.message});
   }
};
module.exports = { auth, vendorAuth };