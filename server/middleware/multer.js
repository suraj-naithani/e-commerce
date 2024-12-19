import multer from "multer";

const multerUpload = multer({
  limits: { fileSize: 1024 * 1024 * 10 },
});

const image = multerUpload.single("image");

export { image };

export function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .send({ success: false, message: "File size exceeds the 10MB limit." });
    }
    return res.status(500).send("An error occurred while uploading the file.");
  }
  next(err);
}
