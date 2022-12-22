const express = require("express");
const router = express.Router();
const Album = require("../models/albumModel");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//get all albums
router.get("/", async (req, res) => {
  const albums = await Album.find();
  res.status(201).json(albums);
});

//get album by id
router.get("/:id", getAlbum, (req, res) => {
  res.json(res.album);
});

// get album by user id
router.get("/user/:id", async (req, res) => {
  let id = req.params.id;
  try {
    const findAlbum = await Album.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $match: {
          userId: ObjectId(id),
        },
      },
    ]);
    res.status(201).json(findAlbum);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//create album
router.post("/", async (req, res) => {
  const album = new Album({
    userId: req.body.userId,
    name: req.body.name,
  });
  try {
    const newAlbum = await album.save();
    res.status(201).json(newAlbum);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//update album
router.patch("/:id", getAlbum, async (req, res) => {
  if (req.body.userId != null) {
    res.album.userId = req.body.userId;
  }
  if (req.body.name != null) {
    res.album.name = req.body.name;
  }
  try {
    const updatedAlbum = await res.album.save();
    res.json(updatedAlbum);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// remove album
router.delete("/:id", getAlbum, async (req, res) => {
  try {
    await res.album.remove();
    res.json({ message: "Album removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getAlbum(req, res, next) {
  let album;
  try {
    album = await Album.findById(req.params.id);
    if (album == null) {
      return res.status(404).json({ message: "album not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.album = album;
  next();
}

module.exports = router;
