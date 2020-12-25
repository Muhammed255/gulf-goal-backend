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
  "/add-match-comment",
  checkAuth,
  teamsController.matchesComment
);

teamsRoutes.post(
  "/do-match-reply",
  checkAuth,
  teamsController.matchesCommentReply
);

teamsRoutes.post(
  "/remove-team-to-favorites",
  checkAuth,
  teamsController.removeFromFavorites
);

teamsRoutes.post("/match-comment", checkAuth, teamsController.matchesComment);

teamsRoutes.post("/like-match-comment", checkAuth, teamsController.likeMatchComment);

teamsRoutes.post("/match-comment-reply", checkAuth, teamsController.matchesCommentReply);

teamsRoutes.get("/all-favorites", checkAuth, teamsController.getFavorites);

teamsRoutes.get("/get-matches-comments", teamsController.getMatchComments);

teamsRoutes.get(
  "/following-live-matches",
  checkAuth,
  teamsController.getFollowingLiveMatches
);

teamsRoutes.get(
  "/following-coming-matches/:selectedDate",
  checkAuth,
  teamsController.getFollowingNextMatches
);
