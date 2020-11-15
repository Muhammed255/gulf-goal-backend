
import User from "../models/user.model.js";

export default {
  async addTeamsToFavorites(req, res, next) {
    try {
      const authUser = await User.findOne({ _id: req.userData.userId });

      if (!authUser) {
        return res.status(401).json({ success: false, msg: "Unauthorized" });
      }

      let teamsArray = {
        team_name: req.body.team_name,
        team_key: req.body.team_key,
        team_badge: req.body.team_badge,
      };
      let temp = false;
      const teamIndex = authUser.fav_teams.findIndex(
        (t) => t.team_key === req.body.team_name
      );
      if (teamIndex !== -1) {
        return res
          .status(401)
          .json({ success: false, msg: "You already add this teams to favorites 🤦‍♂️🤷‍♀️" });
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
      const favorites = await User.find().select("fav_teams");
      res.status(200).json(favorites[0].fav_teams);
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
};
