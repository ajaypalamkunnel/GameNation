import category from "../../model/categoryScehema.mjs";
import mongoose from "mongoose";
//---------------------- admin login get request ---------------------- 
export const getAdminLogin = (req,res)=>{

    try {
        if(req.session.admin){
           return res.redirect('/admin/dashboardAdmin')
        }else{
           return res.render('admin/loginAdmin',{msg:req.flash(),title:'AdminLogin'})
        }
    } catch (error) {
        console.error(`Error from admin login: ${error}`);
        req.flash("error", "An error occurred. Please try again.");
        return res.redirect('/admin/loginAdmin');
    }

    // res.render("admin/loginAdmin")
}

//---------------------- admin login post request ---------------------- 

export const loginPost = (req,res)=>{
    try {
        if(req.body.username === process.env.ADMINUSERNAME && req.body.password === process.env.ADMINPASSWORD){
            req.session.admin = req.body.username;
          return  res.redirect('/admin/dashboard')
        }else{
            req.flash("error","invalid credential")
            return  res.redirect('/admin/login')
        }
    } catch (error) {
        console.error("Error during admin login:", error);
        req.flash("error", "An error occurred during login. Please try again.");
        return res.redirect('/admin/loginAdmin');

    }
}


export const dashboard = (req,res)=>{
    try {
        if(req.session.admin){
            res.render('admin/dashboardAdmin',{title:"AdminHome"})
        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
        
    }
}



//---------------------------- user login -------------------------------------


export const addCategory = (req,res)=>{
    try {
        if(req.session.admin){
            res.render('admin/addCategory',{title:"Add category",admin:req.session.admin})
        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
    console.log(`error while rendering add category ${error} `)
        
    }
}


export const addCategoryPost = async (req,res)=>{
    

    try {
        const {categoryName,isBlocked} = req.body;

        const newCategory = new category({
            collectionName: categoryName,
            isActive:isBlocked==='true'
        })

        await newCategory.save()
       return res.redirect('addCategory/?success=true')
        
    } catch (error) {

        console.log("Error adding category:", error);

        res.redirect('/addCategory?success=false')
        
        
    }

}



export const categoryView = async(req,res)=>{
    try {
        // Fetch all categories from the database
        const categories = await category.find({})

        // Render the view and pass the categories data

        res.render('admin/category',{
            title:"Category",
            admin:req.session.admin,
            categories
        })

    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Internal Server Error');
    }
}

export const updateCategory = async(req,res)=>{

        const {id} = req.params;
        const {name,isBlocked} = req.body;

    try {

        const result = await category.findByIdAndUpdate(
            id,
            {collectionName:name, isActive:isBlocked},
            {new:true}
        )

        if(!result){
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({message:"category updated succesfully",category:result})
        
    } catch (error) {

        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Internal Server Error' });
        
    }
}