import express from "express";
import multer from "multer";
import passport from "passport";
import userController from "../controllers/user.controller.js";
import { checkAuth } from "../middleware/check-auth.js";

export const userRoutes = express.Router();

const MIME_TYPE_MAP = {
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid Mime Type");
    if (isValid) {
      error = null;
    }
    cb(error, "/images/users");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLocaleLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};



userRoutes.post("/signup", userController.signup);

userRoutes.post("/facebook-signup", userController.facebook_signup);

userRoutes.post("/google-signup", userController.google_signup);

userRoutes.post("/login", userController.login);

userRoutes.post("/admin-login", userController.admin_login);

userRoutes.post("/admin-signup", userController.admin_signup);

userRoutes.post("/reset-password", userController.resetPassword);

userRoutes.post("/check-token", userController.validatePassToken);

userRoutes.post("/new-password/:resetToken", userController.newPassword);

userRoutes.post(
  "/update-image",
  checkAuth,
  multer({ storage: multer.diskStorage({}), fileFilter: fileFilter }).single("image"),
  userController.updateProfileImage
);

userRoutes.post("/test", checkAuth, userController.test);

userRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

userRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/failure" }),
  userController.sendJWTToken
);

app.get("/google-logout", userController.google_auth_logout);

// userRoutes.get(
//   "/facebook",
//   passport.authenticate("facebook", { scope: ["email"] })
// );

// userRoutes.get(
//   "/facebook/callback",
//   passport.authenticate("facebook", { failureRedirect: "/failure" }),
//   userController.sendFacebookJWTToken
// );

userRoutes.get("/all-users", checkAuth, userController.getAllUsers);

userRoutes.get("/count-users", checkAuth, userController.countUsers);

userRoutes.get("/:userId", checkAuth, userController.findOneUser);

userRoutes.delete("/:userId", checkAuth, userController.deleteUser);
