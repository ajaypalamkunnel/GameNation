import category from "../../model/categoryScehema.mjs";
import Product from "../../model/productSchema.mjs";
import mongoose from "mongoose";
import {v2 as cloudinary} from 'cloudinary'
import {Buffer} from 'buffer'




export const addProduct = async (req, res) => {
  try {
    const categories = await category.find({ isActive: true });
    res.render("admin/addProduct", { title: "Add Product", categories });
  } catch (error) {
    console.error("Error fetching categories: ", err);
    res.status(500).send("Internal Server Error");
  }
};

// Helper function to upload Base64 image to Cloudinary
const uploadBase64ImageToCloudinary = async (base64Data) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      base64Data,
      { folder: 'products' },  // Specify folder if needed
      (error, result) => {
        if (error) return reject(error);
        return resolve(result.secure_url);
      }
    );
  });
};

export const addProductPost = async (req, res) => {
  try {
    const {
      product_name,
      category,
      genre,
      game_Play_hour,
      release_date,
      developer,
      publisher,
      country_of_orgin,
      discription,
      playable_on,
      PEGI_rating,
      price,
      stock,
      discount,
      trailer_link,
      internet_requirement
    } = req.body;

    // Convert Base64 images from the request body
    const imageUrls = [];
    if (req.body.croppedImage1 && req.body.croppedImage2 && req.body.croppedImage3) {
      imageUrls.push(await uploadBase64ImageToCloudinary(req.body.croppedImage1));
      imageUrls.push(await uploadBase64ImageToCloudinary(req.body.croppedImage2));
      imageUrls.push(await uploadBase64ImageToCloudinary(req.body.croppedImage3));
    }

    const newProduct = new Product({
      product_name,
      category: new mongoose.Types.ObjectId(category),
      genre,
      game_Play_hour,
      release_date,
      developer,
      publisher,
      country_of_orgin,
      discription,
      playable_on,
      PEGI_rating,
      image: imageUrls,  // Store all uploaded image URLs
      price,
      stock,
      discount,
      internet_requirement: internet_requirement === 'true',
      trailer_link
    });

    await newProduct.save();

    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Server error, could not add product' });
  }
};