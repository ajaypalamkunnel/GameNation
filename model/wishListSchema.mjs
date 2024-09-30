import mongoose from "mongoose";

const product = mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }
},{_id:false,timestamps:true})


const wishList = mongoose.Schema({
    userId:{
        type:String
    },
    products:[product],

},{timestamps:true})

const WishList = mongoose.model('WishList',wishList)

export default WishList;