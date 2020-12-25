import path from "path";
//import { dirname } from "path";
//import { fileURLToPath } from "url";
//const __filename = fileURLToPath(import.meta.url);
//const __dirname = dirname(__filename);
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
// import session from "express-session";
// import passport from "passport";
import cors from "cors";

// import User from "./models/user.model.js";
import { userRoutes } from "./routes/user.routes.js";
import { appConfig } from "./middleware/app-config.js";
// import { jwtConfig } from "./middleware/passport-jwt.js";
// import { PassportGoogle } from "./middleware/passport-google.js";
// import { FacebookPassport } from "./middleware/passport-facebook.js";
import { newsRoutes } from "./routes/news.routes.js";
import { teamsRoutes } from "./routes/teams.routes.js";
import { tagRoutes } from "./routes/tag.routes.js";

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
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(
//   session({
//     secret: appConfig.securityCode,
//     resave: true,
//     saveUninitialized: true,
//   })
// );

// app.use(passport.initialize({ userProperty: "userData" }));
// app.use(passport.session());
// jwtConfig();
// PassportGoogle();
// FacebookPassport();
// // Save user into session
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   User.findById(id, (err, user) => {
//     if (err) {
//       return done(err, null);
//     }
//     return done(null, user);
//   });
// });

//Setup CORS
app.use(cors());
/*app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");

  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,OPTIONS, PATCH"
  );

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  next();
});*/

process.env.PWD = process.cwd();

app.use("/images", express.static(process.env.PWD + "/images"));

app.use("/api/users", userRoutes);

app.use("/api/news", newsRoutes);

app.use("/api/teams", teamsRoutes);

app.use("/api/tags", tagRoutes);

app.listen(port, () => console.log(`Gulf Goal app listening on port ${port}`));
