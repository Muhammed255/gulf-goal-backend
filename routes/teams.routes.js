import express from "express";
import passport from "passport";
import teamsController from "../controllers/teams.controller";

export const teamsRoutes = express.Router();

teamsRoutes.get("/all-teams", teamsController.getTeams);
