
export const isUser=(req,res,next)=>{
    if(req.session.user){
        console.log("i am loggedIn");
        next()
    }else{
        console.log("please login");
    
        res.redirect('/login')
    }
}









