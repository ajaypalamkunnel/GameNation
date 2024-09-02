import express from 'express';
import {getLogin,loginPost , verifyOtp  } from '../controller/userController/userController.mjs';
const userRouter = express.Router()

import {getSignUp,signupPost} from '../controller/userController/userAuth.mjs'



//----------------------------- login -------------------------------

userRouter.get('/login',getLogin);
userRouter.post('/login',loginPost)


//----------------------------- signup -------------------------------

userRouter.get('/signup',getSignUp);

userRouter.post('/signup',signupPost)

//----------------------------- OTP verification -------------------------------

userRouter.post('/verify-otp', verifyOtp)



export default userRouter