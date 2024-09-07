import express from 'express';
import { isAdmin } from '../middleware/adminSession.mjs';
const adminRouter = express.Router();
import { getAdminLogin,loginPost,dashboard,addCategory,addCategoryPost,categoryView,updateCategory,customers,toggleVerification } from '../controller/adminController/adminController.mjs';
import { addProduct } from '../controller/adminController/productController.mjs';
import cloudinary from '../uploads/cloudinary.mjs';

//------------------------------------  Login  ------------------------------------------------

adminRouter.get('/login',getAdminLogin)

adminRouter.post('/login',loginPost)



//------------------------------------  admin dashboard  ------------------------------------------------


adminRouter.get('/dashboard',dashboard)


//------------------------------------  add category ------------------------------------------------

adminRouter.get('/category',isAdmin,categoryView)
adminRouter.get('/addCategory',addCategory)
adminRouter.post('/addCategory',addCategoryPost)
adminRouter.patch('/updateCategory/:id',updateCategory)




//-----------------------------display Category-------------------------------
adminRouter.get('/customers',customers)
adminRouter.post('/toggleVerification',toggleVerification)



//-----------------------------Products routes-------------------------------

adminRouter.get('/addProduct',addProduct)













export default adminRouter