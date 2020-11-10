import User from "../models/user.model.js";

export default {
  async addTeamsToFavorites(req, res, next) {
    try {
      const authUser = await User.findOne({ _id: req.userData._id });

      if (!authUser) {
        return res.status(401).json({ success: false, msg: "Unauthorized" });
      }

      // await User.findOneAndUpdate({_id: req.userData._id}, {$push: {teamsId: req.body.teamId}})
      authUser.fav_teams.push(req.body.teamId);

      console.log(req.body.teamId)

      await authUser.save();
      res
        .status(200)
        .json({
          success: true,
          msg: "teams added to favorites",
          user: authUser,
        });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ err });
    }
  },
};
