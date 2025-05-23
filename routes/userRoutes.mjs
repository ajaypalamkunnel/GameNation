import express from 'express';
import { isUser } from '../middleware/userSession.mjs';
const userRouter = express.Router()

import {getSignUp,signupPost, verifyOtp,getLogin,loginPost,googleAuth,googleAuthCallback,userLogout,resendOtp, passwordChangeGet, passwordChange, updateMobile, forgotPassword, forgotPasswordPost, forgotPasswordMail, forgotOtpMail, validateForgotOtp} from '../controller/userController/userAuth.mjs'
import { productView,allProducts,cart,addToCart,updateCartQuantity,searchProducts,removeProductFromCart, allProductsSort  } from '../controller/adminController/productController.mjs';
// import {} '../services/auth.mjs'
//import { checkout, placeOrder,applyCoupon,removeCoupon } from '../controller/userController/checkoutController.mjs';
import { home,userProfile,addressView,addNewAddress,addNewAddressPost,editAddress,editAddressPut,deleteAddress, filterDataFetch, wishList, addWisList, removeWishList, wallet, categoryView} from '../controller/userController/userController.mjs'; 
import { applyCoupon, checkout, placeOrder, removeCoupon, rePay, walletPayment } from '../controller/userController/checkoutController.mjs';
//import { home,userProfile,addressView,addNewAddress,addNewAddressPost,editAddress,editAddressPut,deleteAddress, filterDataFetch, wishList, addWisList, removeWishList} from '../controller/userController/userController.mjs'; 
import passport from 'passport';
import { cancelOrder, orders, orderSummary, orderView, paymentRender, returnOrder } from '../controller/userController/orderController.mjs';
import { userCoupons } from '../controller/userController/couponController.mjs';

//----------------------------- login -------------------------------

userRouter.get('/login',getLogin);
userRouter.post('/login',loginPost)
userRouter.get('/logout',userLogout)
userRouter.get('/forgotPassword',forgotPassword)
userRouter.get('/forgotPasswordMail',forgotPasswordMail)
userRouter.post('/forgotPasswordMailPost',forgotOtpMail)
userRouter.post('/forgotPassword',forgotPasswordPost)
userRouter.post('/validateForgotOtp',validateForgotOtp)


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
userRouter.get('/categoryView',categoryView)



//----------------------------- User profile & address -------------------------------

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
userRouter.get('/allProducts/sort',allProductsSort);
userRouter.get('/allproducts/filter-modal',filterDataFetch);
userRouter.get('/allproducts/filter',isUser,)


//---------------------------- checkout management --------------
userRouter.get('/checkout',isUser,checkout);
userRouter.post('/place-order',isUser,placeOrder);
userRouter.get('/orderSummary',isUser,orderSummary)
userRouter.get('/orders',isUser,orders)
userRouter.get('/orderView',isUser,orderView)
userRouter.post('/cancelOrder',isUser,cancelOrder);
userRouter.post('/returnOrder',isUser,returnOrder);
userRouter.post('/paymentRender/:amount',isUser,paymentRender);
userRouter.post('/walletPayment',isUser,walletPayment)
userRouter.post('/rePay',isUser,rePay)

//---------------------------- checkout management --------------

userRouter.get('/passwordChangePage',isUser,passwordChangeGet)
userRouter.patch('/passwordChange',isUser,passwordChange)
userRouter.patch('/updateMobile',isUser,updateMobile)


//---------------------------- wishList --------------

userRouter.get('/wishList',isUser,wishList)
userRouter.post('/addWishList',isUser,addWisList)
userRouter.delete('/removeWishListItem',isUser,removeWishList)


//---------------------------- wallet --------------

userRouter.get('/wallet',isUser,wallet)
//----------------------------- coupon apply --------------

userRouter.post('/applyCoupon',isUser,applyCoupon)
userRouter.post('/removeCoupon',isUser,removeCoupon)
userRouter.get('/coupons',isUser,userCoupons)
userRouter.get('/*',home)



export default userRouter