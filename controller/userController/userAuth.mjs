import User from "../../model/userSchema.mjs";
import crypto from 'crypto';
import nodemailer from 'nodemailer'
import bcrypt from 'bcrypt'
import passport from "passport";
import { title } from "process";
import category from "../../model/categoryScehema.mjs";
import { log } from "console";
//---------------------- user signup get request ---------------------- 

export const getSignUp = (req,res)=>{
   try {
    if(req.session.user){
        res.redirect('/home')
    }else{
       
       
        res.render('user/signup',{
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg'),
            title:'signup',
            user:req.session.user})
    }
   } catch (error) {
    console.log(`error while rendering signup page ${error} `)
  }
}


//---------------------- user signup posst request ---------------------- 

function generateOtp() {
    return crypto.randomInt(100000, 999999).toString();
}

async function sendOtpEmail(email,otp){
    console.log("sendOTP Email ");
    
    const transporter = nodemailer.createTransport({
            service:'Gmail',
            auth:{
                user:'gamenationproject@gmail.com',
                pass: 'cjhu vavt wglz yrzp'
            }
        });


        const mailOptions = {
            from: 'gamenationproject@gmail.com',
            to:email,
            subject: 'Your OTP code',
            text:`Your OTP code is ${otp}`
        }

        await transporter.sendMail(mailOptions)

}
   
       


