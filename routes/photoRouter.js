const express = require("express");
const router = express.Router();
const Photo = require("../models/photoModel");
const Album = require("../models/albumModel");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//get all photos
router.get("/", async (req, res) => {
  const photos = await Photo.find();
  res.status(201).json(photos);
});

//get photo by id
router.get("/:id", getPhoto, (req, res) => {
  res.json(res.photo);
});

//get photo by user id
router.get("/user/:id", async (req, res) => {
  let id = req.params.id;
  try {
    const findPhoto = await Photo.aggregate([
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
    res.status(201).json(findPhoto);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//get photo by album id
router.get("/album/:id", async (req, res) => {
  let id = req.params.id;
  try {
    const findPhoto = await Photo.aggregate([
      {
        $lookup: {
          from: "albums",
          localField: "albumId",
          foreignField: "_id",
          as: "albumDetails",
        },
      },
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
          albumId: ObjectId(id),
        },
      },
    ]);
    res.status(201).json(findPhoto);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//create photo
router.post("/", async (req, res) => {
  const photo = new Photo({
    albumId: req.body.albumId,
    userId: req.body.userId,
    name: req.body.name,
    imageUrl: req.body.imageUrl,
  });
  let date = new Date();
  try {
    const newPhoto = await photo.save();
    // console.log(Date.now());
    Album.findByIdAndUpdate(
      req.body.albumId,
      {
        lastUpdatedDate: date.toISOString(),
      },
      (err, data) => {
        if (!err) {
          res.status(201).json(data);
        } else {
          console.log(err);
        }
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// remove album
router.delete("/:id", getPhoto, async (req, res) => {
  let date = new Date();
  try {
    await res.photo.remove();
    Album.findByIdAndUpdate(req.body.albumId, {
      lastUpdatedDate: date.toISOString(),
    });
    res.json({ message: "Photo removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getPhoto(req, res, next) {
  let photo;
  try {
    photo = await Photo.findById(req.params.id);
    if (photo == null) {
      return res.status(404).json({ message: "photo not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.photo = photo;
  next();
}

module.exports = router;
