import mongoose, { Schema } from "mongoose";

const offerSchema = mongoose.Schema({
    offerCategory:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required:true
    },
    offerName:{
        type:String,
        required:true
    },
    discountPercentage:{
        type:Number,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{timestamps: true})


const Offer =  mongoose.model('Offer',offerSchema)

export default Offer