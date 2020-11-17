import News from "../models/news.model.js";
import User from "../models/user.model.js";

export default {
  async addNews(req, res, next) {
    try {
      const { title, content, teamId, tag } = req.body;
      // const url = req.protocol + "://" + req.get("host");
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
        image: "../images/" + req.file.originalname,
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
      const filteredNews = await News.find({ tag: news.tag._id }).limit(5);

      res.status(200).json({ news, filteredNews });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  async allNews(req, res, next) {
    try {
      const allNews = await News.find()
        .sort({ created_at: -1 })
        .populate("userId")
        .populate({path: "tag", select: "tag"})
        .populate("comments.commentator")
        .populate("comments.replies.replier");
        allNews.forEach(ele => {
          ele.tag = ele.tag.tag;
        });
      res.status(200).json(allNews);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  async updateNews(req, res, next) {
    try {
      const { title, content, teamId, tag } = req.body;
      // const url = req.protocol + "://" + req.get("host");
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
        imagePath = "../images/" + req.file.filename;
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
        res
          .status(401)
          .json({ success: false, msg: "You Already liked this news" });
      }

      if (newsToLike.dislikedBy.includes(authUser._id)) {
        newsToLike.dislikes--;
        const arrayIndex = newsToLike.dislikedBy.indexOf(authUser._id);
        newsToLike.dislikedBy.splice(arrayIndex, 1);
        newsToLike.likes++;
        newsToLike.likedBy.push(authUser._id);
        await newsToLike.save();
        res.status(401).json({ success: true, msg: "News liked" });
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
      if (!req.body.newsId) {
        return res.status(401).json({ success: false, msg: "No Id provided" });
      }

      if (!req.body.reply) {
        return res
          .status(401)
          .json({ success: false, msg: "No reply provided" });
      }

      const newsToReply = await News.findOne({ _id: req.body.newsId });
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

      await News.findOneAndUpdate(
        { _id: req.body.newsId, "comments._id": req.body.commentId },
        { $addToSet: replyData },
        { new: true, upsert: true }
      );

      res.status(200).json({ success: true, msg: "Reply added" });
    } catch (err) {
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
      const newsIndex = news.trends.findIndex(
        (t) => t.toString() === news._id.toString()
      );
      if (newsIndex !== -1) {
        return res
          .status(401)
          .json({ success: false, msg: "You already add this to trends" });
      }
      const arrayLength = news.trends.length;
      if (arrayLength <= 4) {
        news.trends.push(news._id);
        console.log("normal: ", news.trends);
      } else {
        news.trends.shift();
        news.trends.push(news._id);
        console.log("after shifting: ", news.trends);
      }

      await news.save();
      res.status(200).json({ success: true, msg: "Becomes a trend" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg: err });
    }
  },

  async getTrendingNews(req, res, next) {
    try {
      const trends = await News.find().select("trends").populate("trends");
      res.status(200).json(trends[0].trends);
    } catch (err) {
      res.status(500).json({ success: false, msg: err });
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
