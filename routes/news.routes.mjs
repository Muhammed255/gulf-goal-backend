import path from "path";
import express from "express";
import multer from "multer";
import passport from "passport";
import newsController from "../controllers/news.controller.mjs";

const MIME_TYPE_MAP = {
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid Mime Type");
    if (isValid) {
      error = null;
    }
    cb(error, "images");
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
  passport.authenticate("jwt", { session: false }),
  multer({ storage: storage, fileFilter: fileFilter }).single("image"),
  newsController.addNews
);

newsRoutes.post(
  "/add-comment",
  passport.authenticate("jwt", { session: false }),
  newsController.commentNews
);

newsRoutes.post(
  "/do-reply",
  passport.authenticate("jwt", { session: false }),
  newsController.newsCommentReply
);

newsRoutes.post(
  "/like-news",
  passport.authenticate("jwt", { session: false }),
  newsController.likeNew
);

newsRoutes.post(
  "/dislike-news",
  passport.authenticate("jwt", { session: false }),
  newsController.dislikeNew
);

newsRoutes.post('/trend/:newsId', passport.authenticate("jwt", { session: false }), newsController.makeNewsTrend);

newsRoutes.get(
  "/all-news",
  passport.authenticate("jwt", { session: false }),
  newsController.allNews
);

newsRoutes.get("/all-trends", passport.authenticate("jwt", { session: false }), newsController.getTrendingNews);

newsRoutes.put(
  "/add-to-favorites/:newsId",
  passport.authenticate("jwt", { session: false }),
  newsController.addNewsToFavorite
);

newsRoutes.put(
  "/remove-from-favorites/:newsId",
  passport.authenticate("jwt", { session: false }),
  newsController.removeNewsFromFavorites
);

newsRoutes
  .route("/:newsId")
  .get(
    passport.authenticate("jwt", { session: false }),
    newsController.findOneNews
  )
  .put(
    passport.authenticate("jwt", { session: false }),
    multer({ storage, fileFilter }).single("image"),
    newsController.updateNews
  )
  .delete(
    passport.authenticate("jwt", { session: false }),
    newsController.deleteNews
  );
