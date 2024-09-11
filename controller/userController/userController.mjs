import category from "../../model/categoryScehema.mjs"
import Product from "../../model/productSchema.mjs";

export const home = async(req,res)=>{

    try {
            const categories = await category.find({});
            const products = await Product.find({});

      //      console.log(products);
            


            res.render('user/home',{title:'Home',user:req.session.user,categories,products,user:req.session.user})     
    } catch (error) {

        console.log(`error while rendering user home page ${error}`)
        
    }
}

