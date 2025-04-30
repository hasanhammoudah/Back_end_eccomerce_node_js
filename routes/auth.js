const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const authRouter = express.Router();
const jwt = require('jsonwebtoken');




authRouter.post('/api/signup', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            res.status(400).json({ msg: "Email already exists" });
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            let user = new User({ fullName, email, password: hashedPassword });
            await user.save();
            res.json({ user, msg: "User created successfully" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

//signin api endpoint
authRouter.post('/api/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ email });
        if (!findUser) {
            res.status(400).json({ msg: "User not found" });
        } else {
            const isMatch = await bcrypt.compare(password, findUser.password);
            if (!isMatch) {
                res.status(400).json({ msg: "Invalid Password" });
            } else {
                const token = jwt.sign({ id: findUser._id }, "passwordkey");

                //remove sensitive information
                const { password, ...userWithoutPassword } = findUser._doc;
                //send then response
                res.json({ token, user: userWithoutPassword });

            }
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }

});

// put route for updating user
authRouter.put('/api/user/:id', async (req, res) => {
    try {
        //Extract the user id from the request parameters
        const { id } = req.params;
        //Extract the updated user data such as state,city,locality from the request body
        const { state, city, locality } = req.body;
        //Find the user by id and update the user data
        const updatedUser = await User.findByIdAndUpdate(id, { state, city, locality }, { new: true });
        //if the user is not found, return an error message
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Return the updated user data
        return res.status(200).json(updatedUser);
    } catch (error) {

    }
});


module.exports = authRouter;