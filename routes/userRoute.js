const express = require('express');
const router = express.Router();
const User = require('../models/user-models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer'); // Import multer

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store the uploaded file in memory
const upload = multer({ storage });

router.post('/register', async (req, res) => {
    try {
        const userExists = await User.findOne({ email: req.body.email });
        if (userExists) {
            return res.status(200).send({ message: "User already exists", success: false });
        }

        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            isAdmin: false,
        });

        await newUser.save();

        res.status(200).send({ message: "User created successfully", success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error while creating user", success: false, error });
    }
});


router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        console.log(user)
        if (!user) {
            return res.status(200).send({ message: "User does not exist", success: false });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(200).send({ message: "Password is incorrect", success: false });
        } else {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: "1d",
            });
            res.status(200).send({ message: "Login successful", success: true, data: token });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error logging in", success: false, error });
    }
});

router.post('/get-user-info-by-id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.userId })
        user.password = undefined
        if (!user) {
            return res.status(200).send({ message: "User does not exist", sucess: false });
        } else {
            res.status(200).send({
                success: true,
                data: user
            });
        }
    } catch (error) {
        res.status(500).send({ message: "error getting user info", sucess: false, error })
    }
})


router.post('/imageUpload', authMiddleware, upload.single('profileImage'), async (req, res) => {
    try {
      // Check if the file was uploaded
      if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded', success: false });
      }
  
      const user = await User.findOne({ _id: req.user.id });
  
      if (user) {
        // Access the uploaded file data in req.file.buffer
        // You can now save, process, or store the file as needed
        // Example: Save the file to the user's profile picture
        user.profilePicture = req.file.buffer;
        await user.save();
  
        return res.status(200).send({ message: 'Image uploaded successfully', success: true });
      } else {
        return res.status(200).send({ message: 'User does not exist', success: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error uploading image', success: false, error });
    }
  });
module.exports = router;