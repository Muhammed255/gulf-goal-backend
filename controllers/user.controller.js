import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";
import { appConfig } from "../middleware/app-config.js";
import ResetToken from "../models/reset-token.model.js";
import User from "../models/user.model.js";

export default {
  async signup(req, res, next) {
    try {
      const { username, email, password, preferredLanguage } = req.body;
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(password, salt);

      const authUser = await User.findOne({ "local.email": email });
      if (authUser) {
        return res.status(401).json({
          msg: "User with this email already exists !!",
          success: false,
        });
      }

      const user = await User.create({
        "local.username": username,
        "local.email": email,
        "local.password": hash,
        preferredLanguage: preferredLanguage,
      });

      const token = jwt.sign(
        { userId: user._id, email: user.local.email },
        appConfig.securityCode,
        {
          expiresIn: "",
        }
      );
      res
        .status(200)
        .json({ success: true, msg: "registered successfully ....", token });
    } catch (err) {
      console.log("Error: " + err);
      return res.status(500).json({ success: false, msg: err });
    }
  },

  async google_signup(req, res, next) {
    try {
      const { displayName, email, token, userId } = req.body;

      const user = await User.create({
        "google.displayName": username,
        "google.email": email,
        "google.token": token,
        "google.userId": userId,
      });
      res
        .status(200)
        .json({ success: true, msg: "registered successfully ....", token });
    } catch (err) {
      console.log("Error: " + err);
      return res.status(500).json({ err });
    }
  },

  async facebook_signup(req, res, next) {
    try {
      const { displayName, email, token, userId } = req.body;

      const user = await User.create({
        "facebook.displayName": displayName,
        "facebook.email": email,
        "facebook.token": token,
        "facebook.userId": userId,
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
        return res.status(401).json({
          msg: "Admin with this email already exists !!",
          success: false,
        });
      }

      const user = await User.create({
        "local.username": username,
        "local.email": email,
        "local.password": hash,
        preferredLanguage: preferredLanguage,
        role: "admin",
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
    try {
      const { email, password } = req.body;
      const checkEmail = await User.findOne({ "local.email": email });
      if (!checkEmail) {
        return res
          .status(401)
          .json({ success: false, msg: "Email is not registered !!" });
      }
      const matched = await bcrypt.compare(password, checkEmail.local.password);
      if (!matched) {
        return res
          .status(402)
          .json({ success: false, msg: "password is incorrect !!" });
      }
      const token = jwt.sign(
        { userId: checkEmail._id },
        appConfig.securityCode,
        {expiresIn: "360d"}
      );
      res.status(200).json({
        msg: "LoggedIn successfully !",
        success: true,
        userId: checkEmail._id,
        token,
        expiresIn: 84600,
      });
    } catch (err) {
      res.status(500).json({ success: false, msg: "Error: " + err });
    }
  },

  async admin_login(req, res, next) {
    try {
      const { email, password } = req.body;
      const checkEmail = await User.findOne({ "local.email": email });
      if (!checkEmail) {
        return res.status(401).json({ msg: "Email is not registered !!" });
      }

      if (checkEmail.role !== "admin") {
        return res
          .status(401)
          .json({ msg: "Email is not registered and Not Allowed !!" });
      }
      const matched = await bcrypt.compare(password, checkEmail.local.password);
      if (!matched) {
        return res.status(402).json({ msg: "password is incorrect !!" });
      }
      const token = jwt.sign(
        { userId: checkEmail._id },
        appConfig.securityCode,
        {
          expiresIn: "1d",
        }
      );
      res.status(200).json({
        success: true,
        userId: checkEmail._id,
        token,
        expiresIn: 84600,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
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

  async findOneUser(req, res, next) {
    try {
      const user = await User.findOne({ _id: req.params.userId });
      if (!user) {
        return res.status(200).json({ success: false, msg: "No User found" });
      }

      res.status(200).json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, err });
    }
  },

  async resetPassword(req, res, next) {
    try {
      const email = req.body.email;
      if (!email) {
        res.status(500).json({ success: false, msg: "Email is required!" });
      }
      const user = await User.findOne({ "local.email": email });
      if (!user) {
        res
          .status(409)
          .json({ success: false, msg: "No user with this email found" });
      }
      const resetPass = new ResetToken({
        userId: user._id,
        resetToken: crypto.randomBytes(16).toString("hex"),
      });
      await resetPass.save();
      await ResetToken.find({
        userId: user._id,
        resetToken: { $ne: resetPass.resetToken },
      })
        .remove()
        .exec();
      res.status(200).json({ msg: "Check your email inbox" });
      sgMail.setApiKey(appConfig.sendGrid_API_Key);
      var mailOptions = {
        from: "admin@gulf-goal.com",
        to: email,
        subject: "Password reset Token",
        html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p><br />
              and this is token:<strong> ${resetPass.resetToken} </strong><br>
              If you did not request this, please ignore this email and your password will remain unchanged<br>
              Thanks<br>
              Regards<br>
              Admin
              `,
      };
      sgMail.send(mailOptions);
    } catch (err) {
      res.status(500).json({ err });
    }
  },

  async validatePassToken(req, res, next) {
    const token = req.body.resetToken;
    if (!token) {
      return res.status(500).json({ success: false, msg: "Token is required" });
    }
    const tokenCheck = await ResetToken.findOne({ resetToken: token });
    if (!tokenCheck) {
      return res.status(409).json({ success: false, msg: "Invalid Token" });
    }
    res.status(200).json({ success: true, msg: "Verified" });
  },

  async newPassword(req, res, next) {
    try {
      const reset = await ResetToken.findOne({ _id: req.params.resetToken });
      if (!reset) {
        res.status(500).json({ success: false, msg: "Token has expired" });
      }
      const user = await User.findOne({ _id: reset.userId });
      if (!user) {
        res.status(401).json({ success: false, msg: "No user found" });
      }

      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(req.body.newPassword, salt);

      user.local.password = hash;
      await user.save();

      res
        .status(200)
        .json({ success: true, msg: "Password reset succssfully" });
    } catch (err) {
      res.status(500).json({ err });
    }
  },
};
