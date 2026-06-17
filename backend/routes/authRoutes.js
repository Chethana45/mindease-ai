const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcryptjs");

console.log("Auth Routes Loaded");

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
==================================
REGISTER
==================================
*/
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Register Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

/*
==================================
LOGIN
==================================
*/
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET missing");

      return res.status(500).json({
        message: "Server configuration error",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

/*
==================================
PROFILE (GET)
==================================
*/
router.get(
  "/profile",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.user.id
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.status(200).json({
        user,
      });

    } catch (error) {
      console.error("Profile Error:", error);

      res.status(500).json({
        message: error.message,
      });
    }
  }
);

/*
==================================
UPDATE PROFILE (PUT)
==================================
*/
router.put(
  "/profile",
  authMiddleware,
  async (req, res) => {
    try {
      const { name, email } = req.body;

      // Validation
      if (!name || !email) {
        return res.status(400).json({
          message: "Name and email are required",
        });
      }

      if (typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "Please provide a valid email address",
        });
      }

      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({
          message: "Email is already in use by another account",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { name: name.trim(), email: email.toLowerCase().trim() },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      });

    } catch (error) {
      console.error("Update Profile Error:", error);

      res.status(500).json({
        message: error.message,
      });
    }
  }
);

/*
==================================
TEST ROUTE
==================================
*/
router.get("/test", (req, res) => {
  res.send("Auth Route Working");
});

module.exports = router;