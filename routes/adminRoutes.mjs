import express from 'express';
import { isAdmin } from '../middleware/adminSession.mjs';
const adminRouter = express.Router();
import { getAdminLogin,loginPost,dashboard,addCategory,addCategoryPost,categoryView,updateCategory,customers,toggleVerification, ordersList, orderViewAdmin, searchCustomer } from '../controller/adminController/adminController.mjs';
import { addProduct, addProductPost,viewProducts,editProduct,editProductPut,deleteProduct} from '../controller/adminController/productController.mjs';
//import cloudinary from '../uploads/cloudinary.mjs';
import {upload} from '../uploads/cloudinary.mjs'
import { orderStatus, salesReoprtView } from '../controller/userController/orderController.mjs';
import { addCoupon, addCouponPost, coupons, removeCoupon } from '../controller/userController/couponController.mjs';
import { exportReport, sales } from '../controller/adminController/salesData.mjs';

//------------------------------------  Login  ------------------------------------------------

adminRouter.get('/login',getAdminLogin)

adminRouter.post('/login',loginPost)



//------------------------------------  admin dashboard  ------------------------------------------------


adminRouter.get('/dashboard',isAdmin,dashboard)


//------------------------------------  add category ------------------------------------------------

adminRouter.get('/category',isAdmin,categoryView)
adminRouter.get('/addCategory',isAdmin,addCategory)
adminRouter.post('/addCategory',isAdmin,addCategoryPost)
adminRouter.patch('/updateCategory/:id',isAdmin,updateCategory)




//-----------------------------display Category-------------------------------
adminRouter.get('/customers',isAdmin,customers)
adminRouter.post('/toggleVerification',toggleVerification)
adminRouter.get('/searchCustomer',isAdmin,searchCustomer)



//-----------------------------Products routes-------------------------------

adminRouter.get('/addProduct',isAdmin,addProduct)
adminRouter.post('/addProduct',upload.array('image',3),addProductPost)
adminRouter.get('/products',isAdmin,viewProducts)
adminRouter.get('/editProduct',isAdmin,editProduct)
adminRouter.post('/editProduct/:id',upload.array('image',3),editProductPut)
adminRouter.put('/deleteProduct/:id',isAdmin, deleteProduct); 



//-----------------------------order management--------------------------------

adminRouter.get('/ordersList',isAdmin,ordersList)
adminRouter.post('/order/:orderId/status',isAdmin,orderStatus)
adminRouter.get('/orderViewAdmin',isAdmin,orderViewAdmin)

//-----------------------------coupon management--------------------------------

adminRouter.get('/coupons',isAdmin,coupons);
adminRouter.get('/addCoupon',isAdmin,addCoupon);
adminRouter.post('/addCouponPost',isAdmin,addCouponPost);
adminRouter.patch('/removeCoupon/:couponId',isAdmin,removeCoupon)




//-------------------- sales report ---------------------------------

adminRouter.get('/salesReport',isAdmin,sales)
adminRouter.get('/salesReoprtView',isAdmin,salesReoprtView)
adminRouter.get('/exportReport',isAdmin,exportReport)

export default adminRouter