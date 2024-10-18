import User from "../model/userSchema.mjs";

export const isUser= async(req,res,next)=>{
    try {
        console.log("================",req.session.user);
        console.log("goooglei id:",req.session.user.isVerified);
        
        if(req.session.user){


            const user = await User.findOne({email:req.session.user})
            console.log("inside if ",user);
            
           
            
            if(req.session.user && user.isVerified ){
                next()
            }else if(req.session.user.googleID && req.session.user.isVerified){
                next()
            }else{
                req.session.user = '';
                res.redirect('/login')
                
            }
            
            
        }else{
            next()
        }



        //--------------------------------- new middle ware --------------------------


        // const sessionUser = req.session.user;

        // if(!sessionUser){
        //     console.log("No user session found, redirecting to login.");
        //     return res.redirect("/login")
        // }

        // console.log("================ User in session:", sessionUser);
        // console.log("Google ID in session:", sessionUser.googleID);

        // let user;

        // if(sessionUser.googleID){
        //     user = await User.findOne({googleID:sessionUser.googleID});
        // }else if(sessionUser.email){
        //     user = await User.findOne({email:sessionUser.email})
        // }

        // if(!user){
        //     console.log("No matching user found in the database, clearing session.");
        //     req.session.user = null;
        //     return res.redirect("/login")
        // }

        // if(user.isVerified){
        //     next()
        // }else{
        //     console.log("User is not verified, redirecting to login.");
        //     req.session.user = null;
        //     res.redirect("/login");
        // }




    } catch (error) {
        console.log(`Error in checkuser Middleware  ${error}`)
        req.session.user = null;
        res.redirect("/login")
        
    }
}









