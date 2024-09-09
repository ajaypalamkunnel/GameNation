import category from "../../model/categoryScehema.mjs"


export const home = async(req,res)=>{

    try {
        if(req.session.user){

            const categories = await category.find({})

            res.render('user/home',{title:'Home',user:req.session.user,categories})
    
        }else{
            res.redirect('/login')
        }
        
    } catch (error) {
        
    }
}

