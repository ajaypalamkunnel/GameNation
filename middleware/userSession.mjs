import User from "../model/userSchema.mjs";

export const isUser= async(req,res,next)=>{
    try {
        
        if(req.session.user){
            const user = await User.findOne({email:req.session.user})
            if(req.session.user && user.isVerified){
                next()
            }else{
                req.session.user = '';
                res.redirect('/login')
            }
            
            
        }else{
            next()
        }
    } catch (error) {
        console.log(`Error in checkuser Middleware  ${error}`)
        
    }
}









