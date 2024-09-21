import OrderSchema from "../../model/orderSchema.mjs";
import category from "../../model/categoryScehema.mjs";


export const orderSummary = async(req,res)=>{


    if(req.session.user){
        const orderId = req.query.orderId;
        console.log("Order ID from query:", orderId);

        const order = await OrderSchema.findById(orderId);
        const categories = await category.find({ isActive: true });

        if(!order){
            return res.status(404).json({message:"order not found"})
        }

        res.render('user/orderSummary',{
            order:order,
            user:req.session.user,
            categories,
            title:'Summary'
        })





    }else{
        res.redirect('/login')
    }
}