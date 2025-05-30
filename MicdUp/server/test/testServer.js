const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/testconfig.env` });
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bodyParser = require("body-parser");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");
const jwt = require("jsonwebtoken");
const publicSchema = require("../database/publicSchema/index");
const { User } = require("../database/models/User");
const { initUsers } = require("./initData");
const app = express();
app.use(bodyParser.json({ limit: "100kb" }));
app.use(bodyParser.urlencoded({ limit: "100kb", extended: false }));
app.use(cors());

const verifiedUrls = ["http://localhost:19006"];
function useHttps(req, res, next) {
  if (!req.secure && process.env.NODE_ENV !== "DEVELOPMENT")
    return res.redirect("https://" + req.get("host") + req.url);
  next();
}

app.use(useHttps);
let db = process.env.DATABASE.replace("<DB_PASSWORD>", process.env.DB_PASSWORD);
db = db.replace("<DB_USERNAME>", process.env.DB_USERNAME);

var sess = {
  secret: "keyboard cat",
  cookie: { secure: true },
  store: MongoStore.create({
    mongoUrl: db,
  }),
  saveUninitialized: false,
  resave: false,
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}
// look more into
app.use(session(sess));

app.use(function (req, res, next) {
  if (verifiedUrls.includes(req.headers.origin)) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  } else res.setHeader("Access-Control-Allow-Origin", "");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.locals.session = req.session;
  next();
});

app.use(async (req, res, next) => {
  const authHeader = req.get("Authorization");
  let token, userId;
  if (authHeader) {
    token = authHeader.split(" ")[1];
    try {
      userId = jwt.verify(token, "secret");
    } catch (err) {
      console.log(err);
    }
  }
  if (userId) {
    const user = await User.findOne({
      _id: userId.user,
    });
    req.user = user;
    req.isAuthenticated = true;
  }
  req.host = req.get("host");
  next();
});

// FIXME: TEST
app.get("/hello", bodyParser.json(), async (req, res) => {
  res.set("Content-Type", "text/html");
  res.send(Buffer.from("<h2>Test String</h2>"));
  return;
});

app.use("/", graphqlHTTP({ schema: publicSchema, graphiql: true }));
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async (connected) => {
    if (connected) {
      try {
        await User.collection.drop();
      } catch (err) {
        console.log(err);
      }
      await initUsers();
      console.log("MongoDB connected");
    }
  })
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 6004;
let server = http.createServer(app);
server = server.listen(PORT, () =>
  console.log("Server is running on Port", PORT)
);
