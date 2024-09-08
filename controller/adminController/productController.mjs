import category from "../../model/categoryScehema.mjs";
import Product from "../../model/productSchema.mjs";
import mongoose from "mongoose";

export const addProduct = async (req, res) => {
  try {
    const categories = await category.find({ isActive: true });
    res.render("admin/addProduct", { title: "Add Product", categories });
  } catch (error) {
    console.error("Error fetching categories: ", err);
    res.status(500).send("Internal Server Error");
  }
};

export const addProductPost = async (req, res) => {
  try {
    const {
      product_name,
      category,
      genere,
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
      internet_requirement,
      trailer_link,
    } = req.body;

    const imageUrls = req.files.map((file) => file.path);
    const categoryId = new mongoose.Types.ObjectId(category); // Correct way to convert

    const newProduct = new Product({
      product_name,
      category: categoryId, // Convert to ObjectId if necessary
      genere,
      game_Play_hour,
      release_date,
      developer,
      publisher,
      country_of_orgin,
      discription,
      playable_on,
      PEGI_rating,
      image: imageUrls, // Store the Cloudinary URLs
      price,
      stock,
      discount,
      internet_requirement,
      trailer_link,
    });
    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Server error, could not add product" });
  }
};
