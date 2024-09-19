import category from "../../model/categoryScehema.mjs";
import Product from "../../model/productSchema.mjs";
import User from "../../model/userSchema.mjs";
import mongoose from "mongoose";
import {v2 as cloudinary} from 'cloudinary'
import {Buffer} from 'buffer'
import { response } from "express";
import { title } from "process";
import Cart from "../../model/cartSchema.mjs";




export const addProduct = async (req, res) => {
  try {
    if(req.session.admin){

    
    const categories = await category.find({ isActive: true });
     // Retrieve flash messages
     const successMessage = req.flash('success');
     const failedMessage = req.flash('failed');
    res.render("admin/addProduct", {
       title: "Add Product",
       successMessage,
       failedMessage,
        categories
       });
    }else{
      res.redirect('/admin/login')
    }
  } catch (error) {
    console.error("Error fetching categories: ", error);
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
      internet_requirement
    } = req.body;

    // Convert Base64 images from the request body
    const imageUrls = [];
    if (req.body.croppedImage1 && req.body.croppedImage2 && req.body.croppedImage3) {
      imageUrls.push(await uploadBase64ImageToCloudinary(req.body.croppedImage1));
      imageUrls.push(await uploadBase64ImageToCloudinary(req.body.croppedImage2));
      imageUrls.push(await uploadBase64ImageToCloudinary(req.body.croppedImage3));
    }
    const category_id = await category.findOne({category});
    console.log("------------",category_id);
    
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
      image: imageUrls,  // Store all uploaded image URLs
      price,
      stock,
      discount,
      internet_requirement: internet_requirement === 'true',
      trailer_link
    });

    await newProduct.save();

    req.flash('success',"Product added successfully")
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    req.flash('failed',"could not add product")
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Server error, could not add product' });
  }
};




//---------------------------------view products-----------------------------------

export const viewProducts = async(req,res)=>{


  try {

    const page = parseInt(req.query.page)||1;
    const limit = parseInt(req.query.limit)||10;


    const skip = (page-1) * limit;

    const totalProducts = await Product.countDocuments();


    const products = await Product.find({}) .populate({
      path: 'category', // Path to the 'category' field in Product schema
      select: 'collectionName' // Select only 'collectionName' from Category
    }).limit(limit).skip(skip)

    //console.log("------",products.category);
    

    const totalPages = Math.ceil(totalProducts/limit)


    res.render('admin/products',{
      title:'Products',
      products,
      totalProducts,
      currentPage:page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page>1,
      limit
    })
    
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching products.");
  }

}



//---------------------------------Edit products-----------------------------------


export const editProduct = async(req,res)=>{
  try {

    const id = req.query.id
   // console.log('------',id);

    const product = await Product.findOne({_id: id}).populate({
      path: 'category', // Path to the 'category' field in Product schema
      select: 'collectionName' // Select only 'collectionName' from Category
    })
    const categories = await category.find({ isActive: true });

    console.log("-------hi-------");
    


    const cat =product.category.collectionName;
    
    

    res.render('admin/editProduct',{title:'Edit product',product:product,categories,cat})
    
  } catch (error) {

     console.error(error);
    res.status(500).send("An error occurred while showing edit product",error);
  }


}


//---------------------------------Edit products put-----------------------------------



export const editProductPut = async(req,res)=>{

  try {

    // console.log(req.body);
    

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
      internet_requirement
    } = req.body;

    console.log("------",categoryId[0]);
    

    const productId = req.params.id;

    const product = await Product.findById(productId);

    if(!product){
      return res.status(404).json({error:'Product not found'})
    }


    // Process removed images (if any)
    const removedImages = Object.keys(req.body)
      .filter(key => key.startsWith('removedImage'))
      .map(key => req.body[key]);

    // Remove the images from the product document
    product.image = product.image.filter(img => !removedImages.includes(img));

     // Convert and process new cropped images if provided
     const imageUrls = [];
     if (req.body.croppedImage1) {
       imageUrls.push(await uploadBase64ImageToCloudinary(req.body.croppedImage1));
     }
     if (req.body.croppedImage2) {
       imageUrls.push(await uploadBase64ImageToCloudinary(req.body.croppedImage2));
     }
     if (req.body.croppedImage3) {
       imageUrls.push(await uploadBase64ImageToCloudinary(req.body.croppedImage3));
     }


      // Add new image URLs to the product (if there are any)
    product.image = product.image.concat(imageUrls);

    // Find the category based on the provided category name or ID
    //const category_id = await category.findOne({ _id: categoryId });


     // Update product fields
     product.product_name = product_name;
     product.category = categoryId[0];
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
     product.internet_requirement = internet_requirement === 'true';
     product.trailer_link = trailer_link;
 
     // Save the updated product
     await product.save();

     req.flash('success', 'Product updated successfully');
     return res.status(200).json({ message: 'Product updated successfully', product });


  
    
  } catch (error) {

    console.error('Error updating product:', error);
    req.flash('failed', 'Could not update product');
    return res.status(500).json({ error: 'Server error, could not update product' });
    
  }

}



//---------------------------------Delete products-----------------------------------



