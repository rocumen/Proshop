// import path from "path";
// import express from "express";
// import multer from "multer";

// const router = express.Router();

// const storage = multer.diskStorage({
//   destination(req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename(req, file, cb) {
//     cb(
//       null,
//       `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
//     );
//   },
// });

// function fileFilter(req, file, cb) {
//   const filetypes = /jpe?g|png|webp/;
//   const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = mimetypes.test(file.mimetype);

//   if (extname && mimetype) {
//     cb(null, true);
//   } else {
//     cb(new Error("Images only!"), false);
//   }
// }

// const upload = multer({ storage, fileFilter });
// const uploadSingleImage = upload.single("image");

// router.post("/", (req, res) => {
//   uploadSingleImage(req, res, function (err) {
//     if (err) {
//       return res.status(400).send({ message: err.message });
//     }

//     res.status(200).send({
//       message: "Image uploaded successfully",
//       image: `/${req.file.path}`,
//     });
//   });
// });

// export default router;

import path from "path";
import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";

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
        .end(req.file.buffer);
    });
  } catch (error) {
    res.status(500).send({ message: "Server error" });
  }
});

export default router;
