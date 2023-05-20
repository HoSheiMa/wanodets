var bodyParser = require("body-parser");
const express = require("express");
var multer = require("multer");
import send from "./controllers/send";
import sendMedia from "./controllers/sendMedia";
import register from "./controllers/register";
import chalk from "chalk";
const app = express();
const port = 3123;
var upload = multer();

process.setMaxListeners(0);

// sessions
global.wa_sessions = {};
// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
//form-urlencoded

// for parsing multipart/form-data
app.use(upload.array());

// monitoring the server
app.use(require("express-status-monitor")());

// routes
app.get("/register", register);
app.post("/send", send);
app.post("/send_media", sendMedia);

app.listen(port, () => {
  // console.clear();
  // console.log(chalk.green(`✅ Server up`));
});