export const deleteProduct = async(req,res)=>{

  try {
    console.log("--------hi-----------");
    

    const {id}  = req.params;

    const product = await Product.findById(id);
    if(!product){
      return res.status(404).json({message:"Product not found"})
    }
    // Toggle the isDelete field
    product.isDelete = !product.isDelete;


     // Save the updated product
     await product.save();

     res.status(200).json({

      message: `Product has been ${product.isDelete ? 'deleted' : 'restored'}`,
      isDelete:product.isDelete

     })
    




  } catch (error) {

    res.status(500).json({ message: "Server error", error });
    
  }

}




export const productView = async(req,res)=>{

  try {

    const productId= req.params.id;
    const product = await Product.findById(productId).populate({
      path: 'category',  // Populate the 'category' field in the Product schema
      select: 'collectionName' // Select only 'collectionName' from Category
    });
    const categories = await category.find({ isActive: true });

    if (!product || product.isDelete) {
      return res.status(404).json({ message: 'Product not found or deleted' });
    }
    console.log("hiiiiii",product);

    // res.status(200).json(product);
    let discountPrice = Math.ceil(product.price - (product.price * product.discount/100))
    console.log(discountPrice);
    
    
    res.render('user/productView',
      {
        title:'Game Nation',
        product,
        categories,
        discountPrice,
        user:req.session.user
      }
      
    )
    
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Server error' });
  }

}



export const allProducts = async (req, res) => {
  try {
    
    const products = await Product.find({ isDelete: false }) // Fetch all non-deleted products
      .populate({
        path: 'category',  
        select: 'collectionName'
      });
    
    // Fetch all active categories
    const categories = await category.find({ isActive: true });

    // Render the 'allProducts' page with the products, categories, and user session
    res.render('user/allProducts', {
      title: 'All Products',
      products,
      categories,
      user: req.session.user
    });

  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};






export const cart = async(req,res)=>{
  console.log("--- hi cart");
  
  try {
    if(req.session.user){

      const email = req.session.user;
  
      const user = await User.findOne({email})
      
  
      
      const cart = await Cart.findOne({userId:user._id}).populate('items.productId');

      console.log("cart---",cart);
      
      
      
      const categories = await category.find({ isActive: true });




      if(!cart || cart.items.length === 0){

      return res.render('user/cart',{
          title:'Cart',
          categories,
          user:req.session.user,
          cartItems:[],
          totalPayable:0

        })
      }

      const cartItems = cart.items.map((item)=>{
        const product = item.productId;
        const discountPercentage = product.discount || 0;
        const discountedPrice = product.price * (1 - discountPercentage/100);
        const totalItemPrice = discountedPrice * item.productCount;

        return {
          ...item._doc,
          productName : product.product_name,
          productImage: product.image[0],
          productPrice: product.price,
          discountedPrice,
          totalItemPrice
        };
      });

      const totalPayable = cartItems.reduce((acc,item)=> acc + item.totalItemPrice,0);

      console.log(totalPayable);
      

      res.render('user/cart',{
        title: 'Cart',
        categories,
        user:req.session.user,
        cartItems,
        totalPayable
      })
  
    }else{
      res.redirect('/login')
    }

    
  } catch (error) {

    console.log(`error while rendering ${error}`);
    
    
  }
}




export const addToCart = async(req,res)=>{
  try {

    if(req.session.user){

      const email = req.session.user;

      const user = await User.findOne({email:email});

      if(!user){
        return res.status(404).json({message:'User not found'})
      }


      const {productId,productCount} = req.body;

      const product = await Product.findById(productId)

      if(!product){
        return res.status(404).json({message:"Product not found"});
      }

      
      if (product.stock < productCount) {
        return res.status(400).json({ message: `Insufficient stock. Only ${product.stock} items available.` });
    }


    const discountPercentage = product.discount || 0;
    const discountedPrice = product.price * (1-discountPercentage/100)

      let cart = await Cart.findOne({userId:user._id});

      if(!cart){
        cart = new Cart(
          {
            userId:user._id,
            items:[],
            totalPrice:0,
            payableAmount:0
          }
        )
      }

      const existingItemIndex = cart.items.findIndex(item=>item.productId.toString()===productId);

      if(existingItemIndex > -1){
        const newProductCount = cart.items[existingItemIndex].productCount + productCount;


        if (newProductCount > product.stock) {
          return res.status(400).json({ message: `Not enough stock. Only ${product.stock} items available.` });
        }

        cart.items[existingItemIndex].productCount = newProductCount;
        cart.items[existingItemIndex].productPrice = discountedPrice * newProductCount;
      }else{

        //Add new item to the cart

        cart.items.push({
          productId,
          productCount,
          productPrice: discountedPrice * productCount
        })

      }

      // Update total price and payable amount
      cart.totalPrice = cart.items.reduce((acc, item) => acc + item.productPrice, 0);
      cart.payableAmount = cart.totalPrice;

      product.stock -= productCount;
      await product.save();


      // Save the cart
      await cart.save();

      return res.status(200).json({ message: "Product added to cart successfully", cart });


    }else{
      res.redirect('/login')

    }
    
  } catch (error) {

    console.error(error);
    return res.status(500).json({ message: "An error occurred while adding the product to the cart" });

    
  }
}