// Przechowuje pliki tymczasowo w pamięci RAM.
// Dzięki temu możemy wysłać je bezpośrednio do Cloudinary
// bez zapisywania ich na dysku.
import multer from "multer";

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  const error = new Error(
    "Invalid file type. Allowed formats: JPG, PNG, WEBP, HEIC and HEIF.",
  );

  error.statusCode = 400;

  return cb(error, false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
});
