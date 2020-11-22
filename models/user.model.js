import mongoose from "mongoose";

import uniqueValidator from "mongoose-unique-validator";

const ObjectId = mongoose.Types.ObjectId;

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
  local: {
    email: { type: String, unique: true },
    username: String,
    password: String,
  },
  google: {
    email: String,
    userId: String,
    displayName: String,
    token: String,
  },
  facebook: {
    email: String,
    userId: String,
    displayName: String,
    token: String,
  },
  fav_news: [
    {
      type: ObjectId,
      ref: "News",
    },
  ],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  fav_teams: [
    {
      team_name: {
        type: String,
        required: true,
      },
      team_key: {
        type: String,
        required: true,
        unique: true,
      },
      team_badge: {
        type: String,
        required: true,
      },
    },
  ],
  trends_news: [
    {
      type: ObjectId,
      ref: "News",
      default: [],
    },
  ],
  preferredLanguage: {
    type: String,
    enum: ["English", "Arabic", "Espanol", "Indonis"],
    default: "English",
  },
  image: {
    type: String,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

userSchema.plugin(uniqueValidator);

// userSchema.pre("save", async function () {
//   if (this.isModified("password") || this.isNew) {
//     const salt = await bcrypt.genSalt();
//     const hash = await bcrypt.hash(this.password, salt);
//     this.password = hash;
//   }
// });

export default mongoose.model("User", userSchema);
