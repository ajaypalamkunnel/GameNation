import mongoose from "mongoose";
import addressSchema from './addressSchema.mjs'

const userSchema = mongoose.Schema(
    {
        username:{
            type:String,
            
            unique:true

        },
        password:{
            type:String,
           
        },
        email:{
            type:String,
           
            unique:true
        },
        phone:{
            type:Number
        },
        address:{
            type:[addressSchema],
            default:[]
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