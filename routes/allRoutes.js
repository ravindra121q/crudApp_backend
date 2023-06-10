const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/user.model");
const { auth } = require("../middlewares/auth");
const { ProductModel } = require("../models/product.mode");

const router = express.Router();

router.post("/user/login", auth, async (req, res) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (user) {
    const token = jwt.sign({ id: user._id }, `${process.env.secretKey}`, {
      expiresIn: "7d",
    });
    res.json({ msg: "Successfully Logged in", token: token });
  } else {
    res.json({ msg: "Invalid Credentials" });
  }
});

router.post("/add/user", async (req, res) => {
  const { name, email, password } = req.body;
  const user_exits = await UserModel.findOne({ email });
  if (user_exits) {
    res.json({ msg: "User already exists", status: false });
    return;
  }
  bcrypt.hash(password, 4, async (err, hash) => {
    console.log(hash);
    const user = new UserModel({ name, email, password: hash });
    await user.save();
    res.json({ msg: "New user Added", status: true });
  });
});

router.post("/add/user/product", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { name, brand, price, category } = req.body;

  jwt.verify(token, `${process.env.secretKey}`, async (err, decoded) => {
    if (decoded) {
      const user = new ProductModel({
        name,
        brand,
        price,
        category,
        user_id: decoded.id,
      });
      await user.save();
      res.json({ msg: "Product Added" });
    }
  });
});

router.delete("/user/product/:name", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { name } = req.params;
  jwt.verify(token, `${process.env.secretKey}`, async (err, decoded) => {
    if (decoded) {
      const product = await ProductModel.findOne({ name });
      console.log(product);
      if (product) {
        if (product.user_id == decoded.id) {
          await ProductModel.findByIdAndDelete(product._id);
          res.json({ msg: "Product Deleted", status: true });
        } else {
          res.json({ msg: "Product not found", status: false });
        }
      } else {
        res.json({ msg: "Product not found", status: false });
      }
    }
  });
});

router.get("/user/product", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  jwt.verify(token, `${process.env.secretKey}`, async (err, decoded) => {
    if (decoded) {
      if (decoded) {
        const product = await ProductModel.find({ user_id: decoded.id });
        res.json({ msg: product });
      }
    }
  });
});

router.patch("/user/product/update/:id", async (req, res) => {
  const token = req.header("authorization")?.split(" ")[1];
  const id = req.params.id;
  try {
    const decoded = jwt.verify(token, process.env.secretKey);
    if (decoded) {
      const { name, brand, price, category } = req.body;
      const product = await ProductModel.findOne({ _id: id });
      console.log(product.user_id);
      // console.log(product.userId.toString())
      if (product && product.user_id == decoded.id) {
        await ProductModel.findByIdAndUpdate(product._id, {
          name,
          brand,
          price,
          category,
        });
        res.json({ msg: "Product Updated", update: true });
      } else {
        res.json({ msg: "Product not found", update: false });
      }
    } else {
      res.status(401).json({ msg: "Token verification failed" });
    }
  } catch (err) {
    res.status(401).json({ msg: "Token verification failed" });
  }
});

module.exports = { router };
