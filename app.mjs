dotenv.config();
//---------------------- module require ---------------------------------

import express from "express";
import connectDB from "./config/db.mjs";
import dotenv from "dotenv";
import path from "path";
import adminRouter from "./routes/adminRoutes.mjs";
import userRouter from "./routes/userRoutes.mjs";
import session from "express-session";
import nocache from "nocache";
import flash from "connect-flash";
import layouts from "express-ejs-layouts";
import passport from "passport";
import passportSetup from './services/auth.mjs'
//---------------------- module require ---------------------------------
const app = express();

// Database connection
connectDB();
// Database connection

//----------------------setting view engine--------------------------
app.set("view engine", "ejs");

app.use(layouts);
app.set("layout", "./layouts/layout");


//---------------------- public static files------------------------------

app.use(express.static(path.resolve("public")));

//PORT

const PORT = process.env.PORT || 3000;

//PORT

//---------------------- url encoded data ----------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//---------------------- url encoded data ----------------------

//---------------------------- middlewares -------------------------------

app.use(
  session({
    secret: "abc123",
    resave: false,
    saveUninitialized: true,
  })
);

//---------------------------- flash setup-------------------------------

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

//---------------------------- passport setup-------------------------------

app.use(passport.initialize());
app.use(passport.session());


//routes

app.use(nocache());

app.use("/admin", adminRouter);
app.use("/", userRouter);


app.get('/',(req,res)=>{
  try {
    res.redirect('/home')
  } catch (error) {
    console.log(`error from main route ${error}`) 
  }
})
//------------------------------routes------------------





//server listening

app.listen(PORT, (err) => {
  if (err) {
    console.log("Error while listing port");
  } else {
    console.log(`server listening to http://localhost:${PORT}`);
  }
});

//server listening
