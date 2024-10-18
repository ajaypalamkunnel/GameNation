import { response } from "express";
import category from "../../model/categoryScehema.mjs";
import Product from "../../model/productSchema.mjs";
import User from "../../model/userSchema.mjs";
import WishList from "../../model/wishListSchema.mjs";

import Wallet from "../../model/walletSchema.mjs";



//---------------------------- user Home rendering -------------------------------------

export const home = async (req, res) => {
  try {
    const categories = await category.find({ isActive: true });
    const products = await Product.find({ isDelete: false });

    //      console.log(products);
    products.forEach((product) => {
      const discountPrice = Math.ceil(
        product.price - (product.price * product.discount) / 100
      );
      product.discountPrice = discountPrice; // Append discountPrice to product
    });

    res.render("user/home", {
      title: "Home",
      user: req.session.user,
      categories,
      products,
      user: req.session.user,
    });
  } catch (error) {
    console.log(`error while rendering user home page ${error}`);
  }
};


//---------------------------- user profile -------------------------------------


export const userProfile = async (req, res) => {
  if (req.session.user) {
    const email = req.session.user;

    const userProfile = await User.findOne({ email });

    const categories = await category.find({ isActive: true });
    res.render("user/userProfile", {
      title: "Profile",
      categories,
      userProfile,
      user: req.session.user,
    });
  } else {
    res.redirect("/login");
  }
};


//---------------------------- user view -------------------------------------



