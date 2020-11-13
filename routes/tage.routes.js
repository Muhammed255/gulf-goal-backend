import { Router } from "express";
import passport from "passport";
import tagController from "../controllers/tag.controller";

export const tagsRoutes = Router();

tagsRoutes.post(
  "/add-tag",
  passport.authenticate("jwt", { session: false }),
  tagController.addNewTag
);

tagsRoutes.get("all-tags", tagController.getAllTags);

tagsRoutes
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
