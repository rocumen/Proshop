import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";
import cloudinary from "cloudinary";

// @desc Fetch all products
// @route GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = process.env.PAGINATION_LIMIT;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: "i" } }
    : {};

  const count = await Product.countDocuments({ ...keyword });

  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc Fetch a products
// @route GET /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    return res.json(product);
  } else {
    res.status(404);
    throw new Error("Resource not found");
  }
});

// @desc Create a Product
// @route POST /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: "Sample name",
    price: 0,
    user: req.user._id,
    image: undefined,
    brand: "Sample Brand",
    category: "Sample Category",
    variant: "",
    countInStock: 0,
    numReviews: 0,
    description: "Sample Description",
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc Update a Product
// @route PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    brand,
    category,
    variant,
    countInStock,
  } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    // Update other fields
    product.name = name;
    product.price = price;
    product.description = description;
    product.brand = brand;
    product.countInStock = countInStock;

    // Update the image array
    if (image && Array.isArray(image)) {
      // Concatenate new images to the existing array
      product.image = product.image.concat(image);
    } else {
      // Handle other cases if needed
      product.image = image;
    }

    // checks if the category is already existing in the database
    if (product.category === category) {
      throw new Error("Category already exist");
    } else {
      product.category = category;
    }

    // adds variant in the array
    if (variant && Array.isArray(variant)) {
      // Filter out duplicates before concatenating
      product.variant = [...new Set([...product.variant, ...variant])];
    } else {
      // product.variant = variant;
      product.variant = [];
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Resource not found");
  }
});

// @desc Delete a Product
// @route DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product.id });
    res.status(200).json({ message: "Product Deleted" });
  } else {
    res.status(404);
    throw new Error("Resource not found");
  }
});

// @desc Create a new review
// @route POST /api/products/:id/reviews
// @access Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, review) => acc + review.rating, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Resource not found");
  }
});

// @desc GET top rated products
// @route GET /api/products/top
// @access Public

const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);

  res.status(200).json(products);
});

// @desc Delete Single/Multiple Product Image
// @route PUT /api/products/update
// @access Private/Admin
// const deleteProductImage = asyncHandler(async (req, res) => {
//   try {
//     const product = await Product.findById(req.query.productId);

//     const { imageIndex } = req.body;
//     console.log(imageIndex);

//     const imageIndexToDelete = imageIndex.split("/").map(Number);

//     imageIndexToDelete.forEach((index) => {
//       const image = product.image.indexOf(index);

//       // // Remove the imageUrlToDelete from the product's images array
//       product.image.splice(image, 1);
//     });

//     // Save the updated product
//     await product.save();

//     res.status(200).json({ message: "Image deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

const deleteProductImage = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.query.productId);

    const { imageIndex } = req.body;
    console.log(imageIndex);

    const imageIndexToDelete = imageIndex.split("/").map(Number);

    // Loop through the indices to delete from Cloudinary
    for (const index of imageIndexToDelete) {
      const publicIdToDelete = product.image[index]; // Assuming product.image stores Cloudinary public_ids

      // Delete the image from Cloudinary
      const cloudinaryResult = await cloudinary.uploader.destroy(
        publicIdToDelete
      );

      // Check Cloudinary result and handle accordingly
      if (cloudinaryResult.result === "ok") {
        console.log(
          `Image with public_id ${publicIdToDelete} deleted from Cloudinary.`
        );
      } else {
        console.error(
          `Failed to delete image with public_id ${publicIdToDelete} from Cloudinary. Error: ${cloudinaryResult.error}`
        );
      }

      // Remove the imageUrlToDelete from the product's images array
      product.image.splice(index, 1);
    }

    // Save the updated product
    await product.save();

    res.status(200).json({ message: "Image(s) deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// const deleteProductImagesFromCloudinary = async (publicIds) => {
//   try {
//     return await cloudinary.api.delete_resources(publicIds, {
//       type: "upload",
//       resource_type: "image",
//     });
//   } catch (error) {
//     throw new Error("Delete img from Cloudinary failed");
//   }
// };

// @desc Get Specific Product by Category
// @route GET /api/products/update
// @access Public

const filterByCategory = asyncHandler(async (req, res) => {
  const products = await Product.find({
    category: { $regex: new RegExp(req.body.category, "i") },
  });

  //.sort({ name: -1 });
  res.json(products);
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  deleteProductImage,
  filterByCategory,
};
