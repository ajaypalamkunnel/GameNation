

import HTTP_STATUS from "../../constants/statusCodes.mjs";
import addressSchema from "../../model/addressSchema.mjs";
import Cart from "../../model/cartSchema.mjs";
import category from "../../model/categoryScehema.mjs";
import Coupon from "../../model/couponSchema.mjs";
import OrderSchema from "../../model/orderSchema.mjs";
import Product from "../../model/productSchema.mjs";
import User from "../../model/userSchema.mjs";
import Wallet from "../../model/walletSchema.mjs";


//------------------checkout controller-----------------------

export const checkout = async (req, res) => {
  try {
    const email = req.session.user;
    const user = await User.findOne({ email });

    const cartDetails = await Cart.findOne({ userId: user._id }).populate(
      "items.productId"
    );

    const items = cartDetails.items;

    if (items.length === 0) {
      return res.redirect("/cart");
    }

    cartDetails.items.forEach((item) => {
      if (item.productId.isDelete === true) {
        console.log("Product is not Available , Remove product From cart");
      }
    });

    //coupon;

    const availableCoupons = await Coupon.find({
      isActive: true,
      endDate: { $gte: new Date() },
      minimumOrderAmount: { $lte: cartDetails.totalPrice },
    });

    const eligibleCoupons = availableCoupons.filter((coupon) => {
      const couponUsage = user.couponUsed.find((c) =>
        c.couponId.equals(coupon._id)
      );
      if (couponUsage) {
        return couponUsage.usageCount < coupon.usageCount;
      }
      return true;
    });

    const categories = await category.find({ isActive: true });

    res.render("user/checkout", {
      title: "checkout",
      categories,
      items: cartDetails.items,
      user: req.session.user,
      addresses: user.address,
      cartTotal: cartDetails.totalPrice,
      payableAmount: cartDetails.payableAmount,
      eligibleCoupons,
      cartDetails,
    });
  } catch (error) {
    console.log("error while rendering check out ", error);
    res.redirect("/cart");
  }
};

//------------------- coupon appling controller -------------------------

export const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const user = await User.findOne({ email: req.session.user });

    if (!user) {
      return res.redirect("/login");
    }

    const coupon = await Coupon.findById(couponCode);

    if (!coupon) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: "error",
        message: "Coupon not found",
      });
    }

    if (!coupon.isActive) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: "error",
        message: "Coupon not not active",
      });
    }
    console.log(coupon.endDate);
    
    if (!coupon.endDate > new Date()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: "error",
        message: "Coupon expired",
      });
    }

    const couponUsage = user.couponUsed.find((usage) => {
      
     return usage.couponId.toString() === coupon._id.toString();
    });

      console.log('this is applied cop :',couponUsage);
      
    if (couponUsage && couponUsage.usageCount >= coupon.usageCount) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: error,
        message: "You have reached the maximum coupon usage limit",
      });
    }

    const cart = await Cart.findOne({userId:user._id});

    if (!cart) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ status: "error", message: "cart not found" });
    }
    const total = cart.payableAmount;
    let discountedTotal = total;

    if (total < coupon.minimumOrderAmount) {
      return res.status(409).json({
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
      couponDiscount = discountAmount;
      discountedTotal = total - discountAmount;
    }

    cart.payableAmount = discountedTotal;
    cart.isCouponApplied = true;
    cart.couponDiscount = couponDiscount
    cart.couponId=couponCode

    await cart.save();
    console.log("-----",couponUsage);
    
    if(couponUsage){
      couponUsage.usageCount += 1
    }else{
      user.couponUsed.push({
        couponId:couponCode,
        usageCount:1,
      })
    }
    await user.save()

    return res
      .status(HTTP_STATUS.OK)
      .json({ status: "success", message: "coupon applied", total:discountedTotal,couponDiscount});
  } catch (error) {
    console.log(`Error in apply coupon: ${err}`);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "An error occurred while applying the coupon." });
  }

  
};

//----------------- coupon removing controller------------------------------

