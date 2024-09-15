import category from "../../model/categoryScehema.mjs"
import Product from "../../model/productSchema.mjs";

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

