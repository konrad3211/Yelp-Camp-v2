import cloudinary from "../lib/cloudinary.js";
import { Campground } from "../models/campground.model.js";
import { Review } from "../models/review.model.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

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

  const uploadedImages = await Promise.all(
    //map przechodzi po kazdym elemencie tablicy
    (req.files || []).map(async (file) => {
      const result = await uploadToCloudinary(file);

      return {
        url: result.secure_url,
        filename: result.public_id,
      };
    }),
  );
  const newCampground = new Campground({
    title,
    location,
    price,
    description,
    images: uploadedImages,
    author: userId,
  });

  await newCampground.save();

  res.status(201).json({
    message: "Campground has been created successfully",
    newCampground,
  });
};

export const updateCampground = async (req, res) => {
  const { location, description, price, title } = req.body;

  //tutaj nie musimy juz szukac po id poniewaz isAuthor juz znalazl ten camp po id i dorzucamy go w req.
  req.campground.set({
    title,
    location,
    description,
    price,
  });

  await req.campground.save();

  res.status(200).json({
    message: "Campground has been updated successfully",
    campground: req.campground,
  });
};

export const updateCampgroundImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "At least one image is required" });
  }

  const uploadedImages = await Promise.all(
    req.files.map(async (file) => {
      const result = await uploadToCloudinary(file);

      return {
        url: result.secure_url,
        filename: result.public_id,
      };
    }),
  );

  req.campground.images.push(...uploadedImages);

  await req.campground.save();

  res.status(200).json({
    message: "Images have been updated successfully",
    campground: req.campground,
  });
};

export const deleteCampgroundImage = async (req, res) => {
  const { imageId } = req.params;
  const campground = req.campground;

  //.id a nie _id bo to jest metoda, ktora wykonuje kod, ktory szuka w tablicy pliku o danym _id
  const image = campground.images.id(imageId);

  if (!image) {
    return res.status(404).json({ message: "Image not found" });
  }

  campground.images.pull(imageId);

  await campground.save();

  await cloudinary.uploader.destroy(image.filename);

  res.status(200).json({
    message: "Image has been deleted successfully",
    campground: campground,
  });
};

//tutaj juz nie musimy szukac po id campground poniewaz w middleware isAuthor dolaczamy w req ten camp, wiec nie musimy juz pobierac go znow z dbs
export const deleteCampground = async (req, res) => {
  await Review.deleteMany({ _id: { $in: req.campground.reviews } });
  await req.campground.deleteOne();

  res.status(200).json({
    message: "Campground has been deleted successfully",
  });
};
