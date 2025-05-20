const express = require('express');
const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
const { jwtkey } = require('../keys');
const User = require('../models/User'); // Correct the path to your User model file
const Userdetail=require("../models/userdetails");
const router = express.Router();
const tokenget=require('../middleware/tokenget')
const cookieParser=require("cookie-parser");
router.use(cookieParser())
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the email already exists in the database
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // If email already exists, return an error response
            return res.status(422).send('Email is already registered');
        }

        // If email doesn't exist, create a new user
        const user = new User({ email, password });
        await user.save();

        // Generate JWT token for the new user
        const token = jwt.sign({ userId: user._id }, jwtkey);
        
        // Set the token as a cookie in the response
        res.cookie('token', token, { httpOnly: true });

        // Send the token back to the client
        res.send({ token });
    } catch (err) {
        // Handle any other errors that may occur during user creation
        res.status(422).send(err.message);
    }
});
router.post('/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If email exists, return exists: true
      return res.json({ exists: true });
    }

    // If email doesn't exist, return exists: false
    res.json({ exists: false });
  } catch (error) {
    // Handle any errors that may occur
    console.error('Error checking email:', error);
    res.status(500).send('Server Error');
  }
});
router.post('/add-details', tokenget, async (req, res) => {
    const { email,mobilenumber, name, age } = req.body;
    const userId = req.user._id; // Authenticated admin ID from tokenget middleware
    console.log(req.body)
    try {
        const userdetail = new Userdetail({ name,email,mobilenumber, age, belongsto: userId });
        await userdetail.save();
        res.send(userdetail);
    } catch (err) {
        res.send(err)
    }
});


// Update an existing user detail
router.put('/modify-details/:id', async (req, res) => {
    try {
        const detailId = req.params.id; // Detail ID to modify
        const { email, mobilenumber, name, age } = req.body;

        // Find the user detail by ID
        const userdetail = await Userdetail.findByIdAndUpdate(detailId, { mobilenumber, age, name, email }, { new: true });
        if (!userdetail) {
            return res.status(404).send('Details not found');
        }
        res.send(userdetail);
    } catch (err) {
        res.status(500).send('Error modifying details');
    }
});


// Get all user details
router.get('/show-details', tokenget, async (req, res) => {
    try {
        const userId = req.user._id; // Extract the ID of the logged-in user
        const userdetails = await Userdetail.find({ belongsto: userId });
        res.send(userdetails);
    } catch (err) {
        res.status(500).send('Error fetching details');
    }
});


// Get a specific user detail by ID
router.get('/show-detail/:id', async (req, res) => {
    const detailId = req.params.id; // Detail ID to show

    try {
        const userdetail = await Userdetail.findById(detailId);
        if (!userdetail) {
            return res.status(404).send('Details not found');
        }
        res.send(userdetail);
    } catch (err) {
        res.status(500).send('Error fetching details');
    }
});

// Delete a user detail
router.delete('/delete-details/:id', tokenget, async (req, res) => {
    try {
        const userId = req.user._id; // Extract the ID of the logged-in user
        const detailId = req.params.id; // Detail ID to delete

        // Find the user detail by ID and the logged-in user's ID
        const userdetail = await Userdetail.findOne({ _id: detailId, belongsto: userId });
        if (!userdetail) {
            return res.status(404).send('Details not found');
        }

        // Delete the user detail
        await userdetail.deleteOne();
        res.send(userdetail);
    } catch (err) {
        res.status(500).send('Error deleting details');
    }
});





router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).send('Must provide email and password');
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).send('Invalid email or password');
    }

    try {
        await user.comparePassword(password);
        const token = jwt.sign({ userId: user._id }, jwtkey);
        res.cookie('token', token, { httpOnly: true });
        res.send({ token });
    } catch (err) {
        res.status(404).send('Invalid email or password');
    }
});

module.exports = router;