export const addressView = async (req, res) => {
  try {
    if (req.session.user) {
      const email = req.session.user;
      const user = await User.findOne({ email }).populate("address");
      const categories = await category.find({ isActive: true });
      res.render("user/address", {
        title: "Address",
        user: req.session.user,
        categories,
        addresses: user.address,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(`error while rendering address view ${error}`);
  }
};


//---------------------------- add new address form rendring -------------------------------------


export const addNewAddress = async (req, res) => {
  try {
    if (req.session.user) {
      const categories = await category.find({ isActive: true });

      res.render("user/addAddress", {
        title: "Add Address",
        user: req.session.user,
        categories,
        successMessage: req.flash("success"),
        errorMessage: req.flash("error"),
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(`error while rendering address view ${error}`);
  }
};


//---------------------------- add new address form post -------------------------------------


export const addNewAddressPost = async (req, res) => {
  
  try {
    if (req.session.user) {
      const {
        contactName,
        phonenumber,
        building,
        pincode,
        city,
        district,
        state,
        country,
        landmark,
      } = req.body;
      const email = req.session.user;

      const user = await User.findOne({ email });

      if (!user) {
        console.log("user not found");

        req.flash("error", "User not found");
        return res.redirect("/address");
      }

      const newAddress = {
        contactName,
        phonenumber,
        building,
        pincode,
        city,
        district,
        state,
        country,
        landmark,
      };

      user.address.push(newAddress);
      await user.save();
      req.flash("success", "New address added successfully");
      res.redirect("/address");
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error adding new address:", error);
    req.flash("error", "An error occurred while adding the address.");
    res.redirect("/address");
  }
};


//---------------------------- edit form rendering  -------------------------------------



export const editAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    console.log("Address ID:", addressId);

    if (req.session.user) {
      const email = req.session.user;

      // Properly await the user fetching process
      const user = await User.findOne({ email });

      if (user) {
        // Ensure that user has an address array before accessing it
        if (user.address && user.address.length > 0) {
          // Use the `.id()` method to find the subdocument by its _id
          const address = user.address.id(addressId);

          if (!address) {
            req.flash("error", "Address not found");
            return res.redirect("/address");
          } else {
            const categories = await category.find({ isActive: true });

            // Render the edit address page with the address and other details
            res.render("user/editAddress", {
              title: "Edit Address",
              address,
              user: req.session.user,
              categories,
            });
          }
        } else {
          req.flash("error", "No addresses found for this user.");
          return res.redirect("/address");
        }
      } else {
        req.flash("error", "User not found");
        return res.redirect("/address");
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error rendering edit form:", error);
    req.flash("error", "An error occurred while loading the edit form.");
    res.redirect("/address");
  }
};

//---------------------------- edit address form put -------------------------------------


export const editAddressPut = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const {
      contactName,
      phonenumber,
      building,
      pincode,
      city,
      district,
      state,
      country,
      landmark,
    } = req.body;

    const user = await User.findOne({ "address._id": addressId });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User or Address not found" });
    }

    const address = user.address.id(addressId);

    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    address.contactName = contactName;
    address.phonenumber = phonenumber;
    address.building = building;
    address.pincode = pincode;
    address.city = city;
    address.district = district;
    address.state = state;
    address.country = country;
    address.landmark = landmark;

    await user.save();

    return res.json({ success: true, message: "Address updated successfully" });
  } catch (error) {
    console.error("Error updating address:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;

    const user = await User.findOne({ "address._id": addressId });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.address.pull({ _id: addressId });

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};






export const filterDataFetch = async (req, res) => {
  const categories = await category.find({ isActive: true });

  res.json({
    categories,
  });
};



export const wishList = async(req,res)=>{

  try {

    const categories = await category.find({ isActive: true });

    const user = req.session.user;

    let wishList = await WishList.findOne({userId:user})
    .populate({
      path:'products.productId',
      model:Product,
      select:'product_name price discount image stock'
    })
    //console.log("----",wishList.products);

    if (!wishList) {
      wishList = { products: [] }; // Initialize an empty wishlist if it doesn't exist
    }
    
    res.render('user/wishList',{
      categories,
      user:req.session.user,
      title:'WishList',
      wishList


    })
    
  } catch (error) {
    console.log("Error while rendering wishList",error);
    
  }

}

export const addWisList = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.session.user;

    if(!userId){
      return res.json({
        status:'error',
        message:'user not found please login'

      })
    }

    let wishList = await WishList.findOne({ userId });

    if (!wishList) {
      wishList = new WishList({
        userId,
        products: [{ productId }],
      });
    } else {

      const productExists = wishList.products.some(
        (product) => product.productId.toString() === productId
      );
      console.log(productExists);
      
     
      if (productExists) {
        return res.json({
          status: 'alreadyIn',
          message: "Product is already in your wishlist",
        });
      }
      wishList.products.push({ productId });
    }

    await wishList.save();

    return res.json({
      status: "success",
      message: "Product added to wishlist successfully",
    });
  } catch (error) {
    console.error("Error while adding to wishlist:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to add product to wishlist",
    });
  }
};

export const removeWishList = async(req,res)=>{
  try {
    
    const {productId} = req.body;
    const userId = req.session.user;
  
  
    let wishList = await WishList.findOne({userId});
  
    if(wishList){
      wishList.products = wishList.products.filter(
        (item)=>item.productId.toString() !== productId
      )
      await wishList.save()
      return res.status(200).json({status:'success',message:'Product removed from wishlist'})
    }else{
      res.status(404).json({ status: 'error', message: 'Wishlist not found' });
  
    }
  } catch (error) {
    console.log('Error removing product from wishlist',error);
    res.status(500).json({ status: 'error', message: 'Failed to remove product from wishlist' });
    
  }

}


export const wallet = async(req,res)=>{
  try {
    const categories = await category.find({isActive:true});
    const user = await User.findOne({email:req.session.user})
    let userWallet = await Wallet.findOne({userId:user._id}).sort({createdAt:-1})

    if(!userWallet){

      const newWallet = new Wallet({
        userId:user._id,
        balance:0,
        transactions:[]

      })

      await newWallet.save();

      return res.render('user/wallet',{
        title:'Wallet',
        categories,
        user:req.session.user,
        wallet:newWallet
      })

    }

    
    return res.render('user/wallet',{
      title:'Wallet',
      categories,
      user:req.session.user,
      wallet:userWallet

    })

    
    
  } catch (error) {
    console.log("error while rendering wallet",error);
    
  }
}



export const categoryView = async(req,res)=>{

  try {

    const categoryQuery = req.query.fetchCategory;
    const searchQuery = req.query.search || '';
    const sortBy = req.query.sort || '';
    const page = parseInt(req.query.page) || 1;
    const pageSize = 8;

    console.log(categoryQuery,"----",searchQuery,"----",sortBy,"---",page);
    

    let filter = {category:categoryQuery};
    console.log("----------=========",filter);
    

    if(searchQuery){
      filter.product_name = {$regex:searchQuery,$options:'i'}
    }

    let sortOption = {};

    if(sortBy === 'lowToHigh'){
      sortOption = { discountPrice: 1 }
    }else if(sortBy === 'highToLow'){
      sortOption = { discountPrice: -1 };
    }else if (sortBy === 'aToZ'){
      sortOption = { product_name: 1 };
    }else if(sortBy === 'zToA'){
      sortOption = { product_name: -1 };
    }

    const totalProducuts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducuts/pageSize);
    const categoryWiseProducts = await Product.find(filter)
    .sort(sortOption)
    .skip((page-1)*pageSize)
    .limit(pageSize)

   // console.log(categoryWiseProducts);
    
    
    

    categoryWiseProducts.forEach((product) => {
      const discountPrice = Math.ceil(
        product.price - (product.price * product.discount) / 100
      );
      product.discountPrice = discountPrice; // Append discountPrice to product
    });
    


    const categories = await category.find({isActive:true});

    res.render('user/categoryView',{
      user:req.session.user,
      title:'categoryView',
      products:categoryWiseProducts,
      categories,
      currentPage:page,
      totalPages,
      searchQuery,
      sortBy
    })
    
  } catch (error) {
    console.log('error while rendering category view',error);
    res.status(500).json({message:'Internal Server Error'})
  }

}