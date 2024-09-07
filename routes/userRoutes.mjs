import express from 'express';
import {   } from '../controller/userController/userController.mjs';
const userRouter = express.Router()

import {getSignUp,signupPost, verifyOtp,getLogin,loginPost,googleAuth,googleAuthCallback} from '../controller/userController/userAuth.mjs'
// import {} '../services/auth.mjs'

import { home } from '../controller/userController/userController.mjs'; 
import passport from 'passport';

//----------------------------- login -------------------------------

userRouter.get('/login',getLogin);
userRouter.post('/login',loginPost)


//----------------------------- signup -------------------------------

userRouter.get('/signup',getSignUp);

userRouter.post('/signup',signupPost)

//----------------------------- OTP verification -------------------------------
userRouter.post('/verify-otp', verifyOtp)








//----------------------------- Google authentication -------------------------------


userRouter.get('/auth/google',googleAuth)
userRouter.get('/auth/google/callback', googleAuthCallback);


        
        
        
        
        
        
        
//----------------------------- Home -------------------------------
        
userRouter.get('/home',home)





export default userRouter