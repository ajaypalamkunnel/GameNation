import mongoose from "mongoose";

const itemSchema = mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    productCount:{
        type:Number,
        default:1
    },
    productPrice:{
        type:Number,
        required:true
    }
},{_id:false,timestamps:true});


const cartSchema = mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    items:[itemSchema],
    payableAmount:{
        type:Number,
        default:0
    },
    totalPrice:{
        type:Number,
        default:0
    },
    couponId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Coupon'
    },
    couponDiscount:{
        type:Number,
        default:0
    },
    isCouponApplied:{
        type:Boolean,
        default:false
    }
},{_id:true,timestamps:true})



const Cart = mongoose.model('cart',cartSchema)

export default Cart;

