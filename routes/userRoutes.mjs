import express from 'express';
import { isUser } from '../middleware/userSession.mjs';
const userRouter = express.Router()

import {getSignUp,signupPost, verifyOtp,getLogin,loginPost,googleAuth,googleAuthCallback,userLogout,resendOtp} from '../controller/userController/userAuth.mjs'
import { productView,allProducts,cart,addToCart,updateCartQuantity,searchProducts,removeProductFromCart  } from '../controller/adminController/productController.mjs';
// import {} '../services/auth.mjs'
import { checkout, placeOrder } from '../controller/userController/checkoutController.mjs';
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

userRouter.get('/userProfile',isUser,userProfile);
userRouter.get('/address',isUser,addressView);
userRouter.get('/addNewAddress',isUser,addNewAddress);
userRouter.post('/addNewAddress',isUser,addNewAddressPost);
userRouter.get('/editAddress/:addressId',isUser, editAddress); 
userRouter.put('/editAddress/:addressId',isUser,editAddressPut);
userRouter.delete('/deleteAddress/:addressId',isUser,deleteAddress);


//----------------------------- cart management -------------------------------

userRouter.get('/cart',isUser,cart);
userRouter.post('/cart/add',isUser,addToCart);
userRouter.post('/cart/update-quantity',isUser,updateCartQuantity);
userRouter.post('/cart/remove-item',isUser,removeProductFromCart)



//---------------------------- search management --------------

userRouter.get('/search',searchProducts);



//---------------------------- checkout management --------------
userRouter.get('/checkout',checkout);

userRouter.post('/place-order',placeOrder)


export default userRouter