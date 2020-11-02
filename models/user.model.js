import mongoose from "mongoose";

import bcrypt from "bcryptjs";

const ObjectId = mongoose.Types.ObjectId;

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
  local: {
    name: String,
    email: String,
    username: String,
    password: String,
  },
  google: {
    email: String,
    id: String,
    displayName: String,
    token: String
  },
  facebook: {
    email: String,
    id: String,
    displayName: String,
    token: String
  },
  fav_news: [{
    type: ObjectId,
    ref: 'User'
  }],
  preferredLanguage: {
    type: String,
    enum: ["English", "Arabic", "Espanol", "hebrew"],
    default: "English",
  },
  trends: [{
    type: ObjectId,
    ref: 'News',
    unique: true,
  }]
});

userSchema.statics.getTrends=function() {
  return this.trends;
}

// userSchema.pre("save", async function () {
//   if (this.isModified("password") || this.isNew) {
//     const salt = await bcrypt.genSalt();
//     const hash = await bcrypt.hash(this.password, salt);
//     this.password = hash;
//   }
// });

export default mongoose.model("User", userSchema);
