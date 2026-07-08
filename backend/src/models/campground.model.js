import mongoose from "mongoose";
import { Review } from "./review.model.js";

const ImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_800");
});

const CampgroundSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    images: [ImageSchema],
  },
  {
    //dzieki temu do obiektu virtuale tez zostana dodane
    toJSON: {
      virtuals: true,
    },
    timestamps: true,
  },
);

CampgroundSchema.virtual("averageRating").get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;

  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);

  //tofixed zwraca string, dlatego pozniej wszystko jest zamieniane na Number
  //to fixed 1 zaokragla do jednej liczby po ,
  return Number((sum / this.reviews.length).toFixed(1));
});

//do wyswietlenia ilosci review
CampgroundSchema.virtual("reviewCount").get(function () {
  return this.reviews?.length || 0;
});

//do usunięcia reviews po usunieciu campground
//jest comment poniewaz usuwam w kontrolerze campa nie po findoneanddelete, ale poprzez req.campground, ktory przekazuje mi middleware
// CampgroundSchema.post("findOneAndDelete", async function (doc) {
//   if (doc) {
//     await Review.deleteMany({
//       _id: {
//         $in: doc.reviews,
//       },
//     });
//   }
// });

export const Campground = mongoose.model("Campground", CampgroundSchema);
