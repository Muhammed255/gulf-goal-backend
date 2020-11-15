import Axios from "axios";
import { footballPi } from "../middleware/football-api.js";
import User from "../models/user.model.js";

export default {
  async addTeamsToFavorites(req, res, next) {
    try {
      const authUser = await User.findOne({ _id: req.userData.userId });

      if (!authUser) {
        return res.status(401).json({ success: false, msg: "Unauthorized" });
      }

      let teamsArray = {
        team_key: req.body.team_key,
        team_name: req.body.team_name,
        team_badge: req.body.team_badge,
      };
      let temp = false;
      const teamIndex = authUser.fav_teams.findIndex(
        (t) => t.team_key === req.body.team_key
      );
      if (teamIndex !== -1) {
        return res.status(401).json({
          success: false,
          msg: "You already add this teams to favorites 🤦‍♂️🤷‍♀️",
        });
      }
      let teams = await User.findOneAndUpdate(
        { _id: req.userData.userId },
        { $push: { fav_teams: teamsArray } },
        { safe: true, upsert: true, new: true }
      );
      res.status(200).json({
        success: true,
        msg: "teams added to favorites",
        teams: teams,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ err });
    }
  },

  async getFavorites(req, res, next) {
    try {
      const favorites = await User.findOne({ _id: req.userData.userId }).select(
        "fav_teams"
      );
      res.status(200).json(favorites.fav_teams);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  async removeFromFavorites(req, res, next) {
    try {
      const authUser = await User.findOne({ _id: req.userData.userId });
      if (!authUser) {
        return res
          .status(409)
          .json({ success: false, msg: "Not authorized!!" });
      }
      let teams = await User.findOneAndUpdate(
        { _id: req.userData.userId },
        { $pull: { fav_teams: { $elemMatch: { _id: req.body.teamId } } } },
        { safe: true, upsert: true, new: true }
      );

      res
        .status(200)
        .json({ success: true, msg: "Deleted from favorites", teams });
    } catch (err) {
      res.status(500).json({ err });
    }
  },

  async getLiveMatches(req, res, next) {
    try {
      const appResponse = await Axios.get(footballPi.event_url);
      const fav_teams = await User.findOne({ _id: req.userData.userId }).select(
        "fav_teams"
      );

      // for (let index = 0; index < fav_teams.length; index++) {
      //   const team = fav_teams[index];

      // }
      const live_matches = appResponse.data.map((match) => {
        return match.match_live == 1;
      });

      var result = await live_matches
        .filter(function (o1) {
          // filter out (!) items in result2
          return fav_teams.fav_teams.some(function (o2) {
            return o1.match_awayteam_id === o2.team_key;
          });
        })
        .map(function (o) {
          return props.reduce(function (newo, team_name) {
            newo[team_name] = o[team_name];
            return newo;
          }, {});
        });

      // const found = live_matches.some(m => fav_teams.fav_teams.indexOf(m) >= 0);
      // console.log("found: " + found)
      res
        .status(200)
        .json({
          success: true,
          msg: "fetched",
          matches: live_matches,
          my_matches: result,
        });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  },
};