export const signupPost = async(req,res)=>{
    console.log("signupPost");
    console.log(req.body);
    
    
    const {username,email,password} = req.body;
    console.log(username,email,password);
    

    try {
        //check if the user already exist 

        const existingUser = await User.findOne({email});

        

        if (existingUser) {
            console.log("Email already exists");
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        //Generate OTP and expiry time 
        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        req.session.otp = { otp, otpExpiry };

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10); // 10 rounds for salting


        //Create new user but set isVerified to false until OTP is verified

        const newUser = new User({
            username,
            email,
            password: hashedPassword, // Save hashed password
            isVerified: false  // Assuming you have this field for verification
        });

        
        await newUser.save();


        //sent OTP email

        await sendOtpEmail(email,otp)
    
    return res.status(200).json({
        success: true,
        message: 'OTP sent to email'
    });  
        
    } catch (error) {
        
        console.error(`Error during signup: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            email: newUser.email

        });
        
    }
}

export const verifyOtp = async (req,res)=>{

    const {email,otp} = req.body;
    console.log("----",email,"------",otp);

    try {
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({success:false,message:"user not found"})
        }

        const sessionOtp = req.session.otp;
        if (!sessionOtp || sessionOtp.otp !== otp || sessionOtp.otpExpiry < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }
        
        user.isVerified = true;
        await user.save()

        req.session.otp = null;

        req.session.user = email;
        return res.status(200).json({ success: true, message: "OTP verified, account activated" });

    } catch (error) {
        console.error(`Error during OTP verification: ${error}`);
        return res.status(500).json({ success: false, message: "Server error. Please try again later." });       
    }
}



//---------------------------- user login -------------------------------------


export const getLogin = (req,res)=>{
    if(req.session.user){
        res.redirect('/home')
    }else{
        res.render('user/login',{ error_msg: req.flash('error'),title:'Login',user:req.session.user})
    }
}


export const loginPost = async(req,res)=>{

    try {
        const user = await User.findOne({email:req.body.email})
        if(user){

            if(!user.isVerified){
                req.flash('error','user access is blocked by admin');
                res.redirect('/login')
    
            }else{
                const password = await bcrypt.compare(req.body.password,user.password)
                
                if(user && password){
                    req.session.user = user.email;
                    res.redirect('/home')
                }else{
                    req.flash('error','Invalid credentitals');
                    res.redirect('/login')
                }
            }
        }else{
            req.flash('error','coudnt find user, please login again');
            res.redirect('/login')
        }
        
    } catch (error) {
        console.log(`errror while login post ${error}`);
        
    }

}


export const resendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // Generate a new OTP
        const otp = generateOtp();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

        // Send new OTP (you might store OTP in session or use another mechanism)
        req.session.otp = { otp, otpExpiry };

        await sendOtpEmail(email, otp);

        return res.status(200).json({ success: true, message: 'OTP resent successfully' });
    } catch (error) {
        console.error(`Error resending OTP: ${error}`);
        return res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
};




//--------------------- forgot otp  mail-----------


export const forgotOtpMail = async(req,res)=>{

    console.log('forgotOtpMail');
    try {
        const data = req.body;
        console.log(data.email);
        
    
        const user = await User.findOne({email:data.email});
    
        if(!user){
            return res.status(404).json({status:'notFound',message:'User not found'})
        }

        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        req.session.otp = otp;

       await sendOtpEmail(data.email,otp);
       req.session.otpMail = data.email

       return res.status(200).json({status:'success',message:'OTP sent to email'})


        
    } catch (error) {
        console.log('error in forgotOtpMail',error);
        
    }

}


//---------------------------- password forgot otp validator --------------------------------


export const validateForgotOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    console.log(otp, "---", req.session.otp);

    if (otp == req.session.otp) {
      req.session.otp = null;
      return res
        .status(200)
        .json({ status: "success", message: "OTP validated successfully" });
    }

    return res.status(400).json({ status: "error", message: "Invalid OTP" });
  } catch (error) {
    console.log("Error while validating OTP : ", error);
  }
};







//----------------------------------- google auth  ----------------------------

export const googleAuth = passport.authenticate('google', {
    scope: ['email', 'profile'],
    prompt: 'select_account'
  });
  
//----------------------------------- google auth callback  ----------------------------


export const googleAuthCallback = (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) {
        console.log(`Error on Google auth callback: ${err}`);
        req.flash('error_msg', 'Something went wrong during authentication.');
        return res.redirect('/login');
      }
  
      if (!user) {
        req.flash('error_msg', 'No user found with this Google account.');
        return res.redirect('/login');
      }
  
      req.logIn(user, (err) => {
        if (err) {
          console.log(`Login error: ${err}`);
          req.flash('error_msg', 'Failed to log you in.');
          return res.redirect('/login');
        }
  
        // Store user in the session
        req.session.user = user.email;
        console.log("********** session",req.session.user);
        
        console.log("Successfully logged in with Google!");
        
        req.flash('success_msg', 'Successfully logged in with Google!');
        return res.redirect('/home');
      });
    })(req, res, next); // Make sure to pass next here
  };


//---------------------------- forgot password changing form  --------------------------------


  export const forgotPassword = async (req, res) => {
    try {
      res.render("user/forgotPassword", {
        title: "Forgot Password",
      });
    } catch (error) {
      console.log("error while loading ", error);
    }
  };


//---------------------------- forgot password mail enter form --------------------------------

  export const forgotPasswordMail = async(req,res)=>{
    try {
        res.render('user/forgotPasswordMail',{
            title:'Forgot Password'
        })
        
    } catch (error) {
        console.log("error while loading ",error);
        
    }


  }

//---------------------------- forgot password post controller--------------------------------

  export const forgotPasswordPost = async (req, res) => {
    try {
      const { confirmPassword } = req.body;

      const user = await User.findOne({ email: req.session.otpMail });

      if (!user) {
        return res
          .status(404)
          .json({ status: "notFound", message: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(confirmPassword, 10);

      user.password = hashedPassword;

      await user.save();
      req.session.otpMail = null;

      return res
        .status(200)
        .json({ status: "success", message: "Password changed successfully" });
    } catch (error) {
      console.log("error while changing password", error);
    }
  };



//---------------------------- user loguot--------------------------------


  export const userLogout = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Error logging out");
      }

      res.redirect("/login");
    });
  };


//---------------------------- change password  from inside --------------------------------


export const passwordChangeGet = async (req, res) => {
  const categories = await category.find({ isActive: true });

  res.render("user/passwordChange", {
    title: "Password Change",
    categories,
    user: req.session.user,
  });
};


//---------------------------- password change post --------------------------------


export const passwordChange = async(req,res)=>{
    try {

        const {currentPassword,newPassword} = req.body;

        const user = await User.findOne({email:req.session.user});
    
        const iscurrentPasswordValid = await bcrypt.compare(currentPassword,user.password);

        const hashedPassword = await bcrypt.hash(newPassword,10)

        if(!iscurrentPasswordValid){
            return res.status(400).json({message:"current password is incorrect"})
        }
    
        

            const passwordUpdated = await User.findByIdAndUpdate(
                user._id,
                {
                    password : hashedPassword
                },
                {new:true}

            )
    
        if(passwordUpdated){
            return res.status(200).json({message:"password successfully updated"})
        }else{
            return res.status(500).json({message: "Error updating the password"})
        }
    
        
    } catch (error) {
        console.log("Errror in passoword change:",error);
        return res.status(500).json({message:"Server error occurred while changing the password." })
        
    }

}



//---------------------------- user profile mobile number updation --------------------------------

export const updateMobile = async(req,res)=>{
    try {

        const {phone} = req.body;

        const user = await User.findOne({email:req.session.user})

        if(!user){
            return res.status(404).json({status:'error',message:"user not found"})
        }

        user.phone = phone;
        await user.save();

        return res.status(200).json({status:'success',message:"Mobile number update successfully"});
      
    } catch (error) {
        console.log("Errror in update mobile:",error);
        return res.status(500).json({status:'error',message:"Server error occurred while updating mobile" })
        
    }
}