import express from 'express';
const adminRouter = express.Router();
import { getAdminLogin,loginPost,dashboard } from '../controller/adminController/adminController.mjs';

//------------------------------------  Login  ------------------------------------------------

adminRouter.get('/login',getAdminLogin)

adminRouter.post('/login',loginPost)



//------------------------------------  admin dashboard  ------------------------------------------------


adminRouter.get('/dashboard',dashboard)





export default adminRouter