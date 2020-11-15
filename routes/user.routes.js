import express from "express";
import passport from "passport";
import userController from "../controllers/user.controller.js";
import { checkAuth } from "../middleware/check-auth.js";

export const userRoutes = express.Router();

userRoutes.post("/signup", userController.signup);

userRoutes.post("/facebook-signup", userController.facebook_signup);

userRoutes.post("/google-signup", userController.google_signup);

userRoutes.post("/login", userController.login);

userRoutes.post("/admin-login", userController.admin_login);

userRoutes.post("/admin-signup", userController.admin_signup);

userRoutes.post("/reset-password", userController.resetPassword);

userRoutes.post("/check-token", userController.validatePassToken);

userRoutes.post("/new-password/:resetToken", userController.newPassword)

// userRoutes.post(
//   "/test",
//   checkAuth,
//   userController.test
// );

// userRoutes.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// userRoutes.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/failure" }),
//   userController.sendJWTToken
// );

// userRoutes.get(
//   "/facebook",
//   passport.authenticate("facebook", { scope: ["email"] })
// );

// userRoutes.get(
//   "/facebook/callback",
//   passport.authenticate("facebook", { failureRedirect: "/failure" }),
//   userController.sendFacebookJWTToken
// );

userRoutes.get(
  "/all-users",
  checkAuth,
  userController.getAllUsers
);

userRoutes.get(
  "/:userId",
  checkAuth,
  userController.findOneUser
);

userRoutes.delete(
  "/:userId",
  checkAuth,
  userController.deleteUser
);
