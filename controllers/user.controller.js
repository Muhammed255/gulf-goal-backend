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
          msg: "المستخدم موجود بالفعل!!",
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
        msg: "تم التسجيل بنجاح ...",
        token,
        username: user.local.username,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, msg: "هناك خطأ ما...." });
    }
  },

  async google_signup(req, res, next) {
    try {
      const { displayName, email, token, userId } = req.body;

      const user = await User.create({
        "google.displayName": displayName,
        "google.email": email,
        "google.token": token,
        "google.userId": userId,
      });
      res
        .status(200)
        .json({ success: true, msg: "تم التسجيل بنجاح...", token });
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
          .json({ success: false, msg: "الايميل ليس مسجل !!" });
      }
      const matched = await bcrypt.compare(password, checkEmail.local.password);
      if (!matched) {
        return res
          .status(402)
          .json({ success: false, msg: "الرقم السري خطا !!" });
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
        msg: "تم الدخول بنجاح ...",
        success: true,
        username: checkEmail.local.username,
        token,
      });
    } catch (err) {
      res.status(500).json({ success: false, msg: "هناك خطأ ما....." });
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

  // sendJWTToken(req, res, next) {
  //   const token = jwt.sign(
  //     { userId: req.userData.userId },
  //     appConfig.securityCode,
  //     {
  //       expiresIn: "1d",
  //     }
  //   );
  //   res.status(200).json({ success: true, user: req.userData, token });
  // },
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
      const pageSize = +req.query.pageSize;
      const currentPage = +req.query.page;
      const userQuery = User.find({
        _id: { $ne: req.userData.userId },
      }).populate("fav_news");
      let fetchedUsers;
      if (pageSize && currentPage) {
        fetchedUsers = await userQuery
          .skip(pageSize * (currentPage - 1))
          .limit(pageSize);
      }

      const count = await userQuery.countDocuments();
      if (fetchedUsers.length < 1) {
        return res.status(401).json({ success: false, msg: "No Users found" });
      }
      res
        .status(200)
        .json({ success: true, users: fetchedUsers, count: count });
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
        res.status(500).json({ success: false, msg: "الايميل مطلوب" });
      }
      const user = await User.findOne({ "local.email": email });
      if (!user) {
        res
          .status(409)
          .json({ success: false, msg: "لا يوجد مستخدم بهذا الايميل" });
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
      res.status(200).json({ msg: "افحص حسابك للكود" });
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
      return res.status(500).json({ success: false, msg: "الكود مطلوب" });
    }
    const tokenCheck = await ResetToken.findOne({ resetToken: token });
    if (!tokenCheck) {
      return res.status(409).json({ success: false, msg: "الكود غير صالح !!" });
    }
    res.status(200).json({ success: true, msg: "تم التأكيد" });
  },

  async newPassword(req, res, next) {
    try {
      const reset = await ResetToken.findOne({ _id: req.params.resetToken });
      if (!reset) {
        res.status(500).json({ success: false, msg: "انتهت مدة الكود" });
      }
      const user = await User.findOne({ _id: reset.userId });
      if (!user) {
        res
          .status(401)
          .json({ success: false, msg: "لا يوجد مستخدم بهذا الايميل" });
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
      const url = "https://gulf-goal.herokuapp.com";
      let imagePath = req.body.image;
      if (req.file) {
        imagePath = url + "/images/" + req.file.filename;
      }
      await User.findOneAndUpdate(
        { _id: req.userData.userId },
        { image: imagePath },
        { new: true, upsert: true }
      );
      res.status(200).json({ success: true, msg: "Image Updated...." });
    } catch (err) {
      res.status(500).json({ success: false, msg: "Error occured" });
    }
  },
};
