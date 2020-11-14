import Teams from "../models/teams.model.js";
import User from "../models/user.model.js";

export default {
  async addTeamsToFavorites(req, res, next) {
    try {
      const authUser = await User.findOne({ _id: req.userData._id });

      if (!authUser) {
        return res.status(401).json({ success: false, msg: "Unauthorized" });
      }

      let teamsArray = {
          team_name: req.body.team_name,
          team_key: req.body.team_key,
          team_badge: req.body.team_badge,
        }

      let teams = await User.findOneAndUpdate(
        {_id: req.userData._id},
        {$push: {fav_teams: teamsArray}},
        {safe: true, upsert: true, new : true},
      )
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
      const favorites = await User.find().select(
        "fav_teams"
      );
      res.status(200).json(favorite[0].fav_teams);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};
