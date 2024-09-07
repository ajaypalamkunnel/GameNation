import mongoose from "mongoose";
import addressSchema from './addressSchema.mjs'

const userSchema = mongoose.Schema(
    {
        username:{
            type:String,
            //required:[true,"Username is required"],
            unique:true

        },
        password:{
            type:String,
           // required: [true, "Password is required"]
        },
        email:{
            type:String,
           // required:[true, "Email is required"],
            unique:true
        },
        phone:{
            type:Number
        },
        address:{
            type:[addressSchema],
            default:[]
        },
        otp:{
            type:String
        },
        otpExpiry:{
            type : Date
        },
        isVerified: {
            type: Boolean,
            default: false 
        },
        googleID: {
            type: String
        }
    },
    { timestamps: true } 
        
    
)

const User = mongoose.model('User',userSchema)

export default User