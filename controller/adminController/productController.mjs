import category from "../../model/categoryScehema.mjs";
import Product from "../../model/productSchema.mjs";
import User from "../../model/userSchema.mjs";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { Buffer } from "buffer";
import { response } from "express";
import { title } from "process";
import Cart from "../../model/cartSchema.mjs";
import HTTP_STATUS from "../../constants/statusCodes.mjs";

//----------------------------add product page -------------------------------------

export const addProduct = async (req, res) => {
  try {
    
      const categories = await category.find({ isActive: true });
      // Retrieve flash messages
      const successMessage = req.flash("success");
      const failedMessage = req.flash("failed");
      res.render("admin/addProduct", {
        title: "Add Product",
        successMessage,
        failedMessage,
        categories,
      });
   
  } catch (error) {
    console.error("Error fetching categories: ", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

//----------------------------Helper function to upload Base64 image to Cloudinary-------------------------------------

const uploadBase64ImageToCloudinary = async (base64Data) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      base64Data,
      { folder: "products" }, // Specify folder if needed
      (error, result) => {
        if (error) return reject(error);
        return resolve(result.secure_url);
      }
    );
  });
};

//----------------------------add product post-------------------------------------

export const addProductPost = async (req, res) => {
  try {
    const {
      product_name,
      categoryId,
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
      internet_requirement,
    } = req.body;

    // Convert Base64 images from the request body
    const imageUrls = [];
    if (
      req.body.croppedImage1 &&
      req.body.croppedImage2 &&
      req.body.croppedImage3
    ) {
      imageUrls.push(
        await uploadBase64ImageToCloudinary(req.body.croppedImage1)
      );
      imageUrls.push(
        await uploadBase64ImageToCloudinary(req.body.croppedImage2)
      );
      imageUrls.push(
        await uploadBase64ImageToCloudinary(req.body.croppedImage3)
      );
    }
    const category_id = await category.findOne({ category });

    const newProduct = new Product({
      product_name,
      category: category_id,
      genre,
      game_Play_hour,
      release_date,
      developer,
      publisher,
      country_of_orgin,
      discription,
      playable_on,
      PEGI_rating,
      image: imageUrls, // Store all uploaded image URLs
      price,
      stock,
      discount,
      internet_requirement: internet_requirement === "true",
      trailer_link,
    });

    await newProduct.save();

    req.flash("success", "Product added successfully");
    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    req.flash("failed", "could not add product");
    console.error("Error adding product:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Server error, could not add product" });
  }
};

//---------------------------------view products-----------------------------------

export const viewProducts = async (req, res) => {
  try {
    const searchQuery = req.query.search || "";

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const searchFilter = {
      $or: [
        { product_name: { $regex: searchQuery, $options: "i" } },
        { publisher: { $regex: searchQuery, $options: "i" } },
      ],
    };

    const products = await Product.find(searchFilter)
      .populate({
        path: "category", // Path to the 'category' field in Product schema
        select: "collectionName", // Select only 'collectionName' from Category
      })
      .limit(limit)
      .skip(skip);

    const totalProducts = await Product.countDocuments(searchFilter);

    const totalPages = Math.ceil(totalProducts / limit);

    res.render("admin/products", {
      title: "Products",
      products,
      totalProducts,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      limit,
      searchQuery,
    });
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("An error occurred while fetching products.");
  }
};

//---------------------------------Edit products-----------------------------------

export const editProduct = async (req, res) => {
  try {
    const id = req.query.id;

    const product = await Product.findOne({ _id: id }).populate({
      path: "category", // Path to the 'category' field in Product schema
      select: "collectionName", // Select only 'collectionName' from Category
    });
    const categories = await category.find({ isActive: true });

    const cat = product.category;

    res.render("admin/editProduct", {
      title: "Edit product",
      product: product,
      categories,
      cat,
    });
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("An error occurred while showing edit product", error);
  }
};

