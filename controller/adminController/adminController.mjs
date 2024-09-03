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
            res.redirect('admin/login')
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