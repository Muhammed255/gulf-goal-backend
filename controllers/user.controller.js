import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";
import { appConfig } from "../middleware/app-config.js";
import ResetToken from "../models/reset-token.model.js";
import User from "../models/user.model.js";
import cloudinary from "../middleware/cloudinary.js";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  async signup(req, res, next) {
    try {
      const { username, email, password, preferredLanguage } = req.body;
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(password, salt);

      const authUser = await User.findOne({ "local.email": email });
      if (authUser) {
        return res.status(401).json({
          msg: "Email already exists",
          success: false,
        });
      }

      const user = new User();
      user.local.email = email;
      user.local.username = username;
      user.local.password = hash;
      user.preferredLanguage = preferredLanguage;

      await user.save();

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.local.email,
          username: user.local.username,
        },
        appConfig.securityCode,
        {
          expiresIn: "360d",
        }
      );
      res.status(200).json({
        success: true,
        msg: "Successfully Registered",
        token,
        username: user.local.username,
        userId: user._id,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, msg: "Error Occured !!" });
    }
  },

  async google_signup(req, res, next) {
    try {
      const { displayName, email } = req.body;

      const authUser = await User.findOne({ "google.email": email });
      if (authUser) {
        const authToken = jwt.sign(
          {
            userId: authUser._id,
            email: authUser.google.email,
            username: authUser.google.displayName,
          },
          appConfig.securityCode,
          {
            expiresIn: "360d",
          }
        );
        res.status(200).json({
          success: true,
          msg: "Loggedin Successfully....",
          first_time: false,
          token: authToken,
          userId: authUser._id,
 	  username: authUser.google.displayName,
          image: authUser.image
        });
        return;
      }


      const user = await User.create({
        "google.displayName": displayName,
        "google.email": email,
      });

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.google.email,
          username: user.google.displayName,
        },
        appConfig.securityCode,
        {
          expiresIn: "360d",
        }
      );

      res.status(200).json({
          success: true,
          msg: "Registered Successfully....",
          first_time: true,
          token,
          userId: user._id,
	  username: user.google.displayName,
          image: user.image
        });
    } catch (err) {
      console.log("Error: " + err);
      return res
        .status(500)
        .json({ success: false, msg: "Error Occured: " + err });
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
        .json({ success: true, msg: "تم التسجيل بنجاح...", token });
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

      const token = jwt.sign(
        {
          userId: user._id,
          email: checkEmail.local.email,
          username: checkEmail.local.username,
        },
        appConfig.securityCode,
        {
          expiresIn: "360d",
        }
      );
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
          .json({ success: false, msg: "Email is not registered" });
      }
      const matched = await bcrypt.compare(password, checkEmail.local.password);
      if (!matched) {
        return res
          .status(402)
          .json({ success: false, msg: "Password is incorrect!!" });
      }
      const token = jwt.sign(
        {
          userId: checkEmail._id,
          email: checkEmail.local.email,
          username: checkEmail.local.username,
        },
        appConfig.securityCode,
        { expiresIn: "360d" }
      );
      res.status(200).json({
        msg: "Successfully loggedin",
        success: true,
        username: checkEmail.local.username,
        token,
        image: checkEmail.image,
        userId: checkEmail._id,
      });
    } catch (err) {
      res.status(500).json({ success: false, msg: "Error Occured" });
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
        {
          userId: checkEmail._id,
          email: checkEmail.local.email,
          username: checkEmail.local.username,
        },
        appConfig.securityCode,
        {
          expiresIn: "360d",
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
      { userId: req.userData.userId },
      appConfig.securityCode,
      {
        expiresIn: "1d",
      }
    );
    res.status(200).json({ success: true, user: req.userData, token });
  },

  google_auth_logout(req, res, next) {
    req.logout();
    res.status(200).json({ msg: "Logged out", success: true });
  },
  // sendFacebookJWTToken(req, res, next) {
  //   const token = jwt.sign(
  //     { userId: req.userData.userId },
  //     appConfig.securityCode,
  //     {
  //       expiresIn: "1d",
  //     }
  //   );
  //   res.status(200).json({ success: true, user: req.userData, token });
  // },

  async getAllUsers(req, res, next) {
    try {
      const fetchedUsers = await User.find({
        _id: { $ne: req.userData.userId },
      })
        .populate("fav_news")
        .sort({ created_at: -1 });
      res.status(200).json({ success: true, users: fetchedUsers });
    } catch (err) {
      res.status(500).json({ err });
    }
  },

  async countUsers(req, res, next) {
    try {
      const count = await User.estimatedDocumentCount();
      res.status(200).json({ success: true, count: count });
    } catch (err) {
      res.status(500).json({ err });
    }
  },

  async deleteUser(req, res, next) {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(200).json({ success: false, msg: "No User found" });
      }

      await User.findOneAndDelete({ _id: user._id });
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
        res.status(500).json({ success: false, msg: "Email is required" });
      }
      const user = await User.findOne({ "local.email": email });
      if (!user) {
        res
          .status(409)
          .json({ success: false, msg: "No user found with this email" });
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
      res.status(200).json({ msg: "Check your email" });
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
      res.status(500).json({ success: false, msg: "هناك خطأ ما!!" });
    }
  },

  async validatePassToken(req, res, next) {
    const token = req.body.resetToken;
    if (!token) {
      return res.status(500).json({ success: false, msg: "Token required" });
    }
    const tokenCheck = await ResetToken.findOne({ resetToken: token });
    if (!tokenCheck) {
      return res.status(409).json({ success: false, msg: "Invalid token!" });
    }
    res.status(200).json({ success: true, msg: "Confirmed" });
  },

  async newPassword(req, res, next) {
    try {
      const reset = await ResetToken.findOne({ _id: req.params.resetToken });
      if (!reset) {
        res.status(500).json({ success: false, msg: "Token expired!!" });
      }
      const user = await User.findOne({ _id: reset.userId });
      if (!user) {
        res
          .status(401)
          .json({ success: false, msg: "No user found with this email" });
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

  async updateProfileImage(req, res, next) {
    try {
      const authUser = await User.findOne({ _id: req.userData.userId });
      if (!authUser) {
        return res.status(400).json({ success: false, msg: "Unauthorized!" });
      }
      let imagePath = req.body.image;
      let imageInfo = imagePath.split(";base64,").pop();
      const imageBuffer = new Buffer.from(imageInfo, "base64");
      let imageData, imageId;

      fs.writeFileSync(
        path.join(__dirname, `../images/image-123.jpg`),
        imageBuffer,
        (err) => {
          console.log("File Created");
        }
      );
      if (authUser.cloudinary_id) {
        await cloudinary.uploader.destroy(authUser.cloudinary_id, {
          invalidate: true,
          resource_type: "image",
        });
      }
      // if(imagePath) {
      // if(authUser.cloudinary_id === 'noimage_ew1uri') {
      const imageResult = await cloudinary.uploader.upload(
        "images/image-123.jpg",
        {
          folder: "users",
        }
      );
      imageData = imageResult.secure_url;
      imageId = imageResult.public_id;
      //console.log(path.join(__dirname,`../images`));
      fs.unlinkSync(path.join(__dirname, `../images/image-123.jpg`), (err) => {
        console.log("File Deleted");
      });
      // } else {

      // }
      // }

      await User.findOneAndUpdate(
        { _id: req.userData.userId },
        { image: imageData, cloudinary_id: imageId },
        { new: true, upsert: true }
      );
      res
        .status(200)
        .json({
          success: true,
          msg: "Image Updated....",
          image: imageResult.secure_url,
        });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg: "Error occured: " + err });
    }
  },
};
