import express from "express";
import passport from "passport";
import teamsController from "../controllers/teams.controller.js";

export const teamsRoutes = express.Router();

teamsRoutes.post(
  "/add-teams-to-favorites",
  passport.authenticate("jwt", { session: false }),
  teamsController.addTeamsToFavorites
);