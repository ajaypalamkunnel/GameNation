import User from "../../model/userSchema.mjs";
import crypto from 'crypto';
import nodemailer from 'nodemailer'
import bcrypt from 'bcrypt'
//---------------------- user signup get request ---------------------- 

export const getSignUp = (req,res)=>{
   try {
    if(req.session.user){
        res.redirect('/home')
    }else{
       
        // console.log('Success message:', req.flash('success_msg'));
        // console.log('Error message:', req.flash('error_msg'));

        
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

        // if(existingUser){
        //    console.log("Email already exists");
           
        //     req.flash("error_msg", 'Email already exists');
        //     return res.redirect('/signup')
        // }

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

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10); // 10 rounds for salting


        //Create new user but set isVerified to false until OTP is verified

        const newUser = new User({
            username,
            email,
            password: hashedPassword, // Save hashed password
            otp,
            otpExpiry,
            isVerified: false  // Assuming you have this field for verification
        });

        
        await newUser.save();


        //sent OTP email

        await sendOtpEmail(email,otp)
    //     req.flash('success_msg', 'OTP sent to email');
    //    return res.redirect('/signup');
    return res.status(200).json({
        success: true,
        message: 'OTP sent to email'
    });  
        
    } catch (error) {
        // console.log(`Error during signup: ${error}`);
        // req.flash('error_msg','Server error. Please try again later.');
        // return res.redirect('/signup');

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

        if(user.otp === otp && user.otpExpiry > Date.now()){
            user.isVerified=true;
            user.otp = undefined;
            user.otpExpiry=undefined;
            await user.save();
            req.session.user = email
           return res.status(200).json({success:true,message:"OTP verified, account activated"})
        }else{
           return res.status(400).json({success:false,message:"Invalid or expired OTP"})
        }

    } catch (error) {
        res.status(500).json({success:false,message:"server error",error})
        
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