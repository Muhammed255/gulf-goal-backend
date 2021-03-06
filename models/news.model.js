import moment from "moment";
import mongoose from "mongoose";

const ObjectId = mongoose.Types.ObjectId;

let commentLengthChecker = (comment) => {
  if (!comment[0]) {
    return false;
  } else {
    if (comment[0].length < 0 || comment[0].length > 200) {
      return false;
    } else {
      return true;
    }
  }
};

const commentValidator = [
  {
    validator: commentLengthChecker,
    message: "comment can not exceed 200 characters",
  },
];
const curent_date = new Date();

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  userId: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  tag: {
    type: ObjectId,
    ref: "Tag",
    required: true,
  },
  tag_name: {
    type: String,
    default: null,
  },
  is_trend: {
    type: Boolean,
    default: false,
  },
  cloudinary_id: {
    type: String
  },
  comments: [
    {
      comment: { type: String, validate: commentValidator },
      commentator: { type: ObjectId, ref: "User" },
      comment_date: {
        type: String,
        default: () =>moment().format("lll"),
      },
      likedBy: [
        {
          type: ObjectId,
          ref: "User",
        },
      ],
      likes: {
        type: Number,
        default: 0,
      },
      replies: [
        {
          reply: { type: String, validate: commentValidator },
          replier: { type: ObjectId, ref: "User" },
          reply_date: {
            type: String,
            default: () => moment().format("lll"),
          },
        },
      ],
    },
  ],
  related_news: [
    {
      type: ObjectId,
      ref: "News",
      default: [],
    },
  ],
  likedBy: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
  likes: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: String,
    default: () => moment().format("lll"),
  },
  visits: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("News", newsSchema);
