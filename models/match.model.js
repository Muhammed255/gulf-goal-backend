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

const matchesSchema = new mongoose.Schema({
  match_id: {
    type: String,
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
});

export default mongoose.model("Matches", matchesSchema);