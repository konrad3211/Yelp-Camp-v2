import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { Campground } from "./campground.model.js";
import { Review } from "./review.model.js";
import { Conversation } from "./conversation.model.js";
import { Message } from "./message.model.js";
import { Booking } from "./booking.model.js";

import cloudinary from "../lib/cloudinary.js";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/dskoxwvuw/image/upload/v1783179068/225-default-avatar_rlu7td.png",
    },

    imageFilename: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.",
      ],
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  const campgrounds = await Campground.find({
    author: doc._id,
  }).select("_id images reviews");

  const campgroundIds = campgrounds.map((campground) => campground._id);

  const reviewIds = campgrounds.flatMap((campground) => campground.reviews);

  const conversations = await Conversation.find({
    campground: {
      $in: campgroundIds,
    },
  }).select("_id");

  const conversationIds = conversations.map((conversation) => conversation._id);

  await Promise.all([
    Message.deleteMany({
      conversation: {
        $in: conversationIds,
      },
    }),

    Conversation.deleteMany({
      campground: {
        $in: campgroundIds,
      },
    }),

    Booking.deleteMany({
      campground: {
        $in: campgroundIds,
      },
    }),

    Review.deleteMany({
      _id: {
        $in: reviewIds,
      },
    }),
  ]);

  const imageFilenames = campgrounds.flatMap((campground) =>
    campground.images
      .filter((image) => image.filename)
      .map((image) => image.filename),
  );

  await Promise.all(
    imageFilenames.map((filename) => cloudinary.uploader.destroy(filename)),
  );

  await Campground.deleteMany({
    _id: {
      $in: campgroundIds,
    },
  });

  await Review.updateMany(
    {
      author: doc._id,
    },
    {
      $set: {
        author: null,
      },
    },
  );

  if (doc.imageFilename) {
    await cloudinary.uploader.destroy(doc.imageFilename);
  }
});

export const User = mongoose.model("User", UserSchema);
