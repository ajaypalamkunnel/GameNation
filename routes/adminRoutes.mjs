import express from 'express';
const adminRouter = express.Router();
import { getAdminLogin } from '../controller/adminController/adminController.mjs';

adminRouter.get('/login',getAdminLogin)







export default adminRouter