export const removeCoupon = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.user });

    // Find the user's cart
    if (!user) {
      return res.redirect("/login");
    }

    const cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ status: "error", message: "Cart not found" });
    }

    // Check if the coupon is applied to the cart
    if (!cart.isCouponApplied) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: "error",
        message: "No coupon is applied to the cart.",
      });
    }

    // Find the coupon usage for the user
    let appliedCouponId = cart.couponId;
    let couponUsage = user.couponUsed.find((usage) => {
      return usage.couponId.toString() === appliedCouponId.toString();
    });

    // If the coupon has been used, decrease the usage count
    if (couponUsage) {
      if (couponUsage.usageCount > 0) {
        couponUsage.usageCount -= 1;
      }
    }

    // Remove the coupon discount from the cart and recalculate the total
    const total = cart.payableAmount + cart.couponDiscount;
    cart.payableAmount = total;
    cart.isCouponApplied = false; // Coupon no longer applied
    cart.couponDiscount = 0; // Reset the coupon discount
    appliedCouponId = null;

    // Save the cart and user
    await cart.save();
    await user.save();

    return res.status(HTTP_STATUS.OK).json({
      status: "success",
      message: "Coupon removed successfully",
      total: cart.payableAmount,
    });
  } catch (error) {
    console.log(`Error in removeCoupon: ${error}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: "An error occurred while removing the coupon.",
    });
  }
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

            const { addressId, paymentMethod, cartItems, totalPrice,couponDiscountValue,razorpay_payment_id } = req.body;

            let paymentStatus 
            if(razorpay_payment_id === undefined){
              paymentStatus = 'Pending'

            }else if(paymentMethod === 'Wallet'){
              paymentStatus = 'Paid'
            }
            else{
              paymentStatus ='Paid'
            }
            
            const order_id = orderIdGenerator()
            const user = await User.findOne({email:req.session.user});

           
            let orderTotal = cartItems.reduce((sum,item)=>{
                return sum = sum + item.productPrice
            },0)
            console.log("order total = ",orderTotal);
            
           
            

            const selectedAddress = await user.address.id(addressId);;

            if (!selectedAddress) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Address not found" });
              }
             



              for(const item of cartItems){
                const product = await Product.findById(item.productId);

                if (!product) {
                    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: `Product ${item.productName} not found` });
                  }

                  if (product.stock < item.productQuantity) {
                    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: `Insufficient stock for ${item.productName}. Only ${product.stock} available.` });
                  }

              }

              const priceAfterCouponDiscount = orderTotal - couponDiscountValue

              //console.log("cart item = ",cartItems);

              console.log(cartItems.map(item=>{
                  console.log("+++++++++++++++++++++++",item.productId.category);
                  
              }));
              
              
              

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
                  priceAfterCouponDiscount:priceAfterCouponDiscount,
                  couponDiscount:couponDiscountValue,
                  paymentMethod:paymentMethod,
                  paymentStatus: paymentStatus,
                  orderStatus:"Pending"

              })

             
              

              await newOrder.save();


              for(const item of cartItems){
                const prodcut = await Product.findById(item.productId);
                prodcut.stock -= item.productQuantity;
                await prodcut.save()
              }




              //clear the particular user cart

              await Cart.findOneAndUpdate({userId:user._id},{items:[],totalPrice:0,isCouponApplied:false,couponDiscount:0,couponId:null})
              console.log(newOrder._id);
              

              res.status(HTTP_STATUS.OK).json({message:"Order placed succesfully",orderId: newOrder.order_id })





        }else{
            res.redirect('/login')
        }
        
    } catch (error) {

        console.error("Error placing order:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while placing the order" });
        
    }

}




export const walletPayment = async (req, res) => {
  console.log("hi wallet");

  try {
    if (req.session.user) {
      const user = await User.findOne({ email: req.session.user });
      const wallet = await Wallet.findOne({ userId: user._id });

      const { finalAmount } = req.body;

      if (!wallet) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ status: "error", message: "User has no wallet" });
      }

      if (finalAmount <= wallet.balance) {
        wallet.balance -= finalAmount;
        wallet.transactions.push({
          walletAmount: finalAmount,
          transactionType: "Debited",
          transactionDate: new Date(),
        });
        await wallet.save();

        return res
          .status(HTTP_STATUS.OK)
          .json({
            status: "success",
            message: "You have enough balance to place order",
          });
      } else {
      let remainingAmount = (finalAmount - wallet.balance);

        let usedWalletBalance = wallet.balance;
        wallet.balance = 0;

        wallet.transactions.push({
          walletAmount: usedWalletBalance,
          transactionType: "Debited",
          transactionDate: new Date(),
        });
        await wallet.save();
        return res
          .status(HTTP_STATUS.OK)
          .json({
            status: "partial_payment_needed",
            message: "Wallet balance is not enough. Proceed to pay the remaining amount.",
            remainingAmount:remainingAmount
          });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error while wallet payment", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({
        status: "error",
        message: "An error occurred while wallet payment ",
      });
  }
};

export const rePay = async(req,res)=>{
  try {

    if (req.session.user) {
      const {orderId} = req.body;
      console.log(orderId);

      let order = await OrderSchema.findOne({order_id:orderId});

      if(!order){
        return res.status(HTTP_STATUS.NOT_FOUND).json({status:'error',message:'order not found'})
      }

      order.paymentStatus = 'Paid';

      await order.save()

      return res.status(HTTP_STATUS.OK).json({status:'success',message:'payment status updated'});
    }else{
      res.redirect('/login')
    }
    
  } catch (error) {
    console.error('Error while repaying amount',error );
    
  }


}