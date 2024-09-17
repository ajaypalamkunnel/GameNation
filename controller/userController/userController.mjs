import category from "../../model/categoryScehema.mjs"
import Product from "../../model/productSchema.mjs";
import User from "../../model/userSchema.mjs";

export const home = async(req,res)=>{

    try {
            const categories = await category.find({isActive:true});
            const products = await Product.find({isDelete:false});

      //      console.log(products);
      products.forEach((product) => {
        const discountPrice = Math.ceil(product.price - (product.price * product.discount) / 100);
        product.discountPrice = discountPrice; // Append discountPrice to product
      });
            
            res.render('user/home',{title:'Home',user:req.session.user,categories,products,user:req.session.user})     
    } catch (error) {

        console.log(`error while rendering user home page ${error}`)
        
    }
}



export const userProfile = async(req,res)=>{

  if(req.session.user){


    const email = req.session.user;

    const userProfile = await User.findOne({email})
    
    
    
    const categories = await category.find({isActive:true});
    res.render('user/userProfile',{title:'Profile',categories,userProfile,user:req.session.user})

  }else{
    res.redirect('/login')
  }

}



export const addressView = async(req,res)=>{
  try {

    if (req.session.user) {
      const email = req.session.user;
      const user = await User.findOne({email}).populate('address');
      const categories = await category.find({isActive:true});
      res.render('user/address',{
        title:'Address',
        user:req.session.user,
        categories,
        addresses: user.address
      })  
    }else{
      res.redirect('/login')
    }
    
  } catch (error) {
    console.log(`error while rendering address view ${error}`);
  }
}



export const addNewAddress = async(req,res)=>{

  try {
    if(req.session.user){
      const categories = await category.find({isActive:true});
    
      res.render('user/addAddress',{
        title:'Add Address',
        categories,
        user:req.session.user,
        categories,
        successMessage:req.flash('success'),
        errorMessage:req.flash('error')

      })
  
    }else{
      res.redirect('/login')
    }
    
  } catch (error) {

    console.log(`error while rendering address view ${error}`);
    
  }


}


export const addNewAddressPost = async(req,res)=>{

console.log('hiiiiiiiiiiiiiiii');

  try {

    if(req.session.user){
      
      const {contactName, phonenumber, building, pincode, city, district, state, country, landmark } = req.body;
      const email = req.session.user;
      
      const user = await User.findOne({email});

      if(!user){
        console.log('user not found');
        
        req.flash('error', 'User not found');
        return res.redirect('/address')
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
        landmark
      }

      user.address.push(newAddress)
      await user.save();
      req.flash('success','New address added successfully');
      res.redirect('/addNewAddress');

    }else{

      res.redirect('/login')

    }
    

  } catch (error) {
    console.error('Error adding new address:', error);
    req.flash('error', 'An error occurred while adding the address.');
    res.redirect('/address');
    
  }

  
  
  
}