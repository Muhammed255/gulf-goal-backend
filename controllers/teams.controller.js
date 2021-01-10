import Axios from "axios";
import { appConfig } from "../middleware/app-config.js";
import { footballPi } from "../middleware/football-api.js";
import User from "../models/user.model.js";
import Match from "../models/match.model.js";

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
      const teamIndex = authUser.fav_teams.findIndex(
        (t) => t.team_key === req.body.team_key
      );
      if (teamIndex !== -1) {
        res.status(401).json({
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
      let teams = await User.update(
        { _id: req.userData.userId },
        { $pull: { fav_teams: { team_key: req.body.teamId } } },
        { safe: true, upsert: true, multi: true }
      );

      res
        .status(200)
        .json({ success: true, msg: "Deleted from favorites", teams });
    } catch (err) {
      res.status(500).json({ success: false, msg: "error" });
    }
  },

  async getFollowingLiveMatches(req, res, next) {
    try {
      const appResponse = await Axios.get(footballPi.event_url);
      const fav_teams = await User.findOne({ _id: req.userData.userId }).select(
        "fav_teams"
      );

      var result = await appResponse.data.filter(function (o1) {
        return fav_teams.fav_teams.some(function (o2) {
          return (
            (o1.match_awayteam_id === o2.team_key ||
              o1.match_hometeam_id === o2.team_key) &&
            o1.match_live === "1"
          );
        });
      });

      if (result.length < 1) {
        res
          .status(200)
          .json({ success: false, msg: "No Matches Now" });
      }

      res.status(200).json({
        success: true,
        msg: "fetched",
        result,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  },

  async getFollowingNextMatches(req, res, next) {
    try {
      const selectedDate = req.params.selectedDate;
      const appResponse = await Axios.get(
        `https://apiv2.apifootball.com/?action=get_events&from=${selectedDate}&to=${selectedDate}&APIkey=${appConfig.football_API_KEY}`
      );
      const fav_teams = await User.findOne({ _id: req.userData.userId }).select(
        "fav_teams"
      );

      var result = await appResponse.data.filter(function (o1) {
        return fav_teams.fav_teams.some(function (o2) {
          return (
            o1.match_awayteam_id === o2.team_key ||
            o1.match_hometeam_id === o2.team_key
          );
        });
      });

      if (result.length < 1) {
        res
          .status(200)
          .json({ success: false, msg: "لا توجد مبارايات اليوم !!!" });
      }

      res.status(200).json({
        success: true,
        msg: "fetched",
        result,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  },

  async matchesComment(req, res, next) {
    try {
      if (!req.body.match_id) {
        return res.status(401).json({ success: false, msg: "No Id provided" });
      }

      if (!req.body.comment) {
        return res
          .status(401)
          .json({ success: false, msg: "No comment provided" });
      }

      const newMatch = new Match();

      const authUser = await User.findOne({ _id: req.userData.userId });
      if (!authUser) {
        res.status(401).json({ success: false, msg: "Unautherized..." });
      }

      newMatch.comments.push({
        comment: req.body.comment,
        commentator: req.userData.userId,
      });
      newMatch.match_id = req.body.match_id;
      await newMatch.save();

      res.status(200).json({ success: true, msg: "Comment added on Match" });
    } catch (err) {
      res.status(500).json({ err });
    }
  },

  async likeMatchComment(req, res, next) {
    try {
      if (!req.body.match_id) {
        return res.status(401).json({ success: false, msg: "No Id provided" });
      }

      const fetchedMatch = await Match.findOne({ match_id: req.body.match_id, "comments._id": req.body.commentId });
      if (!fetchedMatch) {
        res.status(401).json({ success: false, msg: "Can not find Match" });
      }

      const authUser = await User.findOne({ _id: req.userData.userId });
      if (!authUser) {
        res.status(401).json({ success: false, msg: "Unautherized..." });
      }

      for (const comment of fetchedMatch.comments) {
        if (comment.likedBy.includes(authUser._id)) {
          comment.likes--;
          const arrayIndex = comment.likedBy.indexOf(authUser._id);
          comment.likedBy.splice(arrayIndex, 1);
          await fetchedMatch.save();
          res
            .status(200)
            .json({ success: true, msg: "Like on match comment Removed!!" });
        } else {
          comment.likes++;
          comment.likedBy.push(authUser._id);
          await fetchedMatch.save();
          res.status(200).json({ success: true, msg: "Comment on match liked!!" });
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  },

  async getMatchComments(req, res, next) {
    try {
      const foundMatch = await Match.findOne({ match_id: req.params.matchId })
        .populate({
          path: "comments.commentator",
          model: "User",
          select: "local.username image",
        })
        .populate({
          path: "comments.replies.replier",
          model: "User",
          select: "local.username image",
        })
        .select("comments -_id");
      if (!foundMatch) {
        return res.status(400).json({ success: false, msg: "No Match Found" });
      }
      res
        .status(200)
        .json({
          success: true,
          msg: "Match Comments Fetched!",
          comments: foundMatch.comments,
        });
    } catch (err) {
      res.status(500).json({success: false, msg: "Error: " + err});
      return next(new Error(err));
    }
  },

  async matchesCommentReply(req, res, next) {
    try {
      if (!req.body.match_id) {
        return res.status(401).json({ success: false, msg: "No Id provided" });
      }

      if (!req.body.reply) {
        return res
          .status(401)
          .json({ success: false, msg: "No reply provided" });
      }

      const newsToReply = await Match.findOne({ match_id: req.body.match_id });
      if (!newsToReply) {
        res.status(401).json({ success: false, msg: "Can not find match with this id" });
      }

      const authUser = await User.findOne({ _id: req.userData.userId });
      if (!authUser) {
        res.status(401).json({ success: false, msg: "Unautherized..." });
      }

      const replyData = {
        "comments.$.replies": {
          reply: req.body.reply,
          replier: req.userData.userId,
        },
      };

      await Match.findOneAndUpdate(
        { match_id: req.body.match_id, "comments._id": req.body.commentId },
        { $addToSet: replyData },
        { new: true, upsert: true }
      );

      res.status(200).json({ success: true, msg: "Reply to match added" });
    } catch (err) {
      res.status(500).json({ err });
    }
  }

};
