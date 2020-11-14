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
        teams: {
          team_name: req.body.team_name,
          team_key: req.body.team_key,
          team_badge: req.body.team_badge,
        },
        userId: req.userData._id,
      };

      const teams = await Teams.create(teamsArray);

      // await Teams.update(
      //   {},
      //   {$push: {teams: {$each: teamsArray}}}
      // )
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
      let fav;
      const favorites = await Teams.find().select(
        "teams"
      );
      // favorites.forEach(favorite => {
      //   fav = favorite.teams
      // });
      res.status(200).json(fav);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};
