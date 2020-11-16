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
  comments: [
    {
      comment: { type: String, validate: commentValidator },
      commentator: { type: ObjectId, ref: "User" },
      comment_date: { type: Date, default: Date.now },
      replies: [
        {
          reply: { type: String, validate: commentValidator },
          replier: { type: ObjectId, ref: "User" },
          reply_date: { type: Date, ref: "User" },
        },
      ],
    },
  ],
  likedBy: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
  dislikedBy: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
  teamId: {
    type: String,
  },
  trends: [
    {
      type: ObjectId,
      ref: "News",
      unique: true,
      default: []
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("News", newsSchema);
