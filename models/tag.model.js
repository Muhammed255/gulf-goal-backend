import mongoose from "mongoose";

var tagSchema = new mongoose.Schema({
  tag: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  visits: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("Tag", tagSchema);
