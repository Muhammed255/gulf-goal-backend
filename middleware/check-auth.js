import jwt from "jsonwebtoken";
import { appConfig } from "./app-config.js";

export function checkAuth(req, res, next) {
  try {
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization;
      if (!token) {
        res.status(500).json({ success: false, msg: "please provide token" });
      }
      const decodedToken = jwt.verify(token, appConfig.securityCode);
      req.userData = decodedToken;
      next();
    }
  } catch (e) {
    res.status(401).json({ success: false, msg: "Auth failed" });
  }
}
