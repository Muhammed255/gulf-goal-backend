import path, { join } from "path";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import session from "express-session";

import { userRoutes } from "./routes/user.routes";
import { appConfig } from "./middleware/app-config";
import passport from "passport";
import { jwtConfig } from "./middleware/passport-jwt";
import { PassportGoogle } from "./middleware/passport-google";
import User from "./models/user.model";
import { FacebookPassport } from "./middleware/passport-facebook";
import { newsRoutes } from "./routes/news.routes";
import { teamsRoutes } from "./routes/teams.routes";

const app = express();
const port = appConfig.port;

mongoose.Promise = global.Promise;

mongoose
  .connect(appConfig.database, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connected To Mongo DB");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  session({
    secret: appConfig.securityCode,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize({ userProperty: "userData" }));
app.use(passport.session());
jwtConfig();
PassportGoogle();
FacebookPassport();
// Save user into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    if (err) {
      return done(err, null);
    }
    return done(null, user);
  });
});


//Setup CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');

  res.header(
      'Access-Control-Allow-Methods',
      'GET,PUT,POST,DELETE,OPTIONS, PATCH'
  );

  res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  next();
});

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/users", userRoutes);

app.use("/api/news", newsRoutes);

app.use('/api/teams', teamsRoutes)

app.listen(port, () => console.log(`Gulf Goal app listening on port ${port}`));
