import fs from "fs";
import path from "path";
import News from "../models/news.model.js";
import Trends from "../models/trends.model.js";
import User from "../models/user.model.js";

//import { dirname } from "path";
//import { fileURLToPath } from "url";
//const __filename = fileURLToPath(import.meta.url);
//const __dirname = dirname(__filename);

export default {
  async addNews(req, res, next) {
    try {
      const { title, content, teamId, tag } = req.body;
      const url = "https://gulf-goal.herokuapp.com";
      const authUser = await User.findById(req.userData.userId);
      if (authUser.role === "user") {
        return res.status(401).json({
          success: false,
          msg: "Not Allowed to create News",
          auth: authUser.role,
        });
      }
      const news = new News({
        title,
        content,
        image: url + "/images/" + req.file.filename,
        userId: req.userData.userId,
        teamId,
        tag,
      });
      await news.save();
      res.status(200).json({ success: true, msg: "News created !!" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  },

  async findOneNews(req, res, next) {
    try {
      const news = await News.findById(req.params.newsId).populate("tag");
      if (!news) {
        res.status(401).json({ success: false, msg: "Can not find news" });
      }
      await News.findByIdAndUpdate(
        req.params.newsId,
        { $inc: { visits: 1 } },
        { new: true }
      );
      res.status(200).json({ news });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  newsComments(req, res, next) {
    News.findById(req.params.newsId)
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
      .select("comments -_id")
      .then((news) => {
        if (!news) {
          res.status(401).json({ success: false, msg: "Can not find news" });
        }
        res.status(200).json({
          success: true,
          msg: "Comments Fetched",
          comments: news.comments,
        });
      })
      .catch((err) => {
        res.status(500).json({ err: "Error Occured: " + err });
      });
  },

  async allNews(req, res, next) {
    try {
      const allNews = await News.find()
        .populate({
          path: "tag",
          select: "tag",
        })
        .sort({ created_at: -1 })
        .populate("userId")
        .populate("related_news")
        .populate("comments.commentator")
        .populate("comments.replies.replier");

      // find related based on tag_name

      allNews.forEach(async (ele) => {
        if (ele.tag) {
          ele.tag_name = ele.tag.tag;
          const filtered = await News.find({ tag_name: ele.tag.tag })
            .limit(5)
            .sort({ created_at: -1 });
          filtered.forEach(async (filter) => {
            if (ele.related_news.some((r) => r._id === filter._id)) {
              return;
            }
            await ele.related_news.push(filter._id);
            ele.populate({ path: "related_news", model: "News" });
            await ele.save();
            console.log(JSON.stringify(ele));
          });
        }
      });

      // const newsToSend = await allNews.select("title content comments image likedBy likes -related_news -visits -userId");

      res.status(200).json(allNews);
      // console.log(JSON.stringify(relatedNews));
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  admin_allNews(req, res, next) {
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.page;
    const allNews = News.find()
      .populate({
        path: "tag",
        select: "tag",
      })
      .sort({ created_at: -1 })
      .populate("userId")
      .populate("related_news")
      .populate("comments.commentator")
      .populate("comments.replies.replier");

    let fetchedNews;
    if (pageSize && currentPage) {
      allNews.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    allNews
      .then((news) => {
        fetchedNews = news;
        return News.countDocuments();
      })
      .then((count) => {
        res.json({ news: fetchedNews, maxNews: count });
      })
      .catch((err) => {
        res.status(500).json({ err });
      });
  },

  async recentFiveNews(req, res, next) {
    try {
      const recent = await News.find()
        .populate({
          path: "tag",
          select: "tag",
        })
        .sort({ created_at: -1 })
        .populate("userId")
        .limit(7);

      res.status(200).json({ recentNews: recent });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  async mostPopularNews(req, res, next) {
    try {
      const popular = await News.find()
        .populate({
          path: "tag",
          select: "tag",
        })
        .sort({ visits: -1 })
        .populate("userId")
        .limit(10);

      res.status(200).json({ recentNews: popular });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  async getRandomNews(req, res, next) {
    try {
      const count = await News.count();
      const random = Math.floor(Math.random() * count);
      const newsQuery = await News.find().skip(random).limit(5).exec();
      res.status(200).json({ randomNews: newsQuery });
    } catch (err) {
      res.status(500).json({ err });
    }
  },

  async filterNewsByTagName(req, res, next) {
    try {
      const news = await News.find({ tag: req.params.tagId })
        .populate("userId")
        .populate("tag");
      if (!news) {
        res
          .status(400)
          .json({ success: false, msg: "No News Found for this tag" });
      }
      res.status(200).json({ filteredNews: news });
    } catch (err) {
      res.status(500).json({ err });
    }
  },

  async updateNews(req, res, next) {
    try {
      const { title, content, teamId, tag } = req.body;
      const url = "https://gulf-foal.herokuapp.com";
      const newsToUpdate = await News.findById(req.params.newsId);
      const authUser = await User.findOne({ _id: req.userData.userId });

      if (!newsToUpdate) {
        res.status(401).json({ success: false, msg: "Can not find news" });
      }
      if (newsToUpdate.userId.toString() !== req.userData.userId.toString()) {
        return res.status(401).json({ success: false, msg: "Unauthorized.." });
      }

      if (!authUser || authUser.role !== "admin") {
        return res
          .status(401)
          .json({ success: false, msg: "Not Allowed to update News" });
      }
      let imagePath = req.body.image;
      if (req.file) {
        imagePath = url + "/images/" + req.file.filename;
      }

      await News.findByIdAndUpdate(
        req.params.newsId,
        { title, content, image: imagePath, teamId, tag },
        { new: true }
      );
      res.status(200).json({ success: true, msg: "News Updated !!" });
    } catch (err) {
      res.status(500).json({ success: false, msg: "Error Occured !!", err });
    }
  },

  async deleteNews(req, res, next) {
    try {
      const newsToDelete = await News.findById(req.params.newsId);
      const authUser = await User.findOne({ _id: req.userData.userId });
      if (!authUser || authUser.role !== "admin") {
        return res
          .status(401)
          .json({ success: false, msg: "Not Allowed to create News" });
      }
      if (!newsToDelete) {
        res.status(401).json({ success: false, msg: "Can not find news" });
      }
      if (newsToDelete.userId.toString() !== req.userData.userId.toString()) {
        return res.status(401).send({ success: false, msg: "Unauthorized.." });
      }

      await News.findByIdAndDelete(req.params.newsId);
      res.status(200).json({ success: true, msg: "News Deleted !!" });
    } catch (err) {
      res.status(500).json({ success: false, msg: "Error Occured !!", err });
    }
  },

  async likeNew(req, res, next) {
    try {
      if (!req.body.newsId) {
        return res.status(401).json({ success: false, msg: "No Id provided" });
      }

      const newsToLike = await News.findOne({ _id: req.body.newsId });
      if (!newsToLike) {
        res.status(401).json({ success: false, msg: "Can not find news" });
      }

      const authUser = await User.findOne({ _id: req.userData.userId });
      if (!authUser) {
        res.status(401).json({ success: false, msg: "Unautherized..." });
      }

      if (newsToLike.userId === authUser._id) {
        res
          .status(401)
          .json({ success: false, msg: "You Can not like your news" });
      }


      if (newsToLike.likedBy.includes(authUser._id)) {
        newsToLike.likes--;
        const arrayIndex = newsToLike.likedBy.indexOf(authUser._id);
        newsToLike.likedBy.splice(arrayIndex, 1);
        await newsToLike.save();
        res.status(401).json({ success: true, msg: "News liked removed" });
      } else {
        newsToLike.likes++;
        newsToLike.likedBy.push(authUser._id);
        await newsToLike.save();
        res.status(401).json({ success: true, msg: "News liked" });
      }
    } catch (err) {
      res.status(500).json({ err });
    }
  },

  async likeNewsComment(req, res, next) {
    try {
      if (!req.body.newsId) {
        return res.status(401).json({ success: false, msg: "No Id provided" });
      }

      const fetchedNews = await News.findOne({ _id: req.body.newsId, "comments._id": req.body.commentId });
      if (!fetchedNews) {
        res.status(401).json({ success: false, msg: "Can not find news" });
      }

      const authUser = await User.findOne({ _id: req.userData.userId });
      if (!authUser) {
        res.status(401).json({ success: false, msg: "Unautherized..." });
      }

      for (let ele = 0; ele < fetchedNews.comments.length; ele++) {
        const comment = fetchedNews.comments[ele];
        if (comment.likedBy.includes(authUser._id)) {
          comment.likes--;
          const arrayIndex = comment.likedBy.indexOf(authUser._id);
          if(arrayIndex > -1) {
            comment.likedBy.splice(arrayIndex, 1);
          }
          await fetchedNews.save();
          res
            .status(200)
            .json({ success: true, msg: "Like Removed!!" });
        } else {
          comment.likes++;
          comment.likedBy.push(authUser._id);
          await fetchedNews.save();
          res.status(200).json({ success: true, msg: "Comment liked!!" });
        }
      }

      // for (const comment of fetchedNews.comments) {
      //   if (comment.likedBy.includes(authUser._id)) {
      //     comment.likes--;
      //     const arrayIndex = comment.likedBy.indexOf(authUser._id);
      //     if(arrayIndex > -1) {
      //       comment.likedBy.splice(arrayIndex, 1);
      //     }
      //     await fetchedNews.save();
      //     res
      //       .status(200)
      //       .json({ success: true, msg: "Like Removed!!" });
      //   } else {
      //     comment.likes++;
      //     comment.likedBy.push(authUser._id);
      //     await fetchedNews.save();
      //     res.status(200).json({ success: true, msg: "Comment liked!!" });
      //   }
      // }
    } catch (err) {
      res.status(500).json({ err });
    }
  },

  async dislikeNew(req, res, next) {
    try {
      if (!req.body.newsId) {
        return res.status(401).json({ success: false, msg: "No Id provided" });
      }

      const newsToLike = await News.findOne({ _id: req.body.newsId });
      if (!newsToLike) {
        res.status(401).json({ success: false, msg: "Can not find news" });
      }

      const authUser = await User.findOne({ _id: req.userData.userId });
      if (!authUser) {
        res.status(401).json({ success: false, msg: "Unautherized..." });
      }

      if (newsToLike.userId === authUser._id) {
        res
          .status(401)
          .json({ success: false, msg: "You Can not dislike your news" });
      }

      if (newsToLike.dislikedBy.includes(authUser._id)) {
        res
          .status(401)
          .json({ success: false, msg: "You Already disliked this news" });
      }

      if (newsToLike.likedBy.includes(authUser._id)) {
        newsToLike.likes--;
        const arrayIndex = newsToLike.likedBy.indexOf(authUser._id);
        newsToLike.likedBy.splice(arrayIndex, 1);
        newsToLike.dislikes++;
        newsToLike.dislikedBy.push(authUser._id);
        await newsToLike.save();
        res.status(401).json({ success: true, msg: "News disliked" });
      } else {
        newsToLike.dislikes++;
        newsToLike.dislikedBy.push(authUser._id);
        await newsToLike.save();
        res.status(401).json({ success: true, msg: "News disliked" });
      }
    } catch (err) {
      res.status(500).json({ err });
    }
  },

  async commentNews(req, res, next) {
    try {
      if (!req.body.newsId) {
        return res.status(401).json({ success: false, msg: "No Id provided" });
      }

      if (!req.body.comment) {
        return res
          .status(401)
          .json({ success: false, msg: "No comment provided" });
      }

      const newsToComment = await News.findOne({ _id: req.body.newsId });
      if (!newsToComment) {
        res.status(401).json({ success: false, msg: "Can not find news" });
      }

      const authUser = await User.findOne({ _id: req.userData.userId });
      if (!authUser) {
        res.status(401).json({ success: false, msg: "Unautherized..." });
      }

      newsToComment.comments.push({
        comment: req.body.comment,
        commentator: req.userData.userId,
      });

      await newsToComment.save();

      res.status(200).json({ success: true, msg: "Comment added" });
    } catch (err) {
      res.status(500).json({ err });
    }
  },

  async newsCommentReply(req, res, next) {
    try {
      const newsId = req.body.newsId;
      if (!newsId) {
        return res.status(401).json({ success: false, msg: "No Id provided" });
      }

      if (!req.body.reply) {
        return res
          .status(401)
          .json({ success: false, msg: "No reply provided" });
      }

      const newsToReply = await News.findOne({ _id: newsId });
      if (!newsToReply) {
        res.status(401).json({ success: false, msg: "Can not find news" });
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
      
      await News.updateOne(
        { _id: newsId, "comments._id": req.body.commentId },
        { $push: replyData },
        { new: true }
      );
      
      res.status(200).json({ success: true, msg: "Reply added" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err });
    }
  },

  async addNewsToFavorite(req, res, next) {
    try {
      const fetchedUser = await User.findOne({ _id: req.userData.userId });
      if (!fetchedUser) {
        return res.status(401).json({ success: false, msg: "Unautherized" });
      }
      const fetchedNews = await News.findById(req.params.newsId);
      if (!fetchedNews) {
        return res.status(401).json({ success: false, msg: "No Id provided" });
      }

      fetchedUser.fav_news.push(fetchedNews._id);
      await fetchedUser.save();
      res.status(200).json({ success: true, msg: "News added to favorites" });
    } catch (err) {
      res.status(500).json({ err });
    }
  },

  async removeNewsFromFavorites(req, res, next) {
    try {
      const fetchedUser = await User.findOne({ _id: req.userData.userId });
      if (!fetchedUser) {
        return res.status(401).json({ success: false, msg: "Unautherized" });
      }
      const fetchedNews = await News.findById(req.params.newsId);
      if (!fetchedNews) {
        return res.status(401).json({ success: false, msg: "No Id provided" });
      }

      const index = fetchedUser.fav_news.findIndex((id) => {
        return id.toString() === fetchedNews._id;
      });
      if (index !== -1) {
        fetchedUser.fav_news.splice(index, 1);
      }
      fetchedUser.fav_news.pull(fetchedNews._id);
      await fetchedUser.save();
      res
        .status(200)
        .json({ success: true, msg: "News removed from favorites" });
    } catch (err) {
      res.status(500).json({ err });
    }
  },

  async makeNewsTrend(req, res, next) {
    try {
      const news = await News.findById(req.params.newsId);
      if (!news) {
        return res.status(401).json({ success: false, msg: "No Id provided" });
      }
      const fetchedUser = await User.findOne({ _id: req.userData.userId });
      if (!fetchedUser) {
        return res.status(401).json({ success: false, msg: "Unautherized" });
      }

      const trends = new Trends();
      trends.title = news.title;
      trends.content = news.content;
      trends.image = news.image;
      trends.userId = fetchedUser._id;
      trends.tag = news.tag;
      trends.newsId = news._id;

      const checkTrends = await Trends.find();

      // let newsIndex;
      if (checkTrends.length >= 1) {
        const newsIndex = checkTrends.findIndex((t) => {
          return t.newsId.toString() === news._id.toString();
        });
        if (newsIndex !== -1) {
          return res
            .status(401)
            .json({ success: false, msg: "You already add this to trends" });
        }
      }

      const arrayLength = checkTrends.length;
      console.log("length: ", arrayLength);
      if (arrayLength <= 4) {
        trends.trends_news = news._id;
        news.is_trend = true;
      } else {
        await Trends.findOneAndDelete({ _id: checkTrends[0]._id });
        trends.trends_news = news._id;
        news.is_trend = true;
      }

      await trends.save();
      await news.save();
      res.status(200).json({ success: true, msg: "Becomes a trend" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg: err });
    }
  },

  async getAdminTrendingNews(req, res, next) {
    try {
      const trends = await User.find()
        .populate("trends_news")
        .populate("tag")
        .populate("userId");
      res.status(200).json(trends);
    } catch (err) {
      res.status(500).json({ success: false, msg: err });
    }
  },

  async getTrendingNews(req, res, next) {
    try {
      const trends = await News.find({is_trend: true})
        .populate("tag")
        .populate("userId");
      trends.forEach((ele) => {
        if (ele.tag) {
          ele.tag_name = ele.tag.tag;
          // console.log(JSON.stringify(ele));
        }
      });
      res.status(200).json(trends);
    } catch (err) {
      res.status(500).json({ success: false, msg: err });
    }
  },

  async removeTrend(req, res, next) {
    try {
      const trend = await Trends.findById(req.params.trendId);
      if (!trend) {
        return res.status(401).json({ success: false, msg: "No Id provided" });
      }

      const news = await News.findOne({ _id: trend.newsId });
      if (!news) {
        return res.status(401).json({ success: false, msg: "No Id provided" });
      }

      // const trends = await Trends.find();
      // if (!trends) {
      //   return res.status(401).json({ success: false, msg: "No trends" });
      // }
      const fetchedUser = await User.findOne({ _id: req.userData.userId });
      if (!fetchedUser) {
        return res.status(401).json({ success: false, msg: "Unautherized" });
      }
      // const newsIndex = trends.findIndex(
      //   (t) => t.newsId.toString() === news._id.toString()
      // );

      news.is_trend = false;
      await news.save();

      await Trends.findOneAndDelete({ _id: trend._id });

      res.status(200).json({ success: true, msg: "Trend Deleted!!" });
    } catch (err) {
      res.status(500).json({ err });
    }
  },

  async filterNewsByTag(req, res, next) {
    try {
      const fetchedNews = await News.find({ tag: req.body.tag }).select(
        "tag -userId"
      );
      if (fetchedNews.length < 1) {
        res.status(403).json({ success: false, msg: "No News Found" });
      }
      res
        .status(200)
        .json({ success: true, msg: "Fetched", news: fetchedNews });
    } catch (err) {
      res.status(500).json({ success: false, msg: "Error !!" });
    }
  },
};
