import OrderSchema from "../../model/orderSchema.mjs";
import category from "../../model/categoryScehema.mjs";
import User from "../../model/userSchema.mjs";
import Product from "../../model/productSchema.mjs";


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


export const orders = async(req,res)=>{
    console.log("hi i am orders");
    
    try {
        if(req.session.user){

            const email = req.session.user
            
            const user = await User.findOne({email})
            const categories = await category.find({ isActive: true });

            const orders = await OrderSchema.find({customer_id:user._id})
            .populate({
                path:'products.product_id',
                select:'product_name category price stock image',
                model:Product,
                options: { strictPopulate: false }
            });
            console.log(orders);
            

            res.render('user/orders',{

                orders:orders,
                user:req.session.user,
                categories,
                title: "Orders"


            })






        }else{
            res.redirect('/login')
        }
    } catch (error) {

        console.log("error while rendering orders ",error);
        
        
    }
}


// ---------------------------------- status change ------------------------------

export const orderStatus = async(req,res)=>{

    try {
        const {orderId} = req.params;
        const {status} = req.body;
        const validStatuses = ['Pending', 'Shipped', 'Confirmed', 'Delivered', 'Cancelled', 'Returned'];

        const currentOrder = await OrderSchema.findOne({_id:orderId});

        if (!currentOrder) {
            return res.status(404).send('Order not found');
        }

        if (validStatuses.indexOf(status) <= validStatuses.indexOf(currentOrder.status)) {
            return res.status(400).send('Invalid status change');
        }

        currentOrder.orderStatus = status;
        await currentOrder.save()

        res.send('Order status updated');


    } catch (error) {
        
        console.log(error);
        res.status(500).send('server error')
        
    }

}



export const orderView = async(req,res)=>{

    console.log("I am in orderview");
    

    try {
        const {orderId} = req.query;

        const email = req.session.user  
        const user = await User.findOne({email})

        const order = await OrderSchema.findOne({_id:orderId})
        .populate({
            path:'products.product_id',
            select:'product_name category price discount stock image',
            model:Product,
            options: { strictPopulate: false }
        });
        console.log(order);
        

        //console.log(orderId);
        const categories = await category.find({ isActive: true });

        res.render('user/orderView',{
            title:"Order Details",
            categories,
            user:req.session.user,
            order:order

        })
        
        
    } catch (error) {

        console.log("error in orderview ",error);
    
    }




}