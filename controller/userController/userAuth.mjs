import User from "../../model/userSchema.mjs";
import crypto from 'crypto';
import nodemailer from 'nodemailer'

//---------------------- user signup get request ---------------------- 

export const getSignUp = (req,res)=>{
    try {
       return res.render('user/signup') 
    } catch (error) {
        console.log("error");
        
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
                user:'ajaypalamkunnel45@gmail.com',
                pass: '26334945'
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