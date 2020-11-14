import express from "express";
import passport from "passport";
import tagController from "../controllers/tag.controller.js";

export const tagRoutes = express.Router();

tagRoutes.post(
  "/add-tag",
  passport.authenticate("jwt", { session: false }),
  tagController.addNewTag
);

tagRoutes.get("/all-tags", tagController.getAllTags);

tagRoutes
  .route("/:tagId")
  .get(
    passport.authenticate("jwt", { session: false }),
    tagController.findOneTag
  )
  .put(
    passport.authenticate("jwt", { session: false }),
    tagController.updateTag
  )
  .delete(
    passport.authenticate("jwt", { session: false }),
    tagController.deleteTag
  );
