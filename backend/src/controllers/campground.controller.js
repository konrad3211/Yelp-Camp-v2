import { Campground } from "../models/campground.model.js";

export const getCampgrounds = async (req, res) => {
  const campgrounds = await Campground.find({})
    .populate("author", "fullName username imageUrl")
    .populate("reviews");
  res.status(200).json(campgrounds);
};

export const getCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate("author", "fullName username imageUrl")
    .populate({
      path: "reviews",
      populate: {
        path: "author",
        select: "fullName username imageUrl",
      },
    });
  if (!campground) {
    return res.status(404).json({ message: "Campground not found" });
  }
  res.status(200).json(campground);
};
export const createCampground = async (req, res) => {
  const { title, location, price, description } = req.body;
  const userId = req.user._id;
  const newCampground = new Campground({
    title,
    location,
    price,
    description,
    author: userId,
  });

  await newCampground.save();

  res.status(201).json({
    message: "Campground has been created successfully",
    newCampground,
  });
};

export const updateCampground = async (req, res) => {
  const { location, description, price, images, title } = req.body;

  //tutaj nie musimy juz szukac po id poniewaz isAuthor juz znalazl ten camp po id i dorzucamy go w req.
  req.campground.set({
    title,
    location,
    description,
    price,
    images,
  });

  await req.campground.save();

  res.status(200).json({
    message: "Campground has been updated successfully",
    campground: req.campground,
  });
};

//tutaj juz nie musimy szukac po id campground poniewaz w middleware isAuthor dolaczamy w req ten camp, wiec nie musimy juz pobierac go znow z dbs
export const deleteCampground = async (req, res) => {
  await req.campground.deleteOne();

  res.status(200).json({
    message: "Campground has been deleted successfully",
  });
};
