import express from 'express';
import { isAdmin } from '../middleware/adminSession.mjs';
const adminRouter = express.Router();
import { getAdminLogin,loginPost,dashboard,addCategory,addCategoryPost,categoryView,updateCategory,customers,toggleVerification } from '../controller/adminController/adminController.mjs';
import { addProduct, addProductPost,viewProducts,editProduct,editProductPut,deleteProduct} from '../controller/adminController/productController.mjs';
//import cloudinary from '../uploads/cloudinary.mjs';
import {upload} from '../uploads/cloudinary.mjs'

//------------------------------------  Login  ------------------------------------------------

adminRouter.get('/login',getAdminLogin)

adminRouter.post('/login',loginPost)



//------------------------------------  admin dashboard  ------------------------------------------------


adminRouter.get('/dashboard',isAdmin,dashboard)


//------------------------------------  add category ------------------------------------------------

adminRouter.get('/category',isAdmin,categoryView)
adminRouter.get('/addCategory',isAdmin,addCategory)
adminRouter.post('/addCategory',isAdmin,addCategoryPost)
adminRouter.patch('/updateCategory/:id',updateCategory)




//-----------------------------display Category-------------------------------
adminRouter.get('/customers',isAdmin,customers)
adminRouter.post('/toggleVerification',toggleVerification)



//-----------------------------Products routes-------------------------------

adminRouter.get('/addProduct',isAdmin,addProduct)
adminRouter.post('/addProduct',upload.array('image',3),addProductPost)
adminRouter.get('/products',isAdmin,viewProducts)
adminRouter.get('/editProduct',isAdmin,editProduct)
adminRouter.post('/editProduct/:id',upload.array('image',3),editProductPut)
adminRouter.put('/deleteProduct/:id',isAdmin, deleteProduct); 



//-----------------------------order management--------------------------------





export default adminRouter