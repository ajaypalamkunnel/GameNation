//module require

import express from 'express'
import connectDB from './config/db.mjs';
import dotenv from 'dotenv';
import path from 'path';
import adminRouter from './routes/adminRoutes.mjs';
import userRouter from './routes/userRoutes.mjs'





const app = express();

//module require



//public static files

app.use(express.static(path.resolve('public')));

//public static files


//url encoded data
app.use(express.json())
app.use(express.urlencoded({extended:true}))
//url encoded data


// Database connection
connectDB();
// Database connection

//----------------------setting view engine--------------------------
app.set('view engine','ejs');



//routes

app.use('/admin',adminRouter);
app.use("/",userRouter)

//routes









//PORT

const PORT = process.env.PORT || 3000

//PORT














//server listening

dotenv.config()
app.listen(PORT,(err)=>{
    if(err){
        console.log("Error while listing port");        
    }else{
        console.log(`server listening to http://localhost:${PORT}`);
    }
})

//server listening