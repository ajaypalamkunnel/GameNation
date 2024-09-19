import express from 'express';
const userRouter = express.Router()

import {getSignUp,signupPost, verifyOtp,getLogin,loginPost,googleAuth,googleAuthCallback,userLogout,resendOtp} from '../controller/userController/userAuth.mjs'
import { productView,allProducts,cart  } from '../controller/adminController/productController.mjs';
// import {} '../services/auth.mjs'

import { home,userProfile,addressView,addNewAddress,addNewAddressPost,editAddress,editAddressPut,deleteAddress} from '../controller/userController/userController.mjs'; 
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



//----------------------------- User profile -------------------------------

userRouter.get('/userProfile',userProfile);
userRouter.get('/address',addressView);
userRouter.get('/addNewAddress',addNewAddress);
userRouter.post('/addNewAddress',addNewAddressPost);
userRouter.get('/editAddress/:addressId', editAddress); 
userRouter.put('/editAddress/:addressId',editAddressPut);
userRouter.delete('/deleteAddress/:addressId',deleteAddress);


//----------------------------- User profile -------------------------------

userRouter.get('/cart',cart)




export default userRouter