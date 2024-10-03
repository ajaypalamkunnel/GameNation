import mongoose from "mongoose";
import addressSchema from './addressSchema.mjs'


const couponUsageSchema = mongoose.Schema({
    couponId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        required:true
    },
    usageCount:{
        type:Number,
        default:0
    }
},{_id:false})


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
        },
        couponUsed:{
            type : [couponUsageSchema],
            default:[]
        }
    },
    { timestamps: true } 
        
    
)

const User = mongoose.model('User',userSchema)

export default User