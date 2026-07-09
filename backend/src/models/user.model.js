import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Campground } from "./campground.model.js";
import cloudinary from "../lib/cloudinary.js";
import { Review } from "./review.model.js";

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

//jezeli zmieniam cos w userze (lub wlasnie go tworzymy), ale nie haslo to nie nadpisuj hasla (jak nadpisze to zrobi sie ponowny hash), jak zmieniasz haslo to haszuj je.
//jak tworzymy wlasnie usera to od razu jego haslo zostanie zahaszowane
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const campgrounds = await Campground.find({ author: doc._id });
    for (const campground of campgrounds) {
      for (const image of campground.images || []) {
        if (image.filename) {
          await cloudinary.uploader.destroy(image.filename);
        }
      }
    }
    await Campground.deleteMany({ author: doc._id });
    //nie usuwamy opini usera, tylko dajemy author na null i wtedy we froncie mozemy wyswietlic go jako deleted user
    await Review.updateMany({ author: doc._id }, { $set: { author: null } });
  }
  if (doc.imageFilename) {
    await cloudinary.uploader.destroy(doc.imageFilename);
  }
});

export const User = mongoose.model("User", UserSchema);
