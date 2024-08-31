//---------------------- module require ---------------------------------

import express from 'express'
import connectDB from './config/db.mjs';
import dotenv from 'dotenv';
import path from 'path';
import adminRouter from './routes/adminRoutes.mjs';
import userRouter from './routes/userRoutes.mjs'
import session from 'express-session';
import nocache from 'nocache'
import flash from 'connect-flash'
import layouts from 'express-ejs-layouts'



const app = express();

//---------------------- module require ---------------------------------


//PORT

const PORT = process.env.PORT || 3000

//PORT


// Database connection
connectDB();
// Database connection




//----------------------setting view engine--------------------------
app.set('view engine','ejs');
app.use(flash());



//---------------------- public static files------------------------------

app.use(express.static(path.resolve('public')));



//---------------------- url encoded data ---------------------- 

app.use(express.json())
app.use(express.urlencoded({extended:true}))

//---------------------- url encoded data ---------------------- 




//---------------------------- middlewares -------------------------------

app.use(nocache());
app.use(session({
    secret:"abc123",
    resave:false,
    saveUninitialized:false
}))


app.use(layouts)
app.set('layout','./layouts/layout')

//---------------------------- flash setup-------------------------------



// app.use((req, res, next) => {
//     res.locals.success_msg = req.flash('success_msg');
//     res.locals.error_msg = req.flash('error_msg');
//     next();
// });



//routes

app.use('/admin',adminRouter);
app.use("/",userRouter)

//routes



















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