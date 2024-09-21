import addressSchema from "../../model/addressSchema.mjs";
import Cart from "../../model/cartSchema.mjs";
import category from "../../model/categoryScehema.mjs";
import OrderSchema from "../../model/orderSchema.mjs";
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



export const placeOrder = async(req,res)=>{
    console.log("hi i am place order");
    

    try {
        if(req.session.user){

            const { addressId, paymentMethod, cartItems, totalPrice } = req.body;
            const user = await User.findOne({email:req.session.user});

            console.log("--------",cartItems);
            
            
            
            

            const selectedAddress = await user.address.id(addressId);;

            if (!selectedAddress) {
                return res.status(400).json({ message: "Address not found" });
              }
              console.log("selected address",selectedAddress);
              

              const newOrder = new OrderSchema({
                customer_id:user._id,
                products: cartItems.map(item => ({
                    product_id: item.productId,
                    product_name: item.productName,
                    product_category: item.productId.category,
                    product_quantity: item.productQuantity,
                    product_price: item.productPrice,
                    product_status: "Pending" // Set initial product status
                  })),
                  totalQuantity: cartItems.reduce((sum,item)=>sum+item.productQuantity,0),
                  totalPrice:totalPrice,
                  address:{
                    contactName: selectedAddress.contactName,
                    building: selectedAddress.building,
                    city: selectedAddress.city,
                    district:selectedAddress.district,
                    state:selectedAddress.state,
                    country: selectedAddress.country,
                    pincode: selectedAddress.pincode,
                    phonenumber: selectedAddress.phonenumber,
                    landMark:selectedAddress.landMark
                  },
                  paymentMethod:paymentMethod,
                  paymentStatus: "Pending",
                  orderStatus:"Pending"

              })

              await newOrder.save();

              //clear the particular user cart

              await Cart.findOneAndUpdate({userId:user._id},{items:[],totalPrice:0})
              console.log(newOrder._id);
              

              res.status(200).json({message:"Order placed succesfully",orderId: newOrder._id })





        }else{
            res.redirect('/login')
        }
        
    } catch (error) {

        console.error("Error placing order:", error);
        res.status(500).json({ message: "An error occurred while placing the order" });
        
    }

}