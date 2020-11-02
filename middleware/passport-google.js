import passport from "passport";
import GoogleStrategy from "passport-google-oauth";
import User from "../models/user.model";
import { appConfig } from "./app-config";

export const PassportGoogle = () => {
  passport.use(
    new GoogleStrategy.OAuth2Strategy(
      {
        clientID: appConfig.google.clientId
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
              const user = await User.findOne({'google.id': profile.id});
              if(user) {
                  return done(null, user);
              }
              const newUser = new User();
              newUser.google.id = profile.id;
              newUser.google.displayName = profile.displayName;
              newUser.google.token = accessToken
              newUser.google.email = profile.emails[0].value;

              await newUser.save();
              return done(null, newUser);
        } catch (err) {
            return done(err)
        }
      }
    )
  );
};
