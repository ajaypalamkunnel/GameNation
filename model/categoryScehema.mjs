import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    collectionName:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    }
}, { timestamps: true });

const category = mongoose.model('category',categorySchema)
export default category