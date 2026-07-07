import { Campground } from "../models/campground.model.js";

export const isAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const campground = await Campground.findById(id);

    if (!campground) {
      return res.status(404).json({ message: "Campground not found" });
    }

    if (!campground.author.equals(userId)) {
      return res.status(403).json({
        message: "You are not the author",
      });
    }

    // Możemy przekazać campground dalej,
    // żeby kontroler nie musiał drugi raz pobierać go z bazy.
    req.campground = campground;

    next();
  } catch (error) {
    next(error);
  }
};
