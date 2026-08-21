import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { Campground } from "../src/models/campground.model.js";
import cloudinary from "../src/lib/cloudinary.js";
import { campgroundSeeds } from "./campgrounds.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedImages = {
  lake: [
    "lake-1.avif",
    "lake-2.avif",
    "lake-3.avif",
    "lake-4.avif",
    "lake-5.avif",
    "lake-6.avif",
  ],

  forest: [
    "forest-1.avif",
    "forest-2.avif",
    "forest-3.avif",
    "forest-4.avif",
    "forest-5.avif",
    "forest-6.avif",
  ],

  mountain: [
    "mountain-1.avif",
    "mountain-2.avif",
    "mountain-3.avif",
    "mountain-4.avif",
    "mountain-5.avif",
    "mountain-6.avif",
  ],

  coast: [
    "coast-1.avif",
    "coast-2.avif",
    "coast-3.avif",
    "coast-4.avif",
    "coast-5.avif",
    "coast-6.avif",
  ],
};

const descriptions = {
  lake: [
    "A peaceful campground surrounded by nature and located close to a beautiful lake.",
    "A quiet lakeside escape perfect for swimming, kayaking and relaxing by the water.",
    "A scenic campground near the lake with plenty of space for outdoor activities.",
  ],

  forest: [
    "A quiet campground surrounded by dense forest and hiking trails.",
    "A peaceful forest retreat with fresh air and easy access to nature.",
    "A calm woodland campground far away from busy roads and city noise.",
  ],

  mountain: [
    "A scenic campground surrounded by mountains with easy access to hiking trails.",
    "A peaceful mountain base camp with beautiful views and outdoor activities nearby.",
    "An ideal place for mountain lovers looking for fresh air and hiking opportunities.",
  ],

  coast: [
    "A relaxing campground close to the Baltic coast and surrounded by pine forests.",
    "Enjoy fresh sea air and sandy beaches from this peaceful coastal campground.",
    "A comfortable camping spot near the Baltic Sea, perfect for summer holidays.",
  ],
};

const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const getSeedImages = (category, index) => {
  const images = seedImages[category];

  if (!images) {
    throw new Error(`Invalid seed category: ${category}`);
  }

  const offset = index % images.length;

  return [...images.slice(offset), ...images.slice(0, offset)];
};

const uploadSeedImages = async (campground, index) => {
  const imageNames = getSeedImages(campground.type, index);

  const uploadedImages = await Promise.all(
    imageNames.map(async (imageName, imageIndex) => {
      const imagePath = path.join(__dirname, "images", imageName);

      const result = await cloudinary.uploader.upload(imagePath, {
        folder: `yelp-camp/seeds/campground-${index + 1}`,
        public_id: `image-${imageIndex + 1}`,
        overwrite: true,
      });

      return {
        url: result.secure_url,
        filename: result.public_id,
      };
    }),
  );

  return uploadedImages;
};

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    if (!process.env.SEED_AUTHOR_ID) {
      throw new Error("SEED_AUTHOR_ID is missing");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to database");

    console.log("Deleting old seed images from Cloudinary...");

    await cloudinary.api.delete_resources_by_prefix("yelp-camp/seeds/");

    console.log("Deleting old campgrounds...");

    await Campground.deleteMany({});

    for (let i = 0; i < campgroundSeeds.length; i++) {
      const campgroundData = campgroundSeeds[i];

      console.log(
        `Creating ${i + 1}/${campgroundSeeds.length}: ${campgroundData.title}`,
      );

      const images = await uploadSeedImages(campgroundData, i);

      await Campground.create({
        title: campgroundData.title,

        description: getRandomItem(descriptions[campgroundData.type]),

        city: campgroundData.city,
        street: campgroundData.street,
        houseNumber: campgroundData.houseNumber,
        location: campgroundData.location,
        price: campgroundData.price,

        geometry: {
          type: "Point",
          coordinates: campgroundData.coordinates,
        },

        images,

        author: process.env.SEED_AUTHOR_ID,
      });
    }

    console.log(`Successfully seeded ${campgroundSeeds.length} campgrounds`);
  } catch (error) {
    console.error("Failed to seed database:", error);
  } finally {
    await mongoose.connection.close();

    console.log("Database connection closed");
  }
};

seedDatabase();
