import category from "../../model/categoryScehema.mjs";
import Product from "../../model/productSchema.mjs";
import User from "../../model/userSchema.mjs";

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


export const deleteAddress = async(req,res)=>{
console.log("---deleteAddress");

  try {
    const addressId= req.params.addressId;

    const user = await User.findOne({'address._id':addressId});

    if(!user){
      return res.status(404).json({success:false,message:'User not found'});
    }

    user.address.pull({_id:addressId});

    await user.save();

    return res.status(200).json({ success: true, message: 'Address deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting address:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
    
  }

}






export const filterDataFetch = async(req,res)=>{

  console.log("filllll");
  

  const categories = await category.find({isActive: true})


  res.json({
    categories
  })

}







