import passport from "passport";
import passportJWT from "passport-jwt";
import User from "../models/user.model.js";
import { appConfig } from "./app-config.js";

var JwtStrategy = passportJWT.Strategy,
  ExtractJwt = passportJWT.ExtractJwt;
export const jwtConfig = () => {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = appConfig.securityCode;
  passport.use(
    new JwtStrategy(opts, function (payload, done) {
      User.findOne({ id: payload.id }, function (err, user) {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    })
  );
};
