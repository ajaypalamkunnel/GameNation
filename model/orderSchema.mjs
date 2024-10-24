import mongoose from "mongoose";


const orderSchema = mongoose.Schema({

    customer_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    order_id:{
        type: Number
    },
    products:[{
        product_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product"
        },
        product_name:{
            type:String
        },
        product_category:{
            type:String
        },
        product_quantity:{
            type:String
        },
        product_price:{
            type:Number
        },
        product_discount:{
            type:Number
        },
        product_status:{
            type: String,
            enum:['Confirmed', 'Pending', 'Delivered', 'Returned', 'Cancelled'],
            default:'Pending'

        }
    }],
    totalQuantity:{
        type:Number
    },
    totalPrice:{
        type:Number
    },
    priceAfterCouponDiscount:{
        type:Number,
        default:0


    },
    address: {
        contactName: String,
        building: String,
        city: String,
        district:String,
        state:String,
        country: String,
        pincode: Number,
        phonenumber:Number,
        landMark:String
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Cash on delivery','razorpay', 'Wallet']
    },
    paymentId:{
        type:String,
        required:false
    },
    paymentStatus:{
        type:String
    },
    isCancelled:{
        type:Boolean,
        default:false
    },
    couponCode:{
        type:String
    },
    couponDiscount:{
        type: Number,
        default: 0
    },
    deliveredDate:{
        type: Date,
        required:false
        

    },
    orderStatus: {
        type: String,
        enum:['Pending', 'Shipped', 'Confirmed', 'Delivered', 'Cancelled', 'Returned']
        
    }

},{timestamps:true})


const OrderSchema = mongoose.model('Order',orderSchema)

export default OrderSchema

