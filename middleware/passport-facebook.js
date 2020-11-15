import passport from "passport";
import FacebookStrategy from "passport-facebook";
import User from "../models/user.model.js";
import { appConfig } from "./app-config.js";

export const FacebookPassport = () => {
  passport.use(
    new FacebookStrategy.Strategy(
      {
        clientID: appConfig.facebook.appId,
        clientSecret: appConfig.facebook.appSecret,
        callbackURL: appConfig.facebook.redirectUrl,
        enableProof: true,
        profileFields: ["id", "name", "emails"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await User.findOne({ "facebook.id": profile.id });
          if (user) {
            return done(null, user);
          }
          const newUser = new User();
          newUser.facebook.id = profile.id;
          newUser.facebook.displayName =
            profile.name.givenName + " " + profile.name.familyName;
          newUser.facebook.token = accessToken;
          newUser.facebook.email = profile.emails[0].value;

          await newUser.save();
          return done(null, newUser);
        } catch (err) {
          console.log(err);
        }
      }
    )
  );
};