//---------------------------------Edit products put-----------------------------------
export const editProductPut = async (req, res) => {
  try {
    const {
      product_name,
      categoryId,
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
      internet_requirement,
    } = req.body;

    const productId = req.params.id;

    // Ensure categoryId is converted to ObjectId
    const categoryObjectId = mongoose.Types.ObjectId.isValid(categoryId)
      ? new mongoose.Types.ObjectId(categoryId)
      : null;

    if (!categoryObjectId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid category ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Product not found" });
    }

    // Handle images: always expect 3 images (base64 or URL)
    const imageFields = [req.body.croppedImage1, req.body.croppedImage2, req.body.croppedImage3];
    const imageUrls = [];
    for (const img of imageFields) {
      if (img && img.startsWith("data:image/")) {
        // Upload base64 to Cloudinary
        const url = await uploadBase64ImageToCloudinary(img);
        imageUrls.push(url);
      } else if (img && (img.startsWith("http://") || img.startsWith("https://"))) {
        // Already a URL
        imageUrls.push(img);
      }
    }
    if (imageUrls.length !== 3) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Exactly 3 images are required." });
    }
    product.image = imageUrls;

    // Update product fields
    product.product_name = product_name;
    product.category = categoryObjectId;
    product.genre = genre;
    product.game_Play_hour = game_Play_hour;
    product.release_date = release_date;
    product.developer = developer;
    product.publisher = publisher;
    product.country_of_orgin = country_of_orgin;
    product.discription = discription;
    product.playable_on = playable_on;
    product.PEGI_rating = PEGI_rating;
    product.price = price;
    product.stock = stock;
    product.discount = discount;
    product.internet_requirement = internet_requirement === "true";
    product.trailer_link = trailer_link;

    // Save the updated product
    await product.save();

    req.flash("success", "Product updated successfully");
    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Error updating product:", error);
    req.flash("failed", "Could not update product");
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Server error, could not update product" });
  }
};
//---------------------------------Delete products-----------------------------------

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Product not found" });
    }
    // Toggle the isDelete field
    product.isDelete = !product.isDelete;

    // Save the updated product
    await product.save();

    res.status(HTTP_STATUS.OK).json({
      message: `Product has been ${product.isDelete ? "deleted" : "restored"}`,
      isDelete: product.isDelete,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
  }
};

//----------------------------product view -------------------------------------

