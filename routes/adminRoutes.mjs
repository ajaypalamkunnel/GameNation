import express from 'express';
const adminRouter = express.Router();
import { getAdminLogin,loginPost,dashboard,addCategory,addCategoryPost } from '../controller/adminController/adminController.mjs';

//------------------------------------  Login  ------------------------------------------------

adminRouter.get('/login',getAdminLogin)

adminRouter.post('/login',loginPost)



//------------------------------------  admin dashboard  ------------------------------------------------


adminRouter.get('/dashboard',dashboard)


//------------------------------------  add category ------------------------------------------------

adminRouter.get('/addCategory',addCategory)
adminRouter.post('/addCategory',addCategoryPost)



export default adminRouter