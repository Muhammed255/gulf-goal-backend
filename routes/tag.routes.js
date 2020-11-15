import express from "express";
import passport from "passport";
import tagController from "../controllers/tag.controller.js";
import { checkAuth } from "../middleware/check-auth.js";

export const tagRoutes = express.Router();

tagRoutes.post("/add-tag", checkAuth, tagController.addNewTag);

tagRoutes.get("/all-tags", tagController.getAllTags);

tagRoutes
  .route("/:tagId")
  .get(checkAuth, tagController.findOneTag)
  .put(checkAuth, tagController.updateTag)
  .delete(checkAuth, tagController.deleteTag);
