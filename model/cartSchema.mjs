import mongoose from "mongoose";

const itemSchema = mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'produt',
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
    }
},{_id:true,timestamps:true})



const Cart = mongoose.model('cart',cartSchema)

export default Cart;




// const categorySchema = mongoose.Schema({
//     collectionName:{
//         type:String,
//         required:true
//     },
//     isActive:{
//         type:Boolean,
//         default:true
//     }
// }, { timestamps: true });

// const category = mongoose.model('category',categorySchema)
// export default category