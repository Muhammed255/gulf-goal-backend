import express from "express";
import passport from "passport";
import userController from "../controllers/user.controller.mjs";

export const userRoutes = express.Router();

userRoutes.post("/signup", userController.signup);

userRoutes.post("/login", userController.login);

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

userRoutes.get("/facebook", passport.authenticate("facebook", {scope: ["email"]}));

userRoutes.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/failure" }),
  userController.sendFacebookJWTToken
);
