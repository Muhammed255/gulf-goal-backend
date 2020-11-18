import express from "express";
import passport from "passport";
import teamsController from "../controllers/teams.controller.js";
import { checkAuth } from "../middleware/check-auth.js";

export const teamsRoutes = express.Router();

teamsRoutes.post(
  "/add-teams-to-favorites",
  checkAuth,
  teamsController.addTeamsToFavorites
);

teamsRoutes.post(
  "/remove-team-to-favorites",
  checkAuth,
  teamsController.removeFromFavorites
);

teamsRoutes.get("/all-favorites", checkAuth, teamsController.getFavorites);

teamsRoutes.get("/following-live-matches", checkAuth, teamsController.getFollowingLiveMatches);

teamsRoutes.get("/following-coming-matches/:selectedDate", checkAuth, teamsController.getFollowingNextMatches);
