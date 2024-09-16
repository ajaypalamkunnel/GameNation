import express from 'express';
import {   } from '../controller/userController/userController.mjs';
const userRouter = express.Router()

import {getSignUp,signupPost, verifyOtp,getLogin,loginPost,googleAuth,googleAuthCallback,userLogout,resendOtp} from '../controller/userController/userAuth.mjs'
import { productView,allProducts } from '../controller/adminController/productController.mjs';
// import {} '../services/auth.mjs'

import { home } from '../controller/userController/userController.mjs'; 
import passport from 'passport';

//----------------------------- login -------------------------------

userRouter.get('/login',getLogin);
userRouter.post('/login',loginPost)
userRouter.get('/logout',userLogout)


//----------------------------- signup -------------------------------

userRouter.get('/signup',getSignUp);

userRouter.post('/signup',signupPost)

//----------------------------- OTP verification -------------------------------
userRouter.post('/verify-otp', verifyOtp)

userRouter.post('/resend-otp',resendOtp)








//----------------------------- Google authentication -------------------------------


userRouter.get('/auth/google',googleAuth)
userRouter.get('/auth/google/callback', googleAuthCallback);


        
        
        
        
        
        
        
//----------------------------- Home -------------------------------
        
userRouter.get('/home',home)

userRouter.get('/productView/:id',productView)

userRouter.get('/allProducts',allProducts)



export default userRouter