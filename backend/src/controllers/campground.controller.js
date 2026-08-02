import cloudinary from "../lib/cloudinary.js";
import { Campground } from "../models/campground.model.js";
import { Review } from "../models/review.model.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { AppError } from "../utils/appError.js";
import { geocodeLocation } from "../utils/geocodeLocation.js";
import { Conversation } from "../models/conversation.model.js";

const MAX_CAMPGROUND_IMAGES = 6;

export const getCampgrounds = async (req, res) => {
  const campgrounds = await Campground.find({})
    .populate("author", "fullName username imageUrl")
    .populate({
      path: "reviews",
      populate: {
        path: "author",
        select: "fullName username imageUrl",
      },
    });
  res.status(200).json({
    success: true,
    message: "Campgrounds have been fetched successfully",
    data: campgrounds,
  });
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
    throw new AppError("Campground not found", 404);
  }
  res.status(200).json({
    success: true,
    message: "Campgrounds have been fetched successfully",
    data: campground,
  });
};
export const createCampground = async (req, res) => {
  const userId = req.user._id;
  const files = req.files || [];

  const { street, city, houseNumber, ...data } = req.body;

  if (files.length === 0) {
    throw new AppError("At least one image is required", 400);
  }

  const hasEmptyFile = files.some(
    (file) => file.size === 0 || !file.buffer?.length,
  );

  if (hasEmptyFile) {
    throw new AppError("Uploaded image cannot be empty", 400);
  }

  if (files.length > MAX_CAMPGROUND_IMAGES) {
    throw new AppError(
      `A campground can have a maximum of ${MAX_CAMPGROUND_IMAGES} images`,
      400,
    );
  }

  const geocodedLocation = await geocodeLocation({
    city,
    street,
    houseNumber,
  });

  if (!geocodedLocation) {
    throw new AppError("Location could not be found", 400);
  }

  const uploadedImages = await Promise.all(
    files.map(async (file) => {
      const result = await uploadToCloudinary(file);

      return {
        url: result.secure_url,
        filename: result.public_id,
      };
    }),
  );

  const location = `${street} ${houseNumber}, ${city}`;

  const newCampground = await Campground.create({
    ...data,
    city,
    street,
    houseNumber,
    location,
    geometry: {
      type: "Point",
      coordinates: [geocodedLocation.longitude, geocodedLocation.latitude],
    },
    images: uploadedImages,
    author: userId,
  });

  res.status(201).json({
    success: true,
    message: "Campground has been created successfully",
    data: newCampground,
  });
};

export const updateCampground = async (req, res) => {
  const campground = req.campground;
  const data = req.body;

  const addressChanged =
    data.city !== undefined ||
    data.street !== undefined ||
    data.houseNumber !== undefined;

  if (addressChanged) {
    const city = data.city ?? campground.city;
    const street = data.street ?? campground.street;
    const houseNumber = data.houseNumber ?? campground.houseNumber;

    if (!city || !street || !houseNumber) {
      throw new AppError("City, street and house number are required", 400);
    }

    const geocodedLocation = await geocodeLocation({
      city,
      street,
      houseNumber,
    });

    if (!geocodedLocation) {
      throw new AppError("Location could not be found", 400);
    }

    data.location = `${street} ${houseNumber}, ${city}`;

    campground.geometry = {
      type: "Point",
      coordinates: [geocodedLocation.longitude, geocodedLocation.latitude],
    };
  }

  campground.set(data);

  await campground.save();

  res.status(200).json({
    success: true,
    message: "Campground has been updated successfully",
    data: campground,
  });
};

export const updateCampgroundImages = async (req, res) => {
  const files = req.files || [];
  const campground = req.campground;

  if (files.length === 0) {
    throw new AppError("At least one image is required", 400);
  }

  const hasEmptyFile = files.some(
    (file) => file.size === 0 || !file.buffer?.length,
  );

  if (hasEmptyFile) {
    throw new AppError("Uploaded image cannot be empty", 400);
  }

  const currentImagesCount = campground.images.length;

  const totalImagesCount = currentImagesCount + files.length;

  if (totalImagesCount > MAX_CAMPGROUND_IMAGES) {
    const availableSlots = MAX_CAMPGROUND_IMAGES - currentImagesCount;
    const message =
      availableSlots === 0
        ? `A campground can have a maximum of ${MAX_CAMPGROUND_IMAGES} images`
        : `A campground can have a maximum of ${MAX_CAMPGROUND_IMAGES} images. You can upload ${availableSlots} more`;

    throw new AppError(message, 400);
  }

  const uploadedImages = await Promise.all(
    files.map(async (file) => {
      const result = await uploadToCloudinary(file);

      return {
        url: result.secure_url,
        filename: result.public_id,
      };
    }),
  );

  campground.images.push(...uploadedImages);

  await campground.save();

  res.status(200).json({
    success: true,
    message: "Images have been added successfully",
    campground,
  });
};

export const deleteCampgroundImage = async (req, res) => {
  const { imageId } = req.params;
  const campground = req.campground;

  //.id a nie _id bo to jest metoda, ktora wykonuje kod, ktory szuka w tablicy pliku o danym _id
  const image = campground.images.id(imageId);

  if (!image) {
    throw new AppError("Image not found", 404);
  }

  campground.images.pull(imageId);

  await campground.save();

  await cloudinary.uploader.destroy(image.filename);

  res.status(200).json({
    success: true,
    message: "Image has been deleted successfully",
    campground,
  });
};

//tutaj juz nie musimy szukac po id campground poniewaz w middleware isAuthor dolaczamy w req ten camp, wiec nie musimy juz pobierac go znow z dbs
export const deleteCampground = async (req, res) => {
  const campground = req.campground;
  await Promise.all(
    campground.images.map((image) =>
      cloudinary.uploader.destroy(image.filename),
    ),
  );
  await Review.deleteMany({ _id: { $in: campground.reviews } });
  await Conversation.deleteMany({ campground: { $in: campground._id } });
  await campground.deleteOne();

  res.status(200).json({
    success: true,
    message: "Campground has been deleted successfully",
  });
};
