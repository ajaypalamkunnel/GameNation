import category from "../../model/categoryScehema.mjs"


export const addProduct = async(req,res)=>{
    try {
        const categories = await category.find({isActive:true})
        res.render('admin/addProduct',{title:'Add Product',categories})
        
    } catch (error) {
        console.error("Error fetching categories: ", err);
        res.status(500).send("Internal Server Error");
        
    }

}