export const productView = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).populate({
      path: "category", // Populate the 'category' field in the Product schema
      select: "collectionName", // Select only 'collectionName' from Category
    });
    const categories = await category.find({ isActive: true });

    if (!product || product.isDelete) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Product not found or deleted" });
    }

    let discountPrice = Math.ceil(
      product.price - (product.price * product.discount) / 100
    );

    res.render("user/productView", {
      title: "Game Nation",
      product,
      categories,
      discountPrice,
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
};

//----------------------------all products view -------------------------------------

export const allProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Base filter: Non-deleted products
    let matchStage = { isDelete: false };

    // Add search query if present
    let returnQuery
    if (req.query.query) {
      const searchQuery = req.query.query.trim();
      returnQuery = searchQuery
      matchStage.product_name = { $regex: searchQuery, $options: "i" }; // Case-insensitive regex search
    }

    // Apply category filter if selected
    if (req.query.category) {
      matchStage.category = new mongoose.Types.ObjectId(req.query.category);
    }

    // Build the aggregation pipeline
    const pipeline = [
      { $match: matchStage }, // Apply the match stage to filter products
      {
        $addFields: {
          discountPrice: {
            $ceil: {
              $subtract: [
                "$price",
                { $multiply: ["$price", { $divide: ["$discount", 100] }] },
              ],
            },
          },
        },
      },
    ];

    // Apply price range filter if selected
    if (req.query.minPrice && req.query.maxPrice) {
      const minPrice = parseInt(req.query.minPrice);
      const maxPrice = parseInt(req.query.maxPrice);

      pipeline.push({
        $match: {
          discountPrice: { $gte: minPrice, $lte: maxPrice },
        },
      });
    }

    // Apply sorting based on query parameter
    if (req.query.sort) {
      let sortStage;
      switch (req.query.sort) {
        case "lowToHigh":
          sortStage = { discountPrice: 1 }; // Ascending price
          break;
        case "highToLow":
          sortStage = { discountPrice: -1 }; // Descending price
          break;
        case "aToZ":
          sortStage = { product_name: 1 }; // Alphabetical A-Z
          break;
        case "zToA":
          sortStage = { product_name: -1 }; // Alphabetical Z-A
          break;
        default:
          sortStage = { createdAt: -1 }; // Default: Newest first
      }
      pipeline.push({ $sort: sortStage });
    } else {
      // Default sorting (e.g., newest products first)
      pipeline.push({ $sort: { _id: -1 } });
    }

    // Join with category collection to get category name
    pipeline.push(
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" }, // Flatten the category array
      {
        $project: {
          product_name: 1,
          price: 1,
          discountPrice: 1,
          stock: 1,
          image: 1,
          category: "$category.collectionName",
        },
      },
      { $skip: skip },
      { $limit: limit }
    );

    // Execute the aggregation pipeline
    const products = await Product.aggregate(pipeline);

    // Calculate total number of products for pagination
    const totalProducts = await Product.countDocuments(matchStage);
    const totalPages = Math.ceil(totalProducts / limit);

    // Fetch all active categories
    const categories = await category.find({ isActive: true });

    // Render the view
    res.render("user/allProducts", {
      title: "All Products",
      products,
      categories,
      user: req.session.user,
      currentPage: page,
      totalPages,
      returnQuery,
      category: req.query.category || "",
      minPrice: req.query.minPrice || "",
      maxPrice: req.query.maxPrice || "",
      query: req.query.query || "", // Preserve search query for sorting
      sort: req.query.sort || "", // Preserve sort selection
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
};

//----------------------------cart -------------------------------------

export const cart = async (req, res) => {
  try {
    
      const email = req.session.user;

      const user = await User.findOne({ email });

      const cart = await Cart.findOne({ userId: user._id }).populate(
        "items.productId"
      );

      const categories = await category.find({ isActive: true });

      if (!cart || cart.items.length === 0) {
        return res.render("user/cart", {
          title: "Cart",
          categories,
          user: req.session.user,
          cartItems: [],
          totalPayable: 0,
        });
      }

      const cartItems = cart.items.map((item) => {
        const product = item.productId;
        const discountPercentage = product.discount || 0;
        const discountedPrice = product.price * (1 - discountPercentage / 100);
        const totalItemPrice = discountedPrice * item.productCount;

        return {
          ...item._doc,
          productName: product.product_name,
          productImage: product.image[0],
          productPrice: product.price,
          discountedPrice,
          totalItemPrice,
        };
      });

      const totalPayable = cartItems.reduce(
        (acc, item) => acc + item.totalItemPrice,
        0
      );

      console.log(totalPayable);

      res.render("user/cart", {
        title: "Cart",
        categories,
        user: req.session.user,
        cartItems,
        totalPayable,
      });
    
  } catch (error) {
    console.log(`error while rendering ${error}`);
  }
};

//----------------------------add to cart-------------------------------------

export const addToCart = async (req, res) => {
  try {
   
      const email = req.session.user;

      const user = await User.findOne({ email: email });

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "User not found please login" });
      }

      const { productId, productCount } = req.body;

      const product = await Product.findById(productId);

      let cart = await Cart.findOne({ userId: user._id });

     
      if (!cart) {
        cart = new Cart({
          userId: user._id,
          items: [],
          totalPrice: 0,
          payableAmount: 0,
        });
      }
      
      if(cart.items.length > 4){
        return res.status(HTTP_STATUS.BAD_REQUEST).json({message: "Your cart is full"})
      }
      

      if (!product) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Product not found" });
      }

      if (product.isDelete) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Product is not available" });
      }

      if (product.stock < productCount) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: `Insufficient stock. Only ${product.stock} items available.`,
        });
      }

      const discountPercentage = product.discount || 0;
      const discountedPrice = product.price * (1 - discountPercentage / 100);


      

      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (existingItemIndex > -1) {
        const newProductCount =
          cart.items[existingItemIndex].productCount + productCount;

        if (newProductCount > product.stock) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            message: `Not enough stock. Only ${product.stock} items available.`,
          });
        }

        cart.items[existingItemIndex].productCount = newProductCount;
        cart.items[existingItemIndex].productPrice =
          discountedPrice * newProductCount;
      } else {
        //Add new item to the cart

        cart.items.push({
          productId,
          productCount,
          productPrice: discountedPrice * productCount,
        });
      }

      // Update total price and payable amount
      cart.totalPrice = cart.items.reduce(
        (acc, item) => acc + item.productPrice,
        0
      );
      cart.payableAmount = cart.totalPrice;

      // product.stock -= productCount;
      // await product.save();

      // Save the cart
      await cart.save();

      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "Product added to cart successfully", cart });
    
    
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred while adding the product to the cart",
    });
  }
};


