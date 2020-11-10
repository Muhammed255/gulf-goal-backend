import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { appConfig } from "../middleware/app-config.js";
import User from "../models/user.model.js";

export default {
  async signup(req, res, next) {
    try {
      const { username, email, password, preferredLanguage } = req.body;
      // const newUser = new User();
      // newUser.local.name = name;
      // newUser.local.username = username;
      // newUser.local.email = email;
      // newUser.local.preferredLanguage = preferredLanguage;
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(password, salt);

      const authUser = await User.findOne({ "local.email": email });
      if (authUser) {
        return res
          .status(401)
          .json({
            msg: "User with this email already exists !!",
            success: false,
          });
      }

      const user = await User.create({
        "local.username": username,
        "local.email": email,
        "local.password": hash,
        "local.preferredLanguage": preferredLanguage,
      });

      const token = jwt.sign({ userId: user._id }, appConfig.securityCode, {
        expiresIn: "1d",
      });
      res
        .status(200)
        .json({ success: true, msg: "registered successfully ....", token });
    } catch (err) {
      console.log("Error: " + err);
      return res.status(500).json({ err });
    }
  },

  async admin_signup(req, res, next) {
    try {
      const { username, email, password, preferredLanguage } = req.body;
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(password, salt);

      const authUser = await User.findOne({ "local.email": email });
      if (authUser) {
        return res
          .status(401)
          .json({
            msg: "Admin with this email already exists !!",
            success: false,
          });
      }

      const user = await User.create({
        "local.username": username,
        "local.email": email,
        "local.password": hash,
        "local.preferredLanguage": preferredLanguage,
        'role': 'admin'
      });

      const token = jwt.sign({ userId: user._id }, appConfig.securityCode, {
        expiresIn: "1d",
      });
      res
        .status(200)
        .json({ success: true, msg: "registered successfully ....", token });
    } catch (err) {
      console.log("Error: " + err);
      return res.status(500).json({ err });
    }
  },

  async login(req, res, next) {
    const { email, password } = req.body;
    const checkEmail = await User.findOne({ "local.email": email });
    if (!checkEmail) {
      return res.status(401).json({ msg: "Email is not registered !!" });
    }
    const matched = await bcrypt.compare(password, checkEmail.local.password);
    if (!matched) {
      return res.status(402).json({ msg: "password is incorrect !!" });
    }
    const token = jwt.sign({ userId: checkEmail._id }, appConfig.securityCode, {
      expiresIn: "1d",
    });
    res.status(200).json({ success: true, userId: checkEmail._id, token, expiresIn: 84600 });
  },

  async test(req, res) {
    return res.json(req.userData);
  },

  sendJWTToken(req, res, next) {
    const token = jwt.sign(
      { userId: req.userData._id },
      appConfig.securityCode,
      {
        expiresIn: "1d",
      }
    );
    res.status(200).json({ success: true, user: req.userData, token });
  },
  sendFacebookJWTToken(req, res, next) {
    const token = jwt.sign(
      { userId: req.userData._id },
      appConfig.securityCode,
      {
        expiresIn: "1d",
      }
    );
    res.status(200).json({ success: true, user: req.userData, token });
  },

  async getAllUsers(req, res, next) {
    try {
      const users = await User.find().populate("fav_news");
      if (users.length < 1) {
        return res.status(401).json({ success: false, msg: "No Users found" });
      }
      res.status(200).json({ success: true, users });
    } catch (err) {
      res.status(500).json({ err });
    }
  },

  async deleteUser(req, res, next) {
    try {
      const user = await User.findOne({ _id: req.params.userId });
      if (!user) {
        return res.status(200).json({ success: false, msg: "No User found" });
      }
      await User.findOneAndDelete(user._id);
      res.status(200).json({ success: true, msg: "User deleted." });
    } catch (err) {
      res.status(500).json({ success: false, err });
    }
  },
};
