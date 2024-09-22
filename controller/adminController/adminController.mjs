import category from "../../model/categoryScehema.mjs";
import OrderSchema from "../../model/orderSchema.mjs";
import Product from "../../model/productSchema.mjs";
import User from "../../model/userSchema.mjs";
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
            res.render('admin/addCategory',{
                title:"Add category",
                admin:req.session.admin,
                successMessage:req.flash('success'),
                errorMessage:req.flash('error')
            })
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

        const existingCategory = await category.findOne({collectionName:categoryName.trim()})


        if(existingCategory){
            req.flash('error','category already exist');
            return res.redirect('/admin/addCategory?success=false')
        }



        const newCategory = new category({
            collectionName: categoryName,
            isActive:isBlocked==='true'
        })

        await newCategory.save()
        req.flash('success', 'Category added successfully!');
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




export const customers = async(req,res)=>{

    try {
        if(req.session.admin){

            const page = parseInt(req.query.page)||1;
            const limit = parseInt(req.query.limit)||5;

            const skip = (page-1) * limit;

            const totalUsers = await User.countDocuments({});


            const users = await User.find({}).skip(skip).limit(limit);

            const totalPages = Math.ceil(totalUsers/limit);
            res.render('admin/customers',{
                title:'customers',users,
                users:users,
                currentPage:page,
                totalPages:totalPages,
                limit:limit

            });

        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
        console.log(`error while rendering add customers ${error} `)
        
    }
   
   }



export const toggleVerification = async(req,res)=>{
    const {userId,isVerified} = req.body;
    try {
        console.log(isVerified);
        
    //    const resss = await User.findOneAndUpdate({email:email},{isVerified:isVerified})
        await User.updateOne({_id:userId},{$set:{isVerified:isVerified}})
       
       
        res.json({success:true})      
    } catch (error) {
        console.log(`Error while updating verification status: ${error}`);
        res.status(500).json({success:false,message:'Failed to update status'});
        res.json({success:false})
    }
}


export const ordersList = async(req,res)=>{
    try {
        if(req.session.admin){

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const skip = (page - 1) * limit;

            const orders = await OrderSchema.find({})
            .populate({
                path:'products.product_id',
                select: 'name category'
            })
            .populate({
                path:'customer_id',
                select: 'username',
                model:User
            })
            .skip(skip)
            .limit(limit)
            .lean()

             // Get the total number of orders for pagination info
            const totalOrders = await OrderSchema.countDocuments();
            const totalPages = Math.ceil(totalOrders / limit);
            
            

        

            res.render('admin/orders',{
                title:"Orders",
                admin:req.session.admin,
                orders,
                currentPage: page,
                totalPages,
                limit


            })
        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {

        console.log("error while rendring orders",error);
        
        
    }
}
