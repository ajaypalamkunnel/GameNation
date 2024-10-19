import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

const connectDB = async()=>{
    try {
        //console.log(process.env.MONGO_URL);
        
        await mongoose.connect(process.env.MONGO_URL)
        console.log("mongodb connected");
        
    } catch (error) {
        console.log(`Error while connecting mongodb ${error}`);
        
    }
}


export default connectDB;