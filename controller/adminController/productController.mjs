import category from "../../model/categoryScehema.mjs";
import Product from "../../model/productSchema.mjs";
import mongoose from "mongoose";
import {v2 as cloudinary} from 'cloudinary'
import {Buffer} from 'buffer'
import { response } from "express";
import { title } from "process";




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
// C:\Users\91628\Desktop\GameNation\views\user\productView.ejs