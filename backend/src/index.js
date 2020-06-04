const express = require("express");
const path = require("path");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");

const config = {
  mongoURL:
    "mongodb+srv://nicolas:R9ECZDFNNLpKpKub@cluster0-j19z3.mongodb.net/toptal-test?retryWrites=true&w=majority",
  port: 4000,
};

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoURL, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function callback() {
  console.log("db connected");
});

var app = express();
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(config.port, (err) => {
  if (err) {
    return console.log(err.message);
  }
  console.log("Listening port " + config.port);
});

module.exports = app;
