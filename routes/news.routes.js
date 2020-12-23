import path from "path";
import express from "express";
import multer from "multer";
import passport from "passport";
import newsController from "../controllers/news.controller.js";
import { checkAuth } from "../middleware/check-auth.js";

const MIME_TYPE_MAP = {
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png",
};

process.env.PWD = process.cwd();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid Mime Type");
    if (isValid) {
      error = null;
    }
    cb(error, path.join(process.env.PWD + "/images"));
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLocaleLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const newsRoutes = express.Router();

newsRoutes.post(
  "/create-news",
  checkAuth,
  multer({ storage: storage, fileFilter: fileFilter }).single("image"),
  newsController.addNews
);

newsRoutes.post("/add-comment", checkAuth, newsController.commentNews);

newsRoutes.get("/get-comments/:newsId", newsController.newsComments);

newsRoutes.post("/do-reply", checkAuth, newsController.newsCommentReply);

newsRoutes.post("/like-news", checkAuth, newsController.likeNew);

newsRoutes.post("/dislike-news", checkAuth, newsController.dislikeNew);

newsRoutes.post("/trend/:newsId", checkAuth, newsController.makeNewsTrend);

newsRoutes.delete("/trend/:trendId", checkAuth, newsController.removeTrend);

newsRoutes.get("/all-news", newsController.allNews);

newsRoutes.get("/get-recent-news", newsController.recentFiveNews);

newsRoutes.get("/get-random-news", newsController.getRandomNews);

newsRoutes.get("/admin-news", newsController.admin_allNews);

newsRoutes.get("/all-trends", newsController.getTrendingNews);

newsRoutes.get("/admin-trends", newsController.getAdminTrendingNews);

newsRoutes.get("/filtered-news", newsController.filterNewsByTag);

newsRoutes.get("/filtered-news/:newsId", newsController.filterNewsByTagName);

newsRoutes.put(
  "/add-to-favorites/:newsId",
  checkAuth,
  newsController.addNewsToFavorite
);

newsRoutes.put(
  "/remove-from-favorites/:newsId",
  checkAuth,
  newsController.removeNewsFromFavorites
);

newsRoutes
  .route("/:newsId")
  .get(newsController.findOneNews)
  .put(
    checkAuth,
    multer({ storage, fileFilter }).single("image"),
    newsController.updateNews
  )
  .delete(checkAuth, newsController.deleteNews);
