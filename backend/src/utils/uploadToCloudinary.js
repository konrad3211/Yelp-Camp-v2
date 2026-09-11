import cloudinary from "../lib/cloudinary.js";

export const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "camply",
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        },
      )
      .end(file.buffer);
  });
};
