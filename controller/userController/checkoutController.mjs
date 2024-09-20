import Cart from "../../model/cartSchema.mjs";
import category from "../../model/categoryScehema.mjs";
import User from "../../model/userSchema.mjs";

export const checkout = async(req,res)=>{
    console.log("hiiiiiiiiiiiiiiiii");
    

    try {
        if(req.session.user){


            const email = req.session.user;
            const user = await User.findOne({email});

            console.log("i am user--",user );

            const cartDetails = await Cart.findOne({userId:user._id}).populate('items.productId')
            
            const items = cartDetails.items;

            if(items.length === 0){
                return res.redirect('/cart')
            }

            cartDetails.items.forEach((item)=>{
                if(item.productId.isDelete === true){
                    console.log("Product is not Available , Remove product From cart");
                    
                }
            })
            


            const categories = await category.find({ isActive: true });

            res.render('user/checkout',{
                title:'checkout',
                categories,
                items:cartDetails.items,
                user:req.session.user,
                addresses:user.address,
                cartTotal:cartDetails.totalPrice,
                payableAmount:cartDetails.payableAmount
            })



        }else{
            res.redirect('/login')
        }
    } catch (error) {

        console.log("error while rendering check out ",error);
        res.redirect('/cart');
        
        
    }
}