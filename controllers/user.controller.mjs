import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { appConfig } from "../middleware/app-config.mjs";
import User from "../models/user.model.mjs";

export default {
  async signup(req, res, next) {
    try {
      const { name, username, email, password, preferredLanguage } = req.body;
      const newUser = new User();
      newUser.local.name = name;
      newUser.local.username = username;
      newUser.local.email = email;
      newUser.local.preferredLanguage = preferredLanguage;
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(password, salt);
      newUser.local.password = hash;

      await newUser.save();
      res
        .status(200)
        .json({ success: true, msg: "registered successfully ...." });
    } catch (err) {
      return res.status(500).json({ err });
    }
  },

  async login(req, res, next) {
    const { email, password } = req.body;
    const checkEmail = await User.findOne({ 'local.email': email });
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
    res.status(200).json({ success: true, user: checkEmail, token });
  },

  async test(req, res) {
    return res.json(req.userData);
  },

  sendJWTToken(req, res, next) {
    const token = jwt.sign({ userId: req.userData._id }, appConfig.securityCode, {
      expiresIn: "1d",
    });
    res.status(200).json({ success: true, user: req.userData, token });
  },
  sendFacebookJWTToken(req, res, next) {
    const token = jwt.sign({ userId: req.userData._id }, appConfig.securityCode, {
      expiresIn: "1d",
    });
    res.status(200).json({ success: true, user: req.userData, token });
  }
};
