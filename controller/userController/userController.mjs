


export const home = async(req,res)=>{
    res.render('user/home',{title:'Home',user:req.session.user})
}

