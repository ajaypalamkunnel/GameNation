
import addressSchema from "../../model/addressSchema.mjs";
import Cart from "../../model/cartSchema.mjs";
import category from "../../model/categoryScehema.mjs";
import Coupon from "../../model/couponSchema.mjs";
import OrderSchema from "../../model/orderSchema.mjs";
import Product from "../../model/productSchema.mjs";
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
            });

            //coupon;

            const availableCoupons = await Coupon.find({
                isActive:true,
                endDate:{$gte: new Date()},
                minimumOrderAmount:{$lte: cartDetails.totalPrice}
            })
            
            const eligibleCoupons = availableCoupons.filter((coupon)=>{
                const couponUsage = user.couponUsed.find((c)=>c.couponId.equals(coupon._id))
                if(couponUsage){
                    return couponUsage.usageCount < coupon.usageCount
                }
                return true;
            })


            const categories = await category.find({ isActive: true });

            res.render('user/checkout',{
                title:'checkout',
                categories,
                items:cartDetails.items,
                user:req.session.user,
                addresses:user.address,
                cartTotal:cartDetails.totalPrice,
                payableAmount:cartDetails.payableAmount,
                eligibleCoupons
            })



        }else{
            res.redirect('/login')
        }
    } catch (error) {

        console.log("error while rendering check out ",error);
        res.redirect('/cart');
        
        
    }
}


export const applyCoupon = async (req, res) => {

    try {
        
        const { couponCode } = req.body;
        const user = await User.findOne({ email: req.session.user });
      
        if (!user) {
          return res.redirect("/login");
        }
      
        const coupon = await Coupon.findById(couponCode);
      
        if (!coupon) {
          return res.status(400).json({
            status: "error",
            message: "Coupon not found",
          });
        }
      
        if (!coupon.isActive) {
          return res.status(400).json({
            status: "error",
            message: "Coupon not not active",
          });
        }
        if (!coupon.isActive || coupon.endDate > new Date()) {
          return res.status(400).json({
            status: "error",
            message: "Coupon expired",
          });
        }
      
        const couponUsage = user.couponUsed.find((usage) => {
          usage.couponId.toString() === coupon._id.toString();
        });
      
        if (couponUsage && couponUsage.usageCount >= coupon.usageCount) {
          return res
            .status(400)
            .json({
              status: error,
              message: "You have reached the maximum coupon usage limit",
            });
        }
      
        const cart = await Cart.findOne(user._id);
      
        if (!cart) {
          return res.status(404).json({ status: "error", message: "cart not found" });
        }
        const total = cart.payableAmount;
        let discountedTotal = total;
      
        if (total < coupon.minimumOrderAmount) {
          return res
            .status(409)
            .json({
              status: "error",
              message:
                "Minimum purchase limit not reached. Please add more items to your cart.",
            });
        }
      
        let couponDiscount = coupon.discountValue;
      
        if (coupon.discountType === "Fixed") {
          discountedTotal = total - couponDiscount;
        } else if (coupon.discountType === "Percentage") {
          const discountAmount = (couponDiscount / 100) * total;
          discountedTotal = total - discountAmount;
        }
      
        cart.payableAmount = discountedTotal;
      
        await cart.save();

        return res.status(200).json({})
    } catch (error) {
        
    }

  console.log(couponCode);
};











function orderIdGenerator(){
    // Simulate a storage for used OTPs (for demo purposes, use a database in real scenarios)
const usedOrderId = new Set();

// Function to generate a unique 6-digit OTP
function generateUniqueOtp() {
    let otp;

    do {
        // Generate a random 6-digit number between 100000 and 999999
        otp = Math.floor(100000 + Math.random() * 900000);
    } while (usedOrderId.has(otp));  // Check if OTP is already used

    // Store the OTP as used
    usedOrderId.add(otp);

    return otp;
}

// Example usage:
const otp = generateUniqueOtp();
return otp
    
}



export const placeOrder = async(req,res)=>{
    console.log("hi i am place order");
    

    try {
        if(req.session.user){

            const { addressId, paymentMethod, cartItems, totalPrice } = req.body;
            const order_id = orderIdGenerator()
            const user = await User.findOne({email:req.session.user});

            console.log("--------",cartItems);
            
            let orderTotal = cartItems.reduce((sum,item)=>{
                return sum = sum + item.productPrice
            },0)
            console.log("order total = ",orderTotal);
            
           
            

            const selectedAddress = await user.address.id(addressId);;

            if (!selectedAddress) {
                return res.status(400).json({ message: "Address not found" });
              }
              console.log("selected address",selectedAddress);



              for(const item of cartItems){
                const product = await Product.findById(item.productId);

                if (!product) {
                    return res.status(404).json({ message: `Product ${item.productName} not found` });
                  }

                  if (product.stock < item.productQuantity) {
                    return res.status(400).json({ message: `Insufficient stock for ${item.productName}. Only ${product.stock} available.` });
                  }

              }


              

              const newOrder = new OrderSchema({
                customer_id:user._id,
                order_id:order_id,
                products: cartItems.map(item => ({
                    product_id: item.productId,
                    product_name: item.productName,
                    product_category: item.productId.category,
                    product_quantity: item.productQuantity,
                    product_price: item.productPrice,
                    product_status: "Pending" // Set initial product status
                  })),
                  totalQuantity: cartItems.reduce((sum,item)=>sum+item.productQuantity,0),
                  totalPrice:orderTotal,
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


              for(const item of cartItems){
                const prodcut = await Product.findById(item.productId);
                prodcut.stock -= item.productQuantity;
                await prodcut.save()
              }




              //clear the particular user cart

              await Cart.findOneAndUpdate({userId:user._id},{items:[],totalPrice:0})
              console.log(newOrder._id);
              

              res.status(200).json({message:"Order placed succesfully",orderId: newOrder.order_id })





        }else{
            res.redirect('/login')
        }
        
    } catch (error) {

        console.error("Error placing order:", error);
        res.status(500).json({ message: "An error occurred while placing the order" });
        
    }

}