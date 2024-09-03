import User from "../../model/userSchema.mjs";
import crypto from 'crypto';
import nodemailer from 'nodemailer'

//---------------------- user signup get request ---------------------- 

export const getSignUp = (req,res)=>{
   try {
    if(req.session.user){
        res.redirect('/home')
    }else{
        res.render('user/signup',{title:'signup',user:req.session.user})
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
    const transporter = nodemailer.createTransport({
            service:'Gmail',
            auth:{
                user:'gamenationproject@gmail.com',
                pass: 'cjhu vavt wglz yrzp'
            }
        });


        const mailOptions = {
            from: 'ajaypalamkunnel45@gmail.com',
            to:email,
            subject: 'Your OTP code',
            text:`Your OTP code is ${otp}`
        }

        await transporter.sendMail(mailOptions)

}
   
       


export const signupPost = async(req,res)=>{
    const {username,email,password,phone} = req.body;

    try {
        //check if the user already exist 

        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({succes:false,message:"Email already exists"})
        }

        //Generate OTP and expiry time 
        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);


        //Create new user but set isVerified to false until OTP is verified

        const newUser = new User({username,email,password,phone,otp,otpExpiry});
        await newUser.save();


        //sent OTP email

        

    } catch (error) {
        
    }
}

export const verifyOtp = (req,res)=>{

}



//---------------------------- user login -------------------------------------


export const getLogin = (req,res)=>{
    if(req.session.user){
        res.redirect('/home')
    }else{
        res.render('user/login',{title:'Login',user:req.session.user})
    }
}


export const loginPost = (req,res)=>{

}