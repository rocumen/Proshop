/*
import path from "path";
import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import sharp from "sharp";

const router = express.Router();

cloudinary.config({
  cloud_name: "dg60equpb",
  api_key: "319573981594488",
  api_secret: "V7Xy4ZbUcN2wJAspX-l4d6KhIA0",
});

const storage = multer.memoryStorage(); // Use memory storage since Cloudinary requires a buffer or stream

function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Images only!"), false);
  }
}

const upload = multer({ storage, fileFilter });
const uploadSingleImage = upload.single("image");

router.post("/", async (req, res) => {
  try {
    uploadSingleImage(req, res, async function (err) {
      if (err) {
        return res.status(400).send({ message: err.message });
      }

      // Use sharp to resize the image
      const resizedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 451, height: 359 }) // Set your desired width and height
        .toBuffer();

      // Upload the resized image to Cloudinary
      const result = await cloudinary.v2.uploader
        .upload_stream({ resource_type: "image" }, async (error, result) => {
          if (error) {
            return res.status(400).send({ message: error.message });
          }

          res.status(200).send({
            message: "Image uploaded successfully",
            imageUrl: result.secure_url,
          });
        })
        .end(resizedImageBuffer);
    });
  } catch (error) {
    res.status(500).send({ message: "Server error" });
  }
});


*/

import path from "path";
import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import sharp from "sharp";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();

// console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
// console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
  cloud_name: "dg60equpb",
  api_key: "319573981594488",
  api_secret: "V7Xy4ZbUcN2wJAspX-l4d6KhIA0",
});

const storage = multer.memoryStorage(); // Use memory storage since Cloudinary requires a buffer or stream

function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Images only!"), false);
  }
}

const upload = multer({ storage, fileFilter });
const uploadMultipleImages = upload.array("images", 10); // "images" is the field name for multiple images, and 10 is the maximum number of files

router.post("/upload", async (req, res) => {
  try {
    uploadMultipleImages(req, res, async function (err) {
      if (err) {
        return res.status(400).send({ message: err.message });
      }

      const uploadPromises = req.files.map(async (file) => {
        // Remove the resizing part from Sharp
        const resizedImageBuffer = file.buffer;

        // Upload the image to Cloudinary without resizing
        return new Promise((resolve, reject) => {
          cloudinary.v2.uploader
            .upload_stream({ resource_type: "image" }, (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  url: result.secure_url,
                  id: result.public_id,
                });
              }
            })
            .end(resizedImageBuffer);
        });
      });

      // Wait for all uploads to complete
      const uploadedImageUrls = await Promise.all(uploadPromises);

      res.status(200).send({
        message: "Images uploaded successfully",
        imageUrls: uploadedImageUrls,
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

export default router;
