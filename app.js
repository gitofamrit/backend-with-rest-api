const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const auth = require("./routes/api/auth");
const profile = require("./routes/api/profile");
const questions = require("./routes/api/questions");
const passport = require("passport");
const linuxQuestions = require("./routes/api/linuxQuestions");
var port = process.env.PORT || 5000;

const mongoose = require("mongoose");

//MongoDB configuration
const db = require("./setup/myurl").mongoURL;

//Attempt for DB connection
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB connected successfully..."))
  .catch(err => console.log(err));

//Middleware for express
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

//Passport middlewares
app.use(passport.initialize());

//Config for jwt strategy
//(Similar to importing passport.use() function)
require("./strategies/jwtStrategy")(passport);

//Creating routes
app.use("/api/auth", auth);
app.use("/api/profile", profile);
app.use("/api/questions", questions);
app.use("/api/linux/questions", linuxQuestions);

app.listen(port, () => console.log(`Server is running at port ${port}...`));
