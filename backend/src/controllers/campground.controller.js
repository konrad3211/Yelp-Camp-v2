import cloudinary from "../lib/cloudinary.js";
import { Campground } from "../models/campground.model.js";
import { Review } from "../models/review.model.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { AppError } from "../utils/appError.js";

const MAX_CAMPGROUND_IMAGES = 5;

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
  const { title, location, price, description } = req.body;
  const userId = req.user._id;
  const files = req.files || [];
  //data jest z validate. Sa tam juz po walidacji informacje.
  const data = req.body;

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

  //Promise.all
  //czeka, aż wszystkie Promise’y się zakończą,
  //zwraca tablicę ich wyników.
  const uploadedImages = await Promise.all(
    //map przechodzi po kazdym elemencie tablicy
    files.map(async (file) => {
      const result = await uploadToCloudinary(file);

      return {
        url: result.secure_url,
        filename: result.public_id,
      };
    }),
  );

  const newCampground = await Campground.create({
    ...data,
    images: uploadedImages,
    author: userId,
  });

  res.status(201).json({
    success: true,
    message: "Campground has been created successfully",
    campground: newCampground,
  });
};

// export const updateCampground = async (req, res) => {
//   const campground = req.campground;
//   const allowedFields = ["title", "location", "description", "price"];
//   const updates = {};

//   for (const field of allowedFields) {
//     if (req.body[field] !== undefined) {
//       updates[field] = req.body[field];
//     }
//   }
//   campground.set(updates);
//   await campground.save();

//   res.status(200).json({
//     success: true,
//     message: "Campground has been updated successfully",
//     campground,
//   });
// };

//*tutaj data mamy juz z validate middleware, wiec tak mozna uproscic ten kontroler
export const updateCampground = async (req, res) => {
  const campground = req.campground;
  const data = req.body;

  campground.set(data);
  await campground.save();

  res.status(200).json({
    success: true,
    message: "Campground has been updated successfully",
    campground,
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
  await campground.deleteOne();

  res.status(200).json({
    success: true,
    message: "Campground has been deleted successfully",
  });
};
