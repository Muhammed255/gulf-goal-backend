import express from "express";
import passport from "passport";
import userController from "../controllers/user.controller.js";

export const userRoutes = express.Router();

userRoutes.post("/signup", userController.signup);

userRoutes.post("/login", userController.login);

userRoutes.post("/admin-signup", userController.admin_signup)

userRoutes.post(
  "/test",
  passport.authenticate("jwt", { session: false }),
  userController.test
);

userRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

userRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/failure" }),
  userController.sendJWTToken
);

userRoutes.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

userRoutes.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/failure" }),
  userController.sendFacebookJWTToken
);

userRoutes.get(
  "/all-users",
  passport.authenticate("jwt", { session: false }),
  userController.getAllUsers
);

userRoutes.delete(
  "/:userId",
  passport.authenticate("jwt", { session: false }),
  userController.deleteUser
);