//----------------------------Remove cart item -------------------------------------

export const removeProductFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    
      

      const email = req.session.user;

      const user = await User.findOne({ email });
      const userId = user._id;
      const userCart = await Cart.findOne({ userId: userId });

      userCart.items = userCart.items.filter(
        (item) => item.productId.toString() !== productId
      );

      userCart.totalPrice = userCart.items.reduce(
        (total, item) => total + item.productCount * item.productPrice,
        0
      );
      userCart.payableAmount = userCart.totalPrice; // If there are no discounts or taxes

      await userCart.save();

      res.status(HTTP_STATUS.OK).json({
        message: "Item remove successfully",
        totalPayable: userCart.totalPrice,
      });
    
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Error removing item from cart" });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    
      const { productId, action } = req.body;
      const email = req.session.user;
      const user = await User.findOne({ email });
      const userId = user._id;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Product not found" });
      }

      const cart = await Cart.findOne({ userId }).populate("items.productId");

      if (!cart) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "cart not found" });
      }

      const cartItem = cart.items.find(
        (item) => item.productId._id.toString() === productId
      );

      if (!cartItem) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "product not found" });
      }
     

      if (action === "increment") {
        if (cartItem.productCount >= cartItem.productId.stock) {
          return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ message: "Not enough stock available" });
        }

        if(cartItem.productCount > 4){
          return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({message:"You can purchase only 5 quantity"})
        }
        cartItem.productCount += 1;
        // product.stock -= 1;
        // await product.save();
      } else if (action === "decrement") {
        if (cartItem.productCount === 1) {
          return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ message: "Cannot reduce quantity below 1" });
        }

        cartItem.productCount -= 1;
        // product.stock +=1;
        // await product.save();
      }

      const discount = cartItem.productId.discount || 0;
      const discountedPrice = cartItem.productId.price * (1 - discount / 100);
      cartItem.productPrice = discountedPrice * cartItem.productCount;

      cart.totalPrice = cart.items.reduce(
        (acc, item) => acc + item.productPrice,
        0
      );
      cart.payableAmount = cart.totalPrice;

      await cart.save();

      res.status(HTTP_STATUS.OK).json({
        message: "cart updated successfully",
        productCount: cartItem.productCount,
        productPrice: cartItem.productPrice,
        totalPayable: cart.totalPrice,
      });
    
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
};

//----------------------------product search-------------------------------------

export const searchProducts = async (req, res) => {
  try {
    const query = req.query.query?.trim();

    const searchCriteria = {
      $or: [
        { product_name: { $regex: query, $options: "i" } }, // Case-insensitive search for product name
        { genre: { $regex: query, $options: "i" } }, // Case-insensitive search for genre
        { developer: { $regex: query, $options: "i" } }, // Search by developer
        { publisher: { $regex: query, $options: "i" } }, // Search by publisher
        { country_of_orgin: { $regex: query, $options: "i" } }, // Search by country of origin
      ],
      isDelete: false, // Ensure not deleted
    };

    const products = await Product.find(searchCriteria).lean();

    const productsWithDiscount = products.map((product) => {
      const discountPrice = Math.ceil(
        product.price - (product.price * product.discount) / 100
      );
      return { ...product, discountPrice }; // Safely append discountPrice without modifying the original object
    });

    res.json({ products: productsWithDiscount });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Error searching products" });
  }
};


//----------------------------all product section sort-------------------------------------

export const allProductsSort = async (req, res) => {
  try {
    const { sort } = req.query;

    let sortOption = {};

    if (sort === "lowToHigh") {
      sortOption = { price: 1 };
    } else if (sort === "highToLow") {
      sortOption = { price: -1 };
    } else if (sort === "aToZ") {
      sortOption = { product_name: 1 };
    } else if (sort === "zToA") {
      sortOption = { product_name: -1 };
    }

    const products = await Product.find().sort(sortOption).lean();

    const productsWithDiscount = products.map((product) => {
      const discountPrice = Math.ceil(
        product.price - (product.price * product.discount) / 100
      );
      return { ...product, discountPrice }; // Safely append discountPrice without modifying the original object
    });

    res.json({ products: productsWithDiscount });
  } catch (error) {
    console.error("Error fetching sorted products:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch products." });
  }
};

export const allProductsFilter = async (req, res) => {};





