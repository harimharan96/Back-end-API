require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();

const port = 3000;

//DATABASE

const db = process.env.DB_URL;
mongoose.set("strictQuery", false);
mongoose.connect(db, (err) => {
  if (err) {
    console.error("error: " + err);
  }
});
mongoose.connection.once("open", () => console.log("connected to db"));

//api

app.use(express.json());

app.listen(port, (err) => {
  if (err) {
    console.error("error: " + err);
  } else {
    console.log("listening on port " + port);
  }
});

app.get("/", (req, res) => {
  res.send("server connected");
});
//for user
const usersRouter = require("./routes/userRouter");
app.use("/users", usersRouter);

//for album
const albumsRouter = require("./routes/albumRouter");
app.use("/albums", albumsRouter);

//for photos
const photosRouter = require("./routes/photoRouter");
app.use("/photos", photosRouter